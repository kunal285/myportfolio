# MyPortfolio

A personal portfolio website showcasing my projects, skills, and achievements.

## Features

- Responsive design for desktop and mobile
- Project and certificate galleries
- Testimonials section
- Contact form
- Multiple themed pages (AI Bootcamp, Currency Converter, Full Stack, Java with DSA, Python, etc.)

## Project Structure

```
myportfolio/
├── index.html
├── aibootcamp.html
├── currencyconverter.html
├── fullstack.html
├── Javawithdsa.html
├── python1.html
├── python2.html
├── starter-page.html
├── valentine.html
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── img/
│   │   ├── log.jpg
│   │   ├── my.jpg
│   │   ├── my2.jpg
│   │   ├── certificate/
│   │   ├── portfolio/
│   │   └── testimonials/
│   ├── js/
│   │   └── main.js
│   └── vendor/
│       ├── aos/
│       ├── bootstrap/
│       ├── bootstrap-icons/
│       ├── glightbox/
│       ├── imagesloaded/
│       ├── isotope-layout/
│       └── php-email-form/
└── README.md
```

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/kunal285/myportfolio.git
   cd myportfolio
   ```
2. **Open `index.html` in your browser** to view the portfolio.

## Customization

- **Update images:** Place your images in `assets/img/`
- **Edit styles:** Modify `assets/css/main.css`
- **Add or modify content:** Update the HTML files for your projects, certificates, and other sections

## Deploying to Vercel

1. **Install the Vercel CLI (one-time):**
   ```sh
   npm install -g vercel
   ```
2. **Link and configure the project:**
   ```sh
   vercel link
   ```
3. **Add the required environment variables inside Vercel (`Settings → Environment Variables` or via CLI):**
   - `BREVO_API_KEY`
   - `BREVO_SENDER_EMAIL`
   - `BREVO_SENDER_NAME` (optional, defaults to `Portfolio Contact Bot`)
   - `BREVO_RECIPIENT_EMAIL` (defaults to sender email if omitted)
4. **Deploy:**
   ```sh
   vercel deploy --prod
   ```

### How it works on Vercel

- Static pages (all `.html`, CSS, JS, and assets) are served directly from the root of the repo.
- The contact form sends requests to `/api/contact`, which is backed by the Python serverless function defined in `api/contact.py`.
- Health checks are available at `/api/health` and share the same logic used locally (`backend/contact_handler.py`).
- For local previews without a dev server you can still run `python -m backend.contact_handler` and set `window.CONTACT_API_BASE = "http://localhost:5000"` before loading `assets/js/contact.js`.

## Dependencies

- Bootstrap
- AOS
- Glightbox
- Isotope Layout
- Swiper
- ImagesLoaded

## License

This project is for personal use. Feel free to customize and use it for your own portfolio.

---

Created by Kunal Gavit.
