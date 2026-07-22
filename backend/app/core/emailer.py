"""
Simple SMTP email sender for OTP emails.

Configure via env vars (e.g. Gmail with an App Password):
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=youraddress@gmail.com
  SMTP_PASSWORD=<16-char app password>
  SMTP_FROM="Smart City <youraddress@gmail.com>"   (optional)

If SMTP is not configured, emails are printed to the server log instead —
useful in development so the flow still works.
"""

import os
import smtplib
from email.mime.text import MIMEText

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)


def is_configured() -> bool:
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD)


def send_email(to: str, subject: str, body: str) -> bool:
    """Send a plain-text email. Returns True on success."""
    if not is_configured():
        # Dev fallback: log the email so the OTP flow is still testable.
        print(f"[emailer] SMTP not configured. Would send to {to}:\n"
              f"Subject: {subject}\n{body}")
        return True

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM, [to], msg.as_string())
        return True
    except Exception as e:  # noqa: BLE001 — never crash the API over email
        print(f"[emailer] Failed to send email to {to}: {e}")
        return False


def send_otp_email(to: str, otp: str) -> bool:
    return send_email(
        to,
        "Smart City — Password Reset Code",
        f"Your password reset code is: {otp}\n\n"
        f"This code is valid for 10 minutes.\n"
        f"If you did not request this, you can ignore this email.\n\n"
        f"— Smart City Team",
    )
