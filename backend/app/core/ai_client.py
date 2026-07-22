"""
Thin client for the AI microservice (ai-service, default port 8020).
Every call fails soft: if the AI service is down, complaints still work —
we just skip the AI enrichment.
"""

import os

import urllib.error
import urllib.request
import json

AI_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8020")
TIMEOUT = 3  # seconds


def _post(path: str, body: dict):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{AI_URL}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return json.loads(resp.read().decode())


def analyze(text: str) -> dict | None:
    """Return {category, priority, ...} or None if the AI service is unavailable."""
    try:
        return _post("/analyze", {"text": text})
    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        return None


def check_duplicate(text: str, existing: list[dict]) -> dict | None:
    try:
        return _post("/check-duplicate", {"text": text, "existing": existing})
    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        return None
