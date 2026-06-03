# MyPortfolio

A personal portfolio website showcasing projects, certifications, skills, and achievements.

## Overview

This is a static portfolio project built with HTML, CSS, and JavaScript. It includes:

- A main portfolio homepage
- Reusable dynamic project and certificate detail pages
- Gallery and testimonial sections
- Contact form integration
- Responsive layout for desktop and mobile

## Features

- Responsive and mobile-friendly interface
- Multiple themed project pages
- Certificate and achievements showcase
- JSON-driven project and certificate content
- Animation and interaction libraries (AOS, Swiper, Glightbox)
- Reusable vendor assets stored locally

## Project Structure

```text
myportfolio/
|-- index.html
|-- achievements.html
|-- project.html
|-- certificate.html
|-- starter-page.html
|-- assets/
|   |-- css/
|   |   |-- main.css
|   |   |-- Gallery.css
|   |-- js/
|   |   |-- main.js
|   |   |-- contact.js
|   |-- img/
|   |   |-- certificate/
|   |   |-- gallery/
|   |   |-- portfolio/
|   |   |-- testimonials/
|   |-- vendor/
|-- certificates/
|   |-- legacy certificate pages
|-- projects/
|   |-- legacy project pages
|-- README.md
``

## Getting Started

1. Clone the repository:

```sh
git clone https://github.com/kunal285/myportfolio.git
cd myportfolio
```

2. Open index.html directly in your browser.

	- Projects now open through project.html?id=slug.
	- Certificates now open through certificate.html?id=slug.
	- To add new content, edit assets/data/projects.json or assets/data/certificates.json and add a new object.

Optional local server:

```sh
python -m http.server 5500
```

Then open http://localhost:5500.

## Customization Guide

- Update content: edit the relevant HTML files in the root, certificates/, or projects/ folders.
- Update styles: modify assets/css/main.css.
- Update scripts: edit assets/js/main.js and assets/js/contact.js.
- Update images: place files in assets/img and use relative paths.

## Contact Form and API

The frontend form behavior is handled by assets/js/contact.js.

If you are using backend endpoints, these routes are expected:

- /api/contact
- /api/health

For local API testing, set this before loading contact.js:

```js
window.CONTACT_API_BASE = "http://localhost:5000";
```

## Deployment

### Static hosting

You can deploy this portfolio as-is on any static host:

- GitHub Pages
- Netlify
- Vercel (static output)

### Vercel with API support

If using serverless API routes, configure these variables:

- BREVO_API_KEY
- BREVO_SENDER_EMAIL
- BREVO_SENDER_NAME (optional)
- BREVO_RECIPIENT_EMAIL (optional)

Deploy with:

```sh
vercel deploy --prod
```

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap
- AOS
- Swiper
- Glightbox
- Isotope Layout
- ImagesLoaded

## License

This project is for personal and educational use. Feel free to customize it for your own portfolio. If you reorganize or add new certificate or project pages, update the navigation and README accordingly.

---

Created by Kunal Gavit.
