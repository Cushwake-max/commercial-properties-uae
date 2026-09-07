const EXPERIENCES = {
    rent: {
        title: 'Office for Rent in Dubai | Cushman & Wakefield Core',
        description: 'Office for rent in Dubai. Compare fitted, furnished and shell-and-core workspace across Business Bay, DIFC, Sheikh Zayed Road, JLT and Dubai Internet City with Cushman & Wakefield Core.',
        kicker: 'Dubai Offices for Rent',
        heroTitle: 'Office for Rent<br>in Dubai',
        heroText: 'Compare office space across Dubai’s main business districts. Tell us what you are looking for and we will find the best options that fit your needs.',
        pointOneTitle: 'Every district, one conversation',
        pointOneText: 'Business Bay, DIFC, Sheikh Zayed Road, JLT and Dubai Internet City, compared side by side rather than one at a time.',
        pointTwoTitle: 'Fitted, furnished or shell and core',
        pointTwoText: 'We shortlist on what actually matters to you: floor plate, fit-out condition, service charge and lease flexibility.',
        pointThreeTitle: 'Advisor, not intermediary',
        pointThreeText: 'We advise on timing and terms, and tell you when a building is the wrong answer for your requirement.',
        formKicker: 'Dubai Office Enquiry',
        formTitle: 'Find an Office to Rent',
        formSubject: 'New Dubai office rental enquiry',
        enquiryType: 'Dubai \u2014 Office rental enquiry',
        timelineLabel: 'Preferred Move-In (optional)',
        timelinePlaceholder: 'Select timeline',
        submitLabel: 'Submit',
        supportKicker: 'Commercial Property Specialists',
        supportTitle: 'From requirement to rental shortlist.',
        supportIntro: 'Tell us what matters to your business and we will compare suitable options across Dubai\u2019s main districts.',
        stepOne: 'Share your size, fit-out and timing requirements.',
        stepTwo: 'Review relevant districts, towers, terms and available offices.',
        stepThree: 'Arrange viewings and next steps for shortlisted options.',
        finalKicker: 'Dubai \u2022 UAE',
        finalTitle: 'Ready to find your next office in Dubai?',
        finalCta: 'Enquire About Offices for Rent'
    },
    sale: {
        title: 'Office for Sale in Dubai | Cushman & Wakefield Core',
        description: 'Offices for sale in Dubai. Compare buildings, pricing and investment terms across Business Bay, DIFC, Sheikh Zayed Road, JLT and Dubai Internet City with Cushman & Wakefield Core.',
        kicker: 'Dubai Offices for Sale',
        heroTitle: 'Office for Sale<br>in Dubai',
        heroText: 'Compare offices for sale across Dubai’s main business districts. Tell us what you are looking for and we will find the best options that fit your needs.',
        pointOneTitle: 'Every district, one conversation',
        pointOneText: 'Business Bay, DIFC, Sheikh Zayed Road, JLT and Dubai Internet City, compared side by side rather than one at a time.',
        pointTwoTitle: 'Priced on more than the headline',
        pointTwoText: 'We compare service charges, floor plate efficiency and building quality alongside the asking price.',
        pointThreeTitle: 'Advisor, not intermediary',
        pointThreeText: 'We advise on value and timing, and tell you when a building is the wrong answer for your requirement.',
        formKicker: 'Dubai Office Purchase Enquiry',
        formTitle: 'Find an Office to Buy',
        formSubject: 'New Dubai office purchase enquiry',
        enquiryType: 'Dubai \u2014 Office purchase enquiry',
        timelineLabel: 'Preferred Purchase Timeline (optional)',
        timelinePlaceholder: 'Select timeline',
        submitLabel: 'Submit',
        supportKicker: 'Commercial Property Specialists',
        supportTitle: 'From requirement to purchase shortlist.',
        supportIntro: 'Tell us what matters to your business and we will compare suitable opportunities across Dubai\u2019s main districts.',
        stepOne: 'Share your budget, size and timing requirements.',
        stepTwo: 'Review relevant districts, towers, pricing and available offices.',
        stepThree: 'Arrange viewings and next steps for shortlisted options.',
        finalKicker: 'Dubai \u2022 UAE',
        finalTitle: 'Ready to find your next office in Dubai?',
        finalCta: 'Enquire About Offices for Sale'
    }
};

const params = new URLSearchParams(window.location.search);
const requestedIntent = params.get('intent');
const currentIntent = requestedIntent === 'sale' ? 'sale' : 'rent';
const content = EXPERIENCES[currentIntent];

document.documentElement.dataset.intent = currentIntent;
document.body.dataset.intent = currentIntent;
document.title = content.title;

const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription) metaDescription.content = content.description;

document.querySelectorAll('[data-copy]').forEach(element => {
    const key = element.dataset.copy;
    if (!key || !(key in content)) return;

    if (key === 'heroTitle') {
        element.innerHTML = content[key];
    } else {
        element.textContent = content[key];
    }
});

const formSubject = document.getElementById('formSubject');
const enquiryType = document.getElementById('enquiryType');
const landingExperience = document.getElementById('landingExperience');
if (formSubject) formSubject.value = content.formSubject;
if (enquiryType) enquiryType.value = content.enquiryType;
if (landingExperience) landingExperience.value = currentIntent;

document.addEventListener('DOMContentLoaded', () => {
    const stickyHub = document.getElementById('sticky-hub');
    const header = document.querySelector('.site-header');

    const updateScrolledState = () => {
        stickyHub?.classList.toggle('visible', window.scrollY > 300);
        if (header) {
            header.style.boxShadow = window.scrollY > 50
                ? '0 10px 30px rgba(0, 0, 0, 0.08)'
                : '0 2px 20px rgba(0, 0, 0, 0.02)';
        }
    };

    window.addEventListener('scroll', updateScrolledState, { passive: true });
    updateScrolledState();

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', event => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const mobileInput = document.getElementById('mobile');
    let phoneInput = null;

    if (mobileInput && typeof window.intlTelInput === 'function') {
        phoneInput = window.intlTelInput(mobileInput, {
            initialCountry: 'ae',
            preferredCountries: ['ae', 'sa', 'qa', 'kw', 'bh', 'om', 'gb', 'in'],
            separateDialCode: true,
            utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js'
        });
    }

    const form = document.getElementById('leadCaptureForm');
    const leadCard = document.querySelector('.lead-card');
    const formError = document.getElementById('leadFormError');

    const showError = message => {
        if (!formError) return;
        formError.textContent = message;
        formError.hidden = false;
    };

    form?.addEventListener('submit', async event => {
        event.preventDefault();
        if (formError) formError.hidden = true;

        if (!form.checkValidity()) {
            form.reportValidity();
            const bad = form.querySelector(':invalid');
            window.CWC && CWC.track('form_validation_error', {
                error_field: bad ? bad.name : 'unknown',
                error_type: 'required_or_format'
            });
            return;
        }

        let phone = mobileInput?.value.trim() || '';
        if (phoneInput) {
            if (!phoneInput.isValidNumber()) {
                showError('Please enter a valid contact number, including the country code.');
                mobileInput?.focus();
                window.CWC && CWC.track('form_validation_error', {
                    error_field: 'mobile',
                    error_type: 'invalid_phone'
                });
                return;
            }
            phone = phoneInput.getNumber();
        }

        // Catch ANY unreplaced placeholder endpoint, not just the JLT one. Without
        // this the form would POST to a non-existent Formspree URL and the visitor
        // would see a generic failure.
        if (form.action.includes('REPLACE_WITH')) {
            showError('The enquiry form is ready but its Formspree endpoint still needs to be connected.');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalLabel = submitButton?.textContent || 'Submit Enquiry';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending…';
        }

        const leadCode = window.CWC ? CWC.newLeadCode() : '';
        if (window.CWC) CWC.injectInto(form, { lead_code: leadCode });

        const formData = new FormData(form);
        formData.set('mobile', phone);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) throw new Error('Submission failed');

            // --- Conversion tracking (fires only on confirmed Formspree success) ---
            var leadEmail = formData.get('email');
            // Google Ads conversion (enhanced: email/phone hashed by Google before send)
            if (typeof gtag === 'function') {
                gtag('set', 'user_data', {
                    email: leadEmail || undefined,
                    phone_number: phone || undefined
                });
                gtag('event', 'conversion', {
                    send_to: 'AW-17944022933/kWTzCMDtndAcEJWfsOxC'
                });
            }
            // PostHog lead event (full attribution snapshot attached)
            window.CWC && CWC.track('form_submitted', {
                lead_code: leadCode,
                timeline: formData.get('preferred_timeline')
                    || formData.get('preferred_move_in') || '',
                has_company: !!formData.get('company')
            });
            // Meta Pixel lead event
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', { content_name: 'Dubai', content_category: currentIntent });
            }

            if (leadCard) {
                leadCard.innerHTML = `
                    <div class="success-card">
                        <div class="success-icon" aria-hidden="true">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <h2>Enquiry received.</h2>
                        <p>Thank you. Our commercial team will contact you about Business Bay office
                            ${currentIntent === 'sale' ? 'purchase' : 'rental'} options.</p>
                        <div class="mini-location"><span>Business Bay, Dubai</span></div>
                    </div>
                `;
            }
        } catch (err) {
            window.CWC && CWC.track('form_submission_failed', {
                lead_code: leadCode,
                failure_reason: (err && err.message) || 'network_error'
            });
            showError('Sorry, your enquiry could not be sent. Please try again or contact us by phone or WhatsApp.');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalLabel;
            }
        }
    });

    const video = document.getElementById('jltOfficeVideo');
    if (video) {
        const videos = [video];
        videos.forEach(media => {
            media.muted = true;
            media.defaultMuted = true;
        });

        const updatePlayback = entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videos.forEach(media => {
                        media.play().catch(() => {
                            // The primary video's native controls remain available if autoplay is blocked.
                        });
                    });
                } else {
                    videos.forEach(media => media.pause());
                }
            });
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(updatePlayback, { threshold: 0.35 });
            observer.observe(video);
        }
    }
});
