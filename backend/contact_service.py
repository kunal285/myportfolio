from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Tuple

from dotenv import load_dotenv
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

load_dotenv()

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_SUBMISSIONS_DIR = BASE_DIR / "contact_submissions"

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Portfolio Contact Bot")
BREVO_RECIPIENT_EMAIL = os.getenv("BREVO_RECIPIENT_EMAIL", BREVO_SENDER_EMAIL)

REQUIRED_FIELDS = ("name", "email", "subject", "message")


class ContactValidationError(ValueError):
    """Raised when an incoming contact submission is invalid."""


def _submission_dir() -> Path:
    custom_dir = os.getenv("CONTACT_SUBMISSIONS_DIR")
    if custom_dir:
        return Path(custom_dir)
    if os.getenv("VERCEL"):
        return Path("/tmp/contact_submissions")
    return DEFAULT_SUBMISSIONS_DIR


def sanitize_payload(payload: Dict[str, Any] | None) -> Dict[str, str]:
    if payload is None:
        raise ContactValidationError("Request body is missing.")

    cleaned: Dict[str, str] = {}
    for field in REQUIRED_FIELDS:
        value = str(payload.get(field, "")).strip()
        if not value:
            raise ContactValidationError("All fields are required.")
        cleaned[field] = value

    if "@" not in cleaned["email"] or "." not in cleaned["email"]:
        raise ContactValidationError("Invalid email address.")

    return cleaned


def save_submission(payload: Dict[str, str]) -> bool:
    directory = _submission_dir()
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
    filename = directory / f"contact_{timestamp}.json"

    try:
        directory.mkdir(parents=True, exist_ok=True)
        with open(filename, "w", encoding="utf-8") as handle:
            json.dump(
                {
                    "timestamp": datetime.utcnow().isoformat(),
                    **payload,
                },
                handle,
                indent=2,
            )
        return True
    except OSError as exc:
        LOGGER.warning("Unable to persist submission backup: %s", exc)
        return False


def send_email_notification(name: str, email: str, subject: str, message: str) -> None:
    if not BREVO_API_KEY or not BREVO_SENDER_EMAIL:
        raise RuntimeError("Brevo API credentials are not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.")

    recipient_email = BREVO_RECIPIENT_EMAIL or BREVO_SENDER_EMAIL

    html = f"""
    <html>
      <body style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333;\">
        <div style=\"max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;\">
          <h2 style=\"color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;\">
            New Contact Form Submission
          </h2>
          <div style=\"margin: 20px 0;\">
            <p style=\"margin: 10px 0;\"><strong style=\"color: #2c3e50;\">Name:</strong> {name}</p>
            <p style=\"margin: 10px 0;\"><strong style=\"color: #2c3e50;\">Email:</strong> <a href=\"mailto:{email}\" style=\"color: #3498db;\">{email}</a></p>
            <p style=\"margin: 10px 0;\"><strong style=\"color: #2c3e50;\">Subject:</strong> {subject}</p>
          </div>
          <div style=\"background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;\">
            <p style=\"margin: 0;\"><strong style=\"color: #2c3e50;\">Message:</strong></p>
            <p style=\"margin: 10px 0 0 0;\">{message}</p>
          </div>
          <hr style=\"border: none; border-top: 1px solid #ddd; margin: 20px 0;\">
          <p style=\"font-size: 12px; color: #7f8c8d; margin: 10px 0;\">
            Received on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
          </p>
        </div>
      </body>
    </html>
    """

    text = f"""
    New Contact Form Submission\n\nName: {name}\nEmail: {email}\nSubject: {subject}\n\nMessage:\n{message}\n\n---\nReceived on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
    """

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key["api-key"] = BREVO_API_KEY

    api_client = sib_api_v3_sdk.ApiClient(configuration)
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(api_client)

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=[{"email": recipient_email, "name": BREVO_SENDER_NAME}],
        sender={"email": BREVO_SENDER_EMAIL, "name": BREVO_SENDER_NAME},
        reply_to={"email": email, "name": name or "Portfolio Visitor"},
        subject=f"Portfolio Contact: {subject}",
        html_content=html,
        text_content=text,
    )

    try:
        api_instance.send_transac_email(send_smtp_email)
    except ApiException as exc:
        raise RuntimeError(f"Brevo API error: {exc}") from exc


def process_contact_submission(payload: Dict[str, Any] | None) -> Tuple[int, Dict[str, Any]]:
    try:
        cleaned = sanitize_payload(payload)
    except ContactValidationError as exc:
        return 400, {"success": False, "message": str(exc)}
    except Exception:
        LOGGER.exception("Unable to parse contact payload")
        return 400, {"success": False, "message": "Invalid request payload."}

    submission_saved = save_submission(cleaned)

    email_sent = False
    try:
        send_email_notification(**cleaned)
        email_sent = True
    except Exception as exc:
        LOGGER.error("Email sending failed: %s", exc)

    return 200, {
        "success": True,
        "message": "Your message has been sent. Thank you!",
        "email_sent": email_sent,
        "submission_saved": submission_saved,
    }


def health_payload() -> Dict[str, Any]:
    return {
        "status": "ok",
        "email_configured": bool(BREVO_API_KEY and BREVO_SENDER_EMAIL),
    }
