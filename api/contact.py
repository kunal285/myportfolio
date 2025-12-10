from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler
from typing import Any, Dict
from urllib.parse import parse_qs

from backend.contact_service import process_contact_submission


def _coerce_payload(body: bytes, content_type: str | None) -> Dict[str, Any]:
    if not body:
        return {}

    content_type = (content_type or "").lower()

    if "application/json" in content_type:
        try:
            return json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    if "application/x-www-form-urlencoded" in content_type:
        parsed = parse_qs(body.decode("utf-8"))
        return {key: values[0] if values else "" for key, values in parsed.items()}

    return {}


class handler(BaseHTTPRequestHandler):
    def _send_headers(self, status_code: int) -> None:
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _respond(self, status_code: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self._send_headers(status_code)
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:  # noqa: N802 (BaseHTTPRequestHandler naming)
        self._send_headers(204)

    def do_POST(self) -> None:  # noqa: N802
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length) if length else b""
        payload = _coerce_payload(body, self.headers.get("Content-Type"))

        status_code, response = process_contact_submission(payload)
        self._respond(status_code, response)
