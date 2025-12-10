from __future__ import annotations

from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    from backend.contact_service import (
        process_contact_submission,
        health_payload,
    )
except ImportError:  # Allows running the file directly from the backend folder
    from contact_service import (  # type: ignore
        process_contact_submission,
        health_payload,
    )

app = Flask(__name__)
CORS(app)


@app.route('/api/contact', methods=['POST'])
def handle_contact() -> tuple[dict[str, object], int]:
    payload = request.get_json(silent=True)
    if payload is None:
        payload = request.form.to_dict()

    status_code, response = process_contact_submission(payload)
    return jsonify(response), status_code


@app.route('/api/health', methods=['GET'])
def health_check() -> tuple[dict[str, object], int]:
    return jsonify(health_payload()), 200


if __name__ == '__main__':
    print("Starting Contact Form API on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
