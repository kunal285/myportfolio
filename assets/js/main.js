

(function() {
  "use strict";

  const htmlElement = document.documentElement;
  const bodyElement = document.body;
  const storageAvailable = (() => {
    try {
      const testKey = '__portfolio_storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  })();
  const cachedJson = new Map();
  const themeStorageKey = 'portfolio-theme';

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));

  const slugify = (value) => String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const normalizeIdentifier = (value) => slugify(value).replace(/-/g, '');
  const HOME_ROUTE = '/';
  const PROJECTS_ROUTE = '/projects';
  const CERTIFICATE_ROUTE = '/certificate';

  const readStoredTheme = () => {
    if (!storageAvailable) return 'light';
    return window.localStorage.getItem(themeStorageKey) || 'light';
  };

  const applyTheme = (theme) => {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    htmlElement.dataset.theme = nextTheme;

    if (storageAvailable) {
      window.localStorage.setItem(themeStorageKey, nextTheme);
    }

    const themeToggle = document.querySelector('[data-theme-toggle]');

    if (themeToggle) {
      const isDark = nextTheme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      themeToggle.innerHTML = isDark
        ? '<i class="bi bi-sun-fill" aria-hidden="true"></i><span class="visually-hidden">Switch to light theme</span>'
        : '<i class="bi bi-moon-stars-fill" aria-hidden="true"></i><span class="visually-hidden">Switch to dark theme</span>';
    }
  };

  const showToast = (message, variant = 'info') => {
    let container = document.querySelector('.app-toast-container');

    if (!container) {
      container = document.createElement('div');
      container.className = 'app-toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `app-toast app-toast--${variant}`;
    toast.innerHTML = `
      <div class="app-toast__icon" aria-hidden="true"><i class="bi bi-info-circle"></i></div>
      <p class="app-toast__message">${escapeHtml(message)}</p>
      <button type="button" class="app-toast__close" aria-label="Dismiss notification">&times;</button>
    `;

    const closeToast = () => {
      toast.classList.add('is-hiding');
      window.setTimeout(() => toast.remove(), 220);
    };

    toast.querySelector('.app-toast__close')?.addEventListener('click', closeToast);
    container.appendChild(toast);

    window.setTimeout(closeToast, 3500);
  };

  const updateMetaTag = (attributeName, attributeValue, content, extraAttributes = {}) => {
    if (!content) return;

    let element = document.head.querySelector(`[${attributeName}="${attributeValue}"]`);

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attributeName, attributeValue);
      document.head.appendChild(element);
    }

    Object.entries(extraAttributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });

    element.setAttribute('content', content);
  };

  const setDocumentMeta = ({ title, description, image, canonicalUrl, type, jsonLd }) => {
    if (title) {
      document.title = title;
    }

    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'theme-color', '#149ddd');
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', type || 'website');

    if (image) {
      updateMetaTag('property', 'og:image', image);
      updateMetaTag('name', 'twitter:image', image);
    }

    updateMetaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');

    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }

    if (canonicalUrl) {
      canonicalLink.setAttribute('href', canonicalUrl);
    }

    let structuredData = document.getElementById('detail-jsonld');

    if (structuredData) {
      structuredData.remove();
    }

    if (jsonLd) {
      structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      structuredData.id = 'detail-jsonld';
      structuredData.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(structuredData);
    }
  };

  const loadJson = async (sourcePath) => {
    if (cachedJson.has(sourcePath)) {
      return cachedJson.get(sourcePath);
    }

    const response = await fetch(sourcePath, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch ${sourcePath}`);
    }

    const data = await response.json();
    cachedJson.set(sourcePath, data);
    return data;
  };

  const ensureThemeToggle = () => {
    const header = document.querySelector('#header .social-links');

    if (!header || document.querySelector('[data-theme-toggle]')) {
      return;
    }

    const themeToggle = document.createElement('button');
    themeToggle.type = 'button';
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('data-theme-toggle', 'true');
    themeToggle.setAttribute('aria-label', 'Switch to dark theme');
    themeToggle.setAttribute('aria-pressed', 'false');
    themeToggle.innerHTML = '<i class="bi bi-moon-stars-fill" aria-hidden="true"></i><span class="visually-hidden">Switch to dark theme</span>';
    themeToggle.addEventListener('click', () => {
      const nextTheme = htmlElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(`${nextTheme === 'dark' ? 'Dark' : 'Light'} theme enabled`, 'success');
    });

    header.appendChild(themeToggle);
  };

  applyTheme(readStoredTheme());
  ensureThemeToggle();
  window.addEventListener('DOMContentLoaded', ensureThemeToggle);

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    const header = document.querySelector('#header');

    if (!header || !headerToggleBtn) {
      return;
    }

    header.classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
  }

  if (headerToggleBtn) {
    headerToggleBtn.addEventListener('click', headerToggle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }

  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Top scroll progress indicator
   */
  const scrollProgress = document.querySelector('#scroll-progress');

  function updateScrollProgress() {
    if (!scrollProgress) return;

    const doc = document.documentElement;
    const maxScrollable = doc.scrollHeight - doc.clientHeight;
    const progress = maxScrollable > 0 ? (window.scrollY / maxScrollable) * 100 : 0;

    scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  window.addEventListener('load', updateScrollProgress);
  window.addEventListener('resize', updateScrollProgress);
  document.addEventListener('scroll', updateScrollProgress);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    if (typeof AOS === 'undefined') return;

    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Local time badge for hero section
   */
 const localTimePill = document.querySelector("#local-time-pill");

if (localTimePill) {
  const updateLocalTime = () => {
    const formatted = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true // Change to false for 24-hour format
    });

    localTimePill.innerHTML = `
      <i class="bi bi-clock-history" aria-hidden="true"></i>
      Local Time: ${formatted}
    `;
  };

  updateLocalTime();

  // Update every minute
  setInterval(updateLocalTime, 60000);
}
  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== 'undefined') {
    new PureCounter();
  }

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    if (typeof Waypoint === 'undefined') return;

    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  // Automatic Age Calculation
const ageElement = document.getElementById("age");

if (ageElement) {
  const birthDate = new Date("2005-08-02"); // YYYY-MM-DD

  const calculateAge = () => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    ageElement.textContent = age;
  };

  calculateAge();
}
  /**
   * Initiate glightbox
   */
  let glightbox = typeof GLightbox !== 'undefined' ? GLightbox({
    selector: '.glightbox'
  }) : null;

  const buildPortfolioItemMarkup = (project) => {
    const filterClass = String(project.category || 'filter-product').trim();
    const title = escapeHtml(project.title || 'Untitled project');
    const description = escapeHtml(project.description || 'Project details');
    const slug = String(project.slug || '').trim();
    const image = String(project.image || '').trim();
    const previewImage = String(project.previewImage || image).trim();
    const detailsUrl = String(project.detailsUrl || (slug ? `${PROJECTS_ROUTE}?id=${encodeURIComponent(slug)}` : '#')).trim();
    const gallery = `portfolio-gallery-${slugify(project.slug || project.title || 'project')}`;
    const alt = escapeHtml(project.alt || `${project.title || 'Project'} preview`);
    const searchableText = escapeHtml([
      project.title,
      project.description,
      project.tech,
      Array.isArray(project.tags) ? project.tags.join(' ') : ''
    ].join(' ').toLowerCase());

    return `
      <div class="col-lg-4 col-md-6 portfolio-item isotope-item ${escapeHtml(filterClass)}" data-search="${searchableText}">
        <div class="portfolio-content h-100">
          <img src="${image}" class="img-fluid" alt="${alt}" loading="lazy" decoding="async">
          <div class="portfolio-info">
            <h4>${title}</h4>
            <p>${description}</p>
            <a href="${previewImage}" title="${title}" data-gallery="${gallery}" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>
            <a href="${detailsUrl}" title="More Details" class="details-link"><i class="bi bi-link-45deg"></i></a>
          </div>
        </div>
      </div>
    `;
  };

  const buildPortfolioSkeletonMarkup = (count = 6) => Array.from({ length: count }).map(() => `
    <div class="col-lg-4 col-md-6 portfolio-item isotope-item is-skeleton">
      <div class="portfolio-content h-100 skeleton-card">
        <div class="skeleton-media"></div>
        <div class="portfolio-info">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
      </div>
    </div>
  `).join('');

  const renderPortfolioProjects = async (isotopeItem) => {
    const sourcePath = isotopeItem.getAttribute('data-projects-source');
    const container = isotopeItem.querySelector('.isotope-container');

    if (!sourcePath || !container) return;

    try {
      container.innerHTML = buildPortfolioSkeletonMarkup();

      const projects = await loadJson(sourcePath);

      if (!Array.isArray(projects)) {
        throw new Error('Portfolio source must be an array');
      }

      container.innerHTML = projects.map(buildPortfolioItemMarkup).join('');

      if (glightbox && typeof glightbox.reload === 'function') {
        glightbox.reload();
      }
    } catch (error) {
      console.error('Failed to load portfolio projects from JSON:', error);
      container.innerHTML = '<div class="col-12"><p class="portfolio-empty">Unable to load projects right now.</p></div>';
      showToast('Projects could not be loaded right now.', 'warning');
    }
  };

  const buildCertificateItemMarkup = (certificate, index) => {
    const title = escapeHtml(certificate.title || 'Untitled Certificate');
    const description = escapeHtml(certificate.description || 'Certificate details');
    const slug = String(certificate.slug || '').trim();
    const url = String(certificate.url || (slug ? `${CERTIFICATE_ROUTE}?id=${encodeURIComponent(slug)}` : '#')).trim();
    const iconClass = escapeHtml(certificate.icon || 'bi bi-award');
    const aosDelay = 100 + ((index % 6) * 100);

    return `
      <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="${aosDelay}">
        <div class="icon flex-shrink-0"><i class="${iconClass}"></i></div>
        <div>
          <h4 class="title"><a href="${url}" class="stretched-link">${title}</a></h4>
          <p class="description">${description}</p>
        </div>
      </div>
    `;
  };

  const buildCertificateSkeletonMarkup = (count = 5) => Array.from({ length: count }).map(() => `
    <div class="col-lg-4 col-md-6 service-item d-flex is-skeleton" data-aos="fade-up">
      <div class="icon flex-shrink-0 skeleton-icon"></div>
      <div class="skeleton-copy">
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line--short"></div>
      </div>
    </div>
  `).join('');

  const renderCertificates = async () => {
    const containers = document.querySelectorAll('.certificates-container[data-certificates-source]');

    if (containers.length === 0) return;

    for (const container of containers) {
      const sourcePath = container.getAttribute('data-certificates-source');
      const limitValue = Number.parseInt(container.getAttribute('data-certificates-limit') || '', 10);

      if (!sourcePath) continue;

      try {
        container.innerHTML = buildCertificateSkeletonMarkup(Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 5);

        const certificates = await loadJson(sourcePath);

        if (!Array.isArray(certificates)) {
          throw new Error('Certificates source must be an array');
        }

        const itemsToRender = Number.isFinite(limitValue) && limitValue > 0
          ? certificates.slice(0, limitValue)
          : certificates;

        container.innerHTML = itemsToRender.map((certificate, index) => buildCertificateItemMarkup(certificate, index)).join('');

        bindRevealCards(container);
      } catch (error) {
        console.error('Failed to load certificates from JSON:', error);
        container.innerHTML = '<div class="col-12"><p class="portfolio-empty">Unable to load certificates right now.</p></div>';
        showToast('Certificates could not be loaded right now.', 'warning');
      }
    }

    if (typeof AOS !== 'undefined' && typeof AOS.refreshHard === 'function') {
      AOS.refreshHard();
    }
  };

  const getDetailId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('slug') || params.get('name') || '';
  };

  const getDetailContext = (kind) => {
    if (kind === 'project') {
      return {
        title: 'Project Details',
        pageTitle: 'Project Details',
        source: 'assets/data/projects.json',
        fallbackRoute: '/#portfolio',
        fallbackLabel: 'Back to projects',
        itemLabel: 'project',
        homeHref: HOME_ROUTE
      };
    }

    return {
      title: 'Certificate Details',
      pageTitle: 'Certificate Details',
      source: 'assets/data/certificates.json',
      fallbackRoute: '/#services',
      fallbackLabel: 'Back to achievements',
      itemLabel: 'certificate',
      homeHref: HOME_ROUTE
    };
  };

  const normalizeGallery = (item) => {
    const gallery = Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [];

    if (gallery.length > 0) {
      return gallery;
    }

    const fallbackImage = item.image || item.previewImage;

    return fallbackImage ? [fallbackImage] : [];
  };

  const buildDetailSlider = (item, kind) => {
    const slides = normalizeGallery(item);
    const title = escapeHtml(item.title || 'Untitled');

    return `
      <div class="${kind}-details-slider swiper init-swiper">
        <script type="application/json" class="swiper-config">
          {
            "loop": ${slides.length > 1 ? 'true' : 'false'},
            "speed": 600,
            "autoplay": {
              "delay": 5000
            },
            "slidesPerView": "auto",
            "pagination": {
              "el": ".swiper-pagination",
              "type": "bullets",
              "clickable": true
            }
          }
        </script>
        <div class="swiper-wrapper align-items-center">
          ${slides.map((slide) => `
            <div class="swiper-slide">
              <img src="${escapeHtml(slide)}" alt="${title}" loading="lazy" decoding="async">
            </div>
          `).join('')}
        </div>
        <div class="swiper-pagination"></div>
      </div>
    `;
  };

  const buildFeatureList = (features = []) => {
    if (!Array.isArray(features) || features.length === 0) {
      return '';
    }

    return `
      <ul>
        ${features.map((feature) => `
          <li><i class="bi bi-check-circle" aria-hidden="true"></i> <span>${escapeHtml(feature)}</span></li>
        `).join('')}
      </ul>
    `;
  };

  const buildProjectDetailMarkup = (project) => {
    const title = escapeHtml(project.title || 'Project');
    const summary = escapeHtml(project.summary || project.description || 'Project details');
    const description = escapeHtml(project.description || summary);
    const category = escapeHtml(project.categoryLabel || project.category || 'Project');
    const projectDate = escapeHtml(project.projectDate || 'Available now');
    const tech = escapeHtml(project.tech || 'Web stack');
    const liveUrl = String(project.liveUrl || project.projectUrl || '').trim();
    const features = Array.isArray(project.features) && project.features.length > 0
      ? project.features
      : [description, tech, category];

    return `
      <div class="row gy-4">
        <div class="col-lg-8">
          ${buildDetailSlider(project, 'portfolio')}
        </div>

        <div class="col-lg-4">
          <div class="portfolio-info" data-aos="fade-up" data-aos-delay="200">
            <h3>Project information</h3>
            <ul>
              <li><strong>Category</strong>: ${category}</li>
              <li><strong>Project date</strong>: ${projectDate}</li>
              <li><strong>Tech stack</strong>: ${tech}</li>
              ${liveUrl && liveUrl !== '#' ? `<li><strong>Project URL</strong>: <a href="${escapeHtml(liveUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(liveUrl)}</a></li>` : ''}
            </ul>
          </div>

          <div class="portfolio-description" data-aos="fade-up" data-aos-delay="300">
            <h2>${title}</h2>
            <p>${summary}</p>
            <p>${description}</p>
            ${buildFeatureList(features)}
            <div class="detail-actions">
              <a href="/#portfolio" class="btn btn-outline-primary">Back to projects</a>
              ${liveUrl && liveUrl !== '#' ? `<a href="${escapeHtml(liveUrl)}" class="btn btn-primary" target="_blank" rel="noreferrer noopener">Open live project</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const buildCertificateDetailMarkup = (certificate) => {
    const title = escapeHtml(certificate.title || 'Certificate');
    const summary = escapeHtml(certificate.summary || certificate.description || 'Certificate details');
    const description = escapeHtml(certificate.description || summary);
    const issuer = escapeHtml(certificate.issuer || 'Issuer not specified');
    const issueDate = escapeHtml(certificate.issueDate || 'Available now');
    const category = escapeHtml(certificate.categoryLabel || 'Certification');
    const credentialUrl = String(certificate.credentialUrl || certificate.externalUrl || '').trim();
    const highlights = Array.isArray(certificate.highlights) && certificate.highlights.length > 0
      ? certificate.highlights
      : [description, issuer, issueDate];
    const certificateTabs = Array.isArray(certificate.allCertificates)
      ? certificate.allCertificates.map((item) => {
          const itemTitle = escapeHtml(item.title || 'Certificate');
          const itemSlug = String(item.slug || item.title || '').trim();
          const itemUrl = itemSlug ? `${CERTIFICATE_ROUTE}?id=${encodeURIComponent(itemSlug)}` : CERTIFICATE_ROUTE;
          const isActive = normalizeIdentifier(item.slug) === normalizeIdentifier(certificate.slug) || normalizeIdentifier(item.title) === normalizeIdentifier(certificate.title);

          return `<a href="${itemUrl}" class="${isActive ? 'active' : ''}">${itemTitle}</a>`;
        }).join('')
      : `<a href="/#services" class="active">${title}</a>`;

    return `
      <div class="row gy-4">
        <div class="col-lg-4" data-aos="fade-up" data-aos-delay="100">
          <div class="services-list">
            ${certificateTabs}
            <a href="${HOME_ROUTE}">Home</a>
          </div>
          <h4>${title} Certification</h4>
          <p>${summary}</p>
        </div>

        <div class="col-lg-8" data-aos="fade-up" data-aos-delay="200">
          ${buildDetailSlider(certificate, 'service')}
          <h3>${title}</h3>
          <p><strong>Issuer:</strong> ${issuer}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Issue date:</strong> ${issueDate}</p>
          <p>${description}</p>
          ${buildFeatureList(highlights)}
          ${credentialUrl && credentialUrl !== '#' ? `<p class="detail-actions"><a href="${escapeHtml(credentialUrl)}" class="btn btn-primary" target="_blank" rel="noreferrer noopener">Open credential</a></p>` : ''}
        </div>
      </div>
    `;
  };

  const buildNotFoundMarkup = (context, missingId, availableItems = []) => {
    const suggestions = availableItems.slice(0, 4).map((item) => {
      const itemId = encodeURIComponent(String(item.slug || item.title || ''));
      const itemTitle = escapeHtml(item.title || 'Untitled');
      return `<li><a href="${context.itemLabel === 'project' ? `${PROJECTS_ROUTE}?id=${itemId}` : `${CERTIFICATE_ROUTE}?id=${itemId}`}">${itemTitle}</a></li>`;
    }).join('');

    return `
      <section class="detail-404">
        <div class="detail-404__card">
          <span class="status-pill">404</span>
          <h2>${context.pageTitle} not found</h2>
          <p>We could not find a ${context.itemLabel} for <strong>${escapeHtml(missingId || 'the requested id')}</strong>.</p>
          <div class="detail-actions">
            <a href="${context.fallbackRoute}" class="btn btn-primary">${context.fallbackLabel}</a>
            <a href="${context.homeHref}" class="btn btn-outline-primary">Home</a>
          </div>
          ${suggestions ? `<div class="detail-404__suggestions"><h3>Try one of these</h3><ul>${suggestions}</ul></div>` : ''}
        </div>
      </section>
    `;
  };

  const renderDetailPage = async () => {
    const detailRoot = document.querySelector('[data-detail-root]');
    const detailBody = bodyElement.dataset.detailType;

    if (!detailRoot || !detailBody) {
      return;
    }

    const context = getDetailContext(detailBody);
    const requestedId = getDetailId();

    if (!requestedId) {
      detailRoot.innerHTML = buildNotFoundMarkup(context, 'missing id');
      showToast(`Missing ${context.itemLabel} id.`, 'warning');
      setDocumentMeta({
        title: `${context.pageTitle} | Kunal Gavit`,
        description: `Browse ${context.itemLabel} details from the portfolio.`,
        canonicalUrl: window.location.href.split('#')[0]
      });
      return;
    }

    try {
      detailRoot.innerHTML = buildPortfolioSkeletonMarkup(1);
      const items = await loadJson(context.source);

      if (!Array.isArray(items)) {
        throw new Error(`${context.source} must contain an array`);
      }

      const currentItem = items.find((item) => {
        const slugMatches = normalizeIdentifier(item.slug) === normalizeIdentifier(requestedId);
        const titleMatches = normalizeIdentifier(item.title) === normalizeIdentifier(requestedId);
        return slugMatches || titleMatches;
      });

      if (!currentItem) {
        detailRoot.innerHTML = buildNotFoundMarkup(context, requestedId, items);
        showToast(`${context.pageTitle} not found.`, 'warning');
        setDocumentMeta({
          title: `${context.pageTitle} | Kunal Gavit`,
          description: `Browse ${context.itemLabel} details from the portfolio.`,
          canonicalUrl: window.location.href.split('#')[0]
        });
        return;
      }

      detailRoot.innerHTML = detailBody === 'project'
        ? buildProjectDetailMarkup(currentItem)
        : buildCertificateDetailMarkup({
            ...currentItem,
            allCertificates: items
          });

      const pageTitleNode = document.querySelector('[data-detail-page-title]');
      const breadcrumbNode = document.querySelector('[data-detail-breadcrumb]');

      if (pageTitleNode) {
        pageTitleNode.textContent = currentItem.title || context.pageTitle;
      }

      if (breadcrumbNode) {
        breadcrumbNode.textContent = currentItem.title || context.pageTitle;
      }

      const pageDescription = currentItem.seoDescription || currentItem.summary || currentItem.description || `Details for ${currentItem.title}`;
      const canonicalUrl = window.location.href.split('#')[0];
      const seoImage = normalizeGallery(currentItem)[0] || currentItem.previewImage || currentItem.image || '';

      setDocumentMeta({
        title: `${currentItem.title} | ${context.pageTitle} | Kunal Gavit`,
        description: pageDescription,
        image: seoImage,
        canonicalUrl,
        type: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': detailBody === 'project' ? 'CreativeWork' : 'Course',
          name: currentItem.title,
          description: pageDescription,
          url: canonicalUrl,
          image: seoImage ? [seoImage] : undefined
        }
      });

      bindRevealCards(document);

      if (typeof AOS !== 'undefined' && typeof AOS.refreshHard === 'function') {
        AOS.refreshHard();
      }

      initSwiper();
    } catch (error) {
      console.error('Failed to render detail page:', error);
      detailRoot.innerHTML = buildNotFoundMarkup(context, requestedId);
      showToast(`Unable to load ${context.itemLabel} details right now.`, 'warning');
      setDocumentMeta({
        title: `${context.pageTitle} | Kunal Gavit`,
        description: `Browse ${context.itemLabel} details from the portfolio.`,
        canonicalUrl: window.location.href.split('#')[0]
      });
    }
  };

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(async function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';
    let selectedFilter = filter;
    let searchQuery = '';
    const isotopeContainer = isotopeItem.querySelector('.isotope-container');
    const getTotalItems = () => isotopeItem.querySelectorAll('.isotope-item').length;
    const searchInput = document.querySelector('#portfolio-search');
    const portfolioCount = document.querySelector('#portfolio-count');

    let initIsotope;

    const updatePortfolioCount = (visibleItems) => {
      if (!portfolioCount) return;

      const totalItems = getTotalItems();

      if (totalItems === 0) {
        portfolioCount.textContent = 'No projects available';
        return;
      }

      if (searchQuery) {
        portfolioCount.textContent = `Showing ${visibleItems} of ${totalItems} projects`;
      } else {
        portfolioCount.textContent = visibleItems === totalItems
          ? 'Showing all projects'
          : `Showing ${visibleItems} projects`;
      }
    };

    const applyCombinedFilters = () => {
      if (!initIsotope) return;

      initIsotope.arrange({
        filter: function(itemElement) {
          const matchesCategory = selectedFilter === '*' || itemElement.matches(selectedFilter);

          if (!matchesCategory) return false;
          if (!searchQuery) return true;

          const title = itemElement.querySelector('.portfolio-info h4')?.textContent.toLowerCase() ?? '';
          const description = itemElement.querySelector('.portfolio-info p')?.textContent.toLowerCase() ?? '';
          const meta = itemElement.getAttribute('data-search')?.toLowerCase() ?? '';

          return title.includes(searchQuery) || description.includes(searchQuery) || meta.includes(searchQuery);
        }
      });
    };

    await renderPortfolioProjects(isotopeItem);

    imagesLoaded(isotopeContainer, function() {
      initIsotope = new Isotope(isotopeContainer, {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });

      bindRevealCards(isotopeItem);

      initIsotope.on('arrangeComplete', function(filteredItems) {
        updatePortfolioCount(filteredItems.length);
      });

      applyCombinedFilters();
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        const activeFilter = isotopeItem.querySelector('.isotope-filters .filter-active');
        if (activeFilter) {
          activeFilter.classList.remove('filter-active');
        }

        this.classList.add('filter-active');
        selectedFilter = this.getAttribute('data-filter') ?? '*';
        applyCombinedFilters();
      }, false);
    });

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        searchQuery = this.value.trim().toLowerCase();
        applyCombinedFilters();
      });
    }

  });

  /**
   * Reveal cards on scroll with a subtle stagger
   */
  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.18
  }) : null;

  const bindRevealCards = (scope = document) => {
    const cards = scope.querySelectorAll('.stats .stats-item, .portfolio .portfolio-item, .services .service-item, .testimonials .testimonial-item, .portfolio-details .portfolio-info, .portfolio-details .portfolio-description, .service-details .services-list, .service-details h3, .service-details ul, .detail-404__card');

    cards.forEach((card, index) => {
      if (card.dataset.revealBound === 'true') return;

      card.dataset.revealBound = 'true';
      card.style.transitionDelay = `${(index % 3) * 70}ms`;

      if (revealObserver) {
        revealObserver.observe(card);
      } else {
        card.classList.add('is-visible');
      }
    });
  };

  bindRevealCards();
  renderCertificates();
  renderDetailPage();

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      if (swiperElement.dataset.swiperInitialized === 'true') {
        return;
      }

      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }

      swiperElement.dataset.swiperInitialized = 'true';
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  const routeScrollTargets = {
    '/about': '#about',
    '/contact': '#contact'
  };

  const scrollToSection = (selector) => {
    const section = document.querySelector(selector);

    if (!section) {
      return;
    }

    setTimeout(() => {
      const scrollMarginTop = getComputedStyle(section).scrollMarginTop;
      window.scrollTo({
        top: section.offsetTop - parseInt(scrollMarginTop),
        behavior: 'smooth'
      });
    }, 100);
  };

  window.addEventListener('load', function() {
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    const routeTarget = routeScrollTargets[pathname];

    if (routeTarget) {
      scrollToSection(routeTarget);
      return;
    }

    if (window.location.hash) {
      scrollToSection(window.location.hash);
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();
