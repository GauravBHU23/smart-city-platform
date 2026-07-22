"""
Simple in-memory rate limiter for brute-force protection on login.

Good enough for a single-process deployment (Render free tier). For a
multi-instance deployment, swap this for a Redis-backed limiter.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

# Allow MAX_ATTEMPTS failed logins per WINDOW_SECONDS per IP+email.
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 300  # 5 minutes

_attempts: dict[str, deque] = defaultdict(deque)


def _key(request: Request, email: str) -> str:
    ip = request.client.host if request.client else "unknown"
    return f"{ip}:{email.lower()}"


def check_login_allowed(request: Request, email: str) -> None:
    """Raise 429 if this IP+email has too many recent failed attempts."""
    key = _key(request, email)
    now = time.monotonic()
    q = _attempts[key]
    # Drop attempts older than the window.
    while q and now - q[0] > WINDOW_SECONDS:
        q.popleft()
    if len(q) >= MAX_ATTEMPTS:
        retry_in = int(WINDOW_SECONDS - (now - q[0])) + 1
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed login attempts. Try again in {retry_in} seconds.",
        )


def record_failed_login(request: Request, email: str) -> None:
    _attempts[_key(request, email)].append(time.monotonic())


def reset_login_attempts(request: Request, email: str) -> None:
    _attempts.pop(_key(request, email), None)
