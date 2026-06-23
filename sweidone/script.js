document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Travel Map Destinations
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

    // Initialize first destination on load
    selectDestination('marina');

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
            } else {
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.02)';
            }
        }
    });

    // ----------------------------------------------------
    // 3. International phone inputs (intl-tel-input, default UAE)
    // ----------------------------------------------------
    const phoneInputs = {};

    function initPhone(id) {
        const input = document.getElementById(id);
        if (!input || typeof window.intlTelInput !== 'function') return null;
        const iti = window.intlTelInput(input, {
            initialCountry: 'ae',
            preferredCountries: ['ae', 'sa', 'qa', 'kw', 'bh', 'om', 'gb', 'in'],
            separateDialCode: true,
            utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js'
        });
        phoneInputs[id] = iti;
        return iti;
    }

    initPhone('mobile');
    initPhone('brochure-mobile');

    // Returns the full international number, or '' if empty / dial code only / invalid.
    function getValidPhone(id) {
        const iti = phoneInputs[id];
        const input = document.getElementById(id);
        if (!iti || !input) return input ? input.value.trim() : '';
        if (!input.value.trim()) return '';
        if (typeof iti.isValidNumber === 'function' && !iti.isValidNumber()) return '';
        return iti.getNumber();
    }

    // ----------------------------------------------------
    // 4. Form Submit Handler (Capturing Leads -> Formspree)
    // ----------------------------------------------------
    const leadForm = document.getElementById('leadCaptureForm');
    const leadCard = document.querySelector('.lead-card');
    const leadFormError = document.getElementById('leadFormError');

    function showError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.hidden = false;
    }

    function clearError(el) {
        if (!el) return;
        el.textContent = '';
        el.hidden = true;
    }

    if (leadForm && leadCard) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError(leadFormError);

            const phone = getValidPhone('mobile');
            if (!phone) {
                showError(leadFormError, 'Please enter a valid mobile number, including the country code.');
                document.getElementById('mobile')?.focus();
                return;
            }

            const submitBtn = leadForm.querySelector('button[type="submit"]');
            const originalLabel = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending…';
            }

            const formData = new FormData(leadForm);
            formData.set('mobile', phone);

            try {
                const response = await fetch(leadForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (!response.ok) throw new Error('Submission failed');

                // Success state (preserves the existing on-page "received" card)
                leadCard.innerHTML = `
                    <div class="success-card">
                        <div class="success-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <h2>Enquiry received.</h2>
                        <p>Thank you for your interest in Sweid One fitted offices. Our commercial team at Cushman & Wakefield Core will contact you within 24 hours.</p>
                        <div class="mini-location" style="margin-top: 15px;">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>Sweid One &bull; JLT, Dubai</span>
                        </div>
                    </div>
                `;
            } catch (err) {
                showError(leadFormError, 'Sorry, something went wrong sending your enquiry. Please try again or contact us on WhatsApp.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalLabel;
                }
            }
        });
    }

    // ----------------------------------------------------
    // 4. Brochure Download Modal
    // ----------------------------------------------------
    const brochureModal = document.getElementById('brochure-modal');
    const brochureTriggers = document.querySelectorAll('.brochure-trigger');
    const brochureClose = document.querySelector('.brochure-modal-close');
    const brochureForm = document.getElementById('brochureDownloadForm');
    const brochureUrl = 'SweidOne_Brochure%20Desktop.pdf';

    function openBrochureModal() {
        if (!brochureModal) return;

        brochureModal.hidden = false;
        document.body.style.overflow = 'hidden';
        document.getElementById('brochure-name')?.focus();
    }

    function closeBrochureModal() {
        if (!brochureModal) return;

        brochureModal.hidden = true;
        document.body.style.overflow = '';
    }

    brochureTriggers.forEach(trigger => {
        trigger.addEventListener('click', openBrochureModal);
    });

    brochureClose?.addEventListener('click', closeBrochureModal);

    brochureModal?.addEventListener('click', (e) => {
        if (e.target === brochureModal) {
            closeBrochureModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && brochureModal && !brochureModal.hidden) {
            closeBrochureModal();
        }
    });

    const brochureFormError = document.getElementById('brochureFormError');

    brochureForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError(brochureFormError);

        const phone = getValidPhone('brochure-mobile');
        if (!phone) {
            showError(brochureFormError, 'Please enter a valid mobile number, including the country code.');
            document.getElementById('brochure-mobile')?.focus();
            return;
        }

        const submitBtn = brochureForm.querySelector('button[type="submit"]');
        const originalLabel = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
        }

        const formData = new FormData(brochureForm);
        formData.set('mobile', phone);

        try {
            const response = await fetch(brochureForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error('Submission failed');

            window.open(brochureUrl, '_blank', 'noopener');
            brochureForm.reset();
            closeBrochureModal();
        } catch (err) {
            showError(brochureFormError, 'Sorry, something went wrong. Please try again or contact us on WhatsApp.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalLabel;
            }
        }
    });
});
