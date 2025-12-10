/**
 * Contact Form Handler
 * Handles form submission and communicates with the backend API (Vercel-ready)
 */

const CONTACT_ENDPOINT = (() => {
    const hasWindow = typeof window !== 'undefined';
    const configuredBase = hasWindow && window.CONTACT_API_BASE ? String(window.CONTACT_API_BASE) : '';

    const buildUrl = (base) => `${base.replace(/\/$/, '')}/api/contact`;

    if (configuredBase) {
        return buildUrl(configuredBase);
    }

    if (hasWindow && window.location && window.location.origin && window.location.origin.startsWith('http')) {
        return '/api/contact';
    }

    // Fallback for local file preview without a dev server
    return 'http://localhost:5000/api/contact';
})();

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.php-email-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const loadingDiv = form.querySelector('.loading');
    const errorDiv = form.querySelector('.error-message');
    const successDiv = form.querySelector('.sent-message');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Reset messages
    loadingDiv.style.display = 'block';
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    errorDiv.textContent = '';
    submitButton.disabled = true;
    
    // Prepare data
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    try {
        // Send to backend (local dev or Vercel)
        const response = await fetch(CONTACT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        loadingDiv.style.display = 'none';
        
        if (response.ok && result.success) {
            // Success
            successDiv.style.display = 'block';
            successDiv.textContent = result.message || 'Your message has been sent. Thank you!';
            form.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 5000);
        } else {
            // Error from server
            errorDiv.style.display = 'block';
            errorDiv.textContent = result.message || 'There was an error sending your message. Please try again.';
        }
        
    } catch (error) {
        // Network or other error
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Unable to reach the contact API. Verify the deployment or set window.CONTACT_API_BASE for local testing.';
        console.error('Error:', error);
    } finally {
        submitButton.disabled = false;
    }
}

// Optional: Add real-time validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add input validation on blur
document.addEventListener('DOMContentLoaded', function() {
    const emailField = document.getElementById('email-field');
    
    if (emailField) {
        emailField.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '';
            }
        });
    }
});
