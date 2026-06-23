document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Location Map Destinations
    // ----------------------------------------------------
    const destCards = document.querySelectorAll('.dest-card');

    function selectDestination(id) {
        // Toggle active classes on cards
        destCards.forEach(card => {
            const isActive = card.dataset.id === id;
            card.classList.toggle('active', isActive);
            card.setAttribute('aria-selected', isActive ? 'true' : 'false');
            
            // Show/hide info paragraph
            const infoText = card.querySelector('.dest-info-text');
            if (infoText) {
                infoText.style.display = isActive ? 'block' : 'none';
            }
        });
    }

    // Attach click events to destination cards
    destCards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            selectDestination(id);
        });
    });

    // Initialize first destination on load (DIFC for AHS Tower)
    selectDestination('difc');

    // ----------------------------------------------------
    // 2. Scroll Watchers (Header & Sticky Action Hub)
    // ----------------------------------------------------
    const stickyHub = document.getElementById('sticky-hub');
    const header = document.querySelector('.site-header');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        // Sticky Action Hub visible after scrolling 300px
        if (stickyHub) {
            if (scrollPos > 300) {
                stickyHub.classList.add('visible');
            } else {
                stickyHub.classList.remove('visible');
            }
        }

        // Add subtle background drop-shadow/solidification to header on scroll
        if (header) {
            if (scrollPos > 50) {
                header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
                header.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.02)';
                header.style.background = 'rgba(255, 255, 255, 0.92)';
            }
        }
    });

    // ----------------------------------------------------
    // 3. Form Submit Handler (Capturing Leads via Formspree)
    // ----------------------------------------------------
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xgojvoqb';

    const leadForm = document.getElementById('leadCaptureForm');
    const leadCard = document.querySelector('.lead-card');
    const mobileInput = document.getElementById('mobile');
    const errorBox = document.getElementById('formError');

    // International phone field (country-flag picker, default UAE)
    let iti = null;
    if (mobileInput && window.intlTelInput) {
        iti = window.intlTelInput(mobileInput, {
            initialCountry: 'ae',
            preferredCountries: ['ae', 'sa', 'gb', 'in'],
            separateDialCode: true,
            utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
        });
    }

    function showError(message) {
        if (!errorBox) return;
        errorBox.textContent = message;
        errorBox.hidden = false;
    }

    function clearError() {
        if (!errorBox) return;
        errorBox.textContent = '';
        errorBox.hidden = true;
    }

    function showSuccess() {
        leadCard.innerHTML = `
            <div class="success-card">
                <div class="success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h2>Enquiry received.</h2>
                <p>Thank you for your interest in the AHS Tower commercial office listing. Our commercial team at Cushman & Wakefield Core will contact you within 24 hours.</p>
                <div class="mini-location" style="margin-top: 15px;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>AHS Tower &bull; SZR, Dubai</span>
                </div>
            </div>
        `;
    }

    if (leadForm && leadCard) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const consent = document.getElementById('consent');

            // Required-field validation: Name, Mobile, Email (+ consent)
            if (!name) { showError('Please enter your full name.'); return; }

            // Phone: must be present and a valid number (not just a dial code)
            if (iti) {
                const rawNumber = iti.getNumber().trim();
                const dialOnly = '+' + (iti.getSelectedCountryData().dialCode || '');
                if (!rawNumber || rawNumber === dialOnly) {
                    showError('Please enter your mobile number.');
                    return;
                }
                if (typeof iti.isValidNumber === 'function' && iti.isValidNumber() === false) {
                    showError('Please enter a valid mobile number.');
                    return;
                }
            } else if (!mobileInput.value.trim()) {
                showError('Please enter your mobile number.');
                return;
            }

            if (!email) { showError('Please enter your email address.'); return; }
            if (consent && !consent.checked) {
                showError('Please confirm you agree to be contacted.');
                return;
            }

            // Build payload; submit the full international phone number
            const formData = new FormData(leadForm);
            if (iti) formData.set('Mobile', iti.getNumber());
            formData.set('marketing_opt_in', document.getElementById('marketing_opt_in').checked ? 'Yes' : 'No');
            formData.set('Source', 'AHS Tower SZR Landing Page');

            const submitBtn = document.getElementById('submitBtn');
            const originalLabel = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    showSuccess();
                } else {
                    let message = 'Something went wrong. Please try again, or reach us on WhatsApp.';
                    try {
                        const data = await response.json();
                        if (data && data.errors && data.errors.length) {
                            message = data.errors.map((err) => err.message).join(' ');
                        }
                    } catch (parseErr) { /* keep default message */ }
                    showError(message);
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
                }
            } catch (networkErr) {
                showError('Network error. Please check your connection and try again, or reach us on WhatsApp.');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
            }
        });
    }
});
