from __future__ import annotations

import json
from http.server import BaseHTTPRequestHandler
from typing import Any, Dict

from backend.contact_service import health_payload


class handler(BaseHTTPRequestHandler):
    def _send_headers(self, status_code: int) -> None:
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _respond(self, status_code: int, payload: Dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self._send_headers(status_code)
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._send_headers(204)

    def do_GET(self) -> None:  # noqa: N802
        self._respond(200, health_payload())
}