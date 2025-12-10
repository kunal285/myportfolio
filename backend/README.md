# Portfolio Contact Form Backend

This is a Python Flask backend for handling contact form submissions from your portfolio website.

## Features

- ✅ Handles contact form submissions via REST API
- ✅ Sends email notifications when someone contacts you
- ✅ Saves all submissions to JSON files for backup
- ✅ CORS enabled for frontend integration
- ✅ Input validation and error handling
- ✅ HTML formatted emails
- ✅ Powered by Brevo (Sendinblue) transactional email API

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
# or from the project root
pip install -r ../requirements.txt
```

### 2. Configure Brevo Email Settings

1. Create a free account at [brevo.com](https://www.brevo.com/) (formerly Sendinblue).
2. In your Brevo dashboard go to **SMTP & API** → **API Keys** → **Generate a new API key**.
3. Copy the generated key and store it securely.

4. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

5. Edit `.env` and add your Brevo credentials:
```
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=kunalgavit285@gmail.com
BREVO_SENDER_NAME=Portfolio Contact Bot
BREVO_RECIPIENT_EMAIL=kunalgavit285@gmail.com
```

> `BREVO_RECIPIENT_EMAIL` defaults to the sender email. Set it if you want messages forwarded somewhere else (e.g., a different inbox).

### 3. Run the Backend Server

```bash
python -m backend.contact_handler
```

The server will start on `http://localhost:5000`.

> Tip: when running locally, set `window.CONTACT_API_BASE = "http://localhost:5000";` before loading `assets/js/contact.js` if you are previewing HTML files directly (e.g., via Live Server) so the form points to your local API.

### 4. Update Your HTML

Add the contact.js script to your `index.html` before the closing `</body>` tag:

```html
<script src="assets/js/contact.js"></script>
```

## API Endpoints

### POST /api/contact
Submit contact form data

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Question about your work",
    "message": "Hello, I'd like to discuss..."
}
```

**Response:**
```json
{
    "success": true,
    "message": "Your message has been sent. Thank you!",
    "email_sent": true
}
```

### GET /api/health
Health check endpoint

**Response:**
```json
{
    "status": "ok",
    "message": "Contact form API is running"
}
```

## Testing

You can test the API using curl:

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

## Deployment

### For Production:

1. Use a production WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 contact_handler:app
```

2. Set up environment variables on your server
3. Use a reverse proxy (nginx/Apache) in front of the Flask app
4. Enable HTTPS for secure communication

### Deploying to Vercel

Vercel now serves the contact API through the serverless function in `api/contact.py`, which imports the shared logic from `backend/contact_service.py`. To deploy:

1. Add the required Brevo environment variables (`BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `BREVO_RECIPIENT_EMAIL`) in the Vercel dashboard.
2. Commit the repository changes and run `vercel deploy --prod` from the project root.
3. The frontend will call `/api/contact` automatically (configured in `assets/js/contact.js`).

You can still deploy the Flask app to platforms like Heroku or Render if you prefer, but Vercel is now the default path.

## Security Notes

- Never commit `.env` file to Git
- Treat your Brevo API key like a password—store it securely and rotate it if exposed
- Consider using managed email services like Brevo, SendGrid, or Mailgun for production scaling
- Implement rate limiting to prevent spam
- Add CAPTCHA for additional security

## Troubleshooting

**Email not sending:**
- Verify the Brevo API key is valid and has not been revoked
- Confirm the sender email is authorized/verified in Brevo (Transactional -> Senders & IP)
- Check your Brevo account is not in "paused" status or out of quota

**CORS errors:**
- Make sure Flask-CORS is installed
- Check that the frontend URL is allowed

**Connection refused:**
- Ensure the Python server is running
- Check firewall settings
- Verify the port 5000 is available

## Files Created

- `contact_handler.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `.env.example` - Environment variables template
- `contact_submissions/` - Directory for storing submissions
- `../assets/js/contact.js` - Frontend JavaScript handler

## Support

For issues or questions, contact: kunalgavit285@gmail.com
