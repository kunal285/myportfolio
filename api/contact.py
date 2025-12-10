# api/contact.py
from http.server import BaseHTTPRequestHandler
import json
import os
from os.path import dirname, abspath, join
# import your backend helper; adjust path if needed
from backend.handle_contact import handle_contact

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8') or '{}'
        data = json.loads(body)

        # Call your backend logic (modify handle_contact signature if needed)
        try:
            result = handle_contact(data)  # should return a dict
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode())
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
