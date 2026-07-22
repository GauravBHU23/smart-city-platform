"""
Send push notifications via Expo's push service (free, no API key needed).

The mobile app registers its Expo push token at POST /auth/push-token;
we send to https://exp.host/push/api/v2/push when a complaint updates.
Failures are logged and never crash the API.
"""

import json
import urllib.request

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

STATUS_MESSAGES = {
    "UNDER_REVIEW": "Your complaint is now under review.",
    "ASSIGNED": "An officer has been assigned to your complaint.",
    "IN_PROGRESS": "Work on your complaint is in progress.",
    "RESOLVED": "Good news! Your complaint has been resolved. 🎉",
    "CLOSED": "Your complaint has been closed.",
}


def send_push(token: str, title: str, body: str, data: dict | None = None) -> bool:
    """Send one push notification. Returns True if accepted by Expo."""
    if not token or not token.startswith("ExponentPushToken"):
        return False

    payload = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
        "data": data or {},
    }
    try:
        req = urllib.request.Request(
            EXPO_PUSH_URL,
            data=json.dumps(payload).encode(),
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as res:
            return res.status == 200
    except Exception as e:  # noqa: BLE001 — notifications must never break the API
        print(f"[push] Failed to send push notification: {e}")
        return False


def notify_status_change(user, complaint, new_status: str, note: str | None = None):
    """Notify the complaint's owner about a status change (best-effort)."""
    if not user or not user.push_token:
        return
    body = STATUS_MESSAGES.get(new_status, f"Status updated to {new_status}.")
    if note:
        body += f"\nNote: {note}"
    send_push(
        user.push_token,
        f"Complaint #{complaint.id}: {complaint.title[:40]}",
        body,
        data={"complaint_id": complaint.id},
    )
