// ====================================================================
// Google Ads click attribution capture (gclid + keyword/UTM -> lead)
// Reads ad-click params from the URL, persists them across the session,
// and injects them as hidden fields into every form so they submit
// with each lead. Invisible to the visitor.
// ====================================================================
(function () {
    var KEYS = ['gclid', 'wbraid', 'gbraid', 'utm_source', 'utm_medium',
        'utm_campaign', 'utm_content', 'utm_term', 'matchtype'];
    var params = new URLSearchParams(window.location.search);
    KEYS.forEach(function (k) {
        var v = params.get(k);
        if (v) { try { localStorage.setItem('ad_' + k, v); } catch (e) {} }
    });
    function adValues() {
        var out = {};
        KEYS.forEach(function (k) {
            var v = params.get(k);
            if (!v) { try { v = localStorage.getItem('ad_' + k); } catch (e) {} }
            if (v) out[k] = v;
        });
        return out;
    }
    function injectInto(form) {
        if (!form) return;
        var vals = adValues();
        Object.keys(vals).forEach(function (k) {
            var existing = form.querySelector('input[name="' + k + '"]');
            if (existing) { existing.value = vals[k]; return; }
            var input = document.createElement('input');
            input.type = 'hidden'; input.name = k; input.value = vals[k];
            form.appendChild(input);
        });
    }
    function injectAll() {
        var forms = document.querySelectorAll('form');
        for (var i = 0; i < forms.length; i++) injectInto(forms[i]);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectAll);
    } else { injectAll(); }
})();

const EXPERIENCES = {
    rent: {
        title: 'Office for Rent on Sheikh Zayed Road Dubai | Cushman & Wakefield Core',
        description: 'Find office space for rent on Sheikh Zayed Road with Cushman & Wakefield Core. Established, connected and competitive — our commercial team will shortlist suitable towers.',
        kicker: 'Sheikh Zayed Road Offices for Rent',
        heroTitle: 'Office for Rent<br>on Sheikh Zayed Road',
        heroText: 'Established. Connected. Competitive. Find office space for rent on Sheikh Zayed Road with options shaped around your team, timing and preferred fit-out.',
        pointOneTitle: 'Direct arterial access',
        pointOneText: 'Explore an office for rent on Sheikh Zayed Road with direct arterial access and metro proximity.',
        pointTwoTitle: 'Wide range of specifications',
        pointTwoText: 'Compare tower specifications, from established buildings to premium Grade A addresses.',
        pointThreeTitle: 'Leasing flexibility varies',
        pointThreeText: 'Not all buildings offer the same leasing flexibility — we align space selection with your operational needs.',
        formKicker: 'Sheikh Zayed Road Rental Enquiry',
        formTitle: 'Find an Office to Rent',
        formSubject: 'New Sheikh Zayed Road office rental enquiry',
        enquiryType: 'Sheikh Zayed Road — Office rental enquiry',
        timelineLabel: 'Preferred Move-In (optional)',
        timelinePlaceholder: 'Select timeline',
        submitLabel: 'Submit',
        sectionKicker: 'Sheikh Zayed Road Leasing Advantages',
        sectionTitle: 'Choosing the right tower matters.',
        sectionIntro: 'Service charge differentials, rental variance by asset quality and fit-out considerations all shape the right decision.',
        advantageOneTitle: 'Rental variance by quality',
        advantageOneText: 'Compare pricing across asset grades, from established stock to premium towers.',
        advantageTwoTitle: 'Service charge clarity',
        advantageTwoText: 'Understand service charge differentials before committing to a building.',
        advantageThreeTitle: 'Fit-out considerations',
        advantageThreeText: 'Review shell-and-core, semi-fitted and furnished options across selected towers.',
        supportTitle: 'From requirement to rental shortlist.',
        supportIntro: 'A structured approach protects long-term business interests. Tell us what matters and we will provide clear, data-led advice.',
        stepOne: 'Share your size, fit-out and timing requirements.',
        stepTwo: 'Review relevant towers, terms and available offices.',
        stepThree: 'Arrange discussions and next steps for shortlisted options.',
        finalTitle: 'Ready to find your next Sheikh Zayed Road office?',
        finalCta: 'Enquire About Offices for Rent'
    },
    sale: {
        title: 'Office for Sale on Sheikh Zayed Road Dubai | Cushman & Wakefield Core',
        description: 'Review offices for sale on Sheikh Zayed Road with Cushman & Wakefield Core. Share your purchase requirements and let our commercial team shortlist suitable opportunities.',
        kicker: 'Sheikh Zayed Road Offices for Sale',
        heroTitle: 'Office for Sale<br>on Sheikh Zayed Road',
        heroText: 'Review offices for sale on Dubai\'s most established commercial corridor, with guidance shaped around your business or investment requirements.',
        pointOneTitle: 'Prime arterial address',
        pointOneText: 'Consider offices on a connected corridor with direct road access and metro proximity.',
        pointTwoTitle: 'Choice across asset grades',
        pointTwoText: 'Compare unit sizes, specifications and selected full-floor opportunities across towers.',
        pointThreeTitle: 'Informed decision-making',
        pointThreeText: 'Assess asset quality, service charges, occupancy and transaction terms with independent advice.',
        formKicker: 'Sheikh Zayed Road Sales Enquiry',
        formTitle: 'Find an Office to Buy',
        formSubject: 'New Sheikh Zayed Road office sales enquiry',
        enquiryType: 'Sheikh Zayed Road — Office sales enquiry',
        timelineLabel: 'Preferred Purchase Timeline (optional)',
        timelinePlaceholder: 'Select timeline',
        submitLabel: 'Submit',
        sectionKicker: 'Sheikh Zayed Road Ownership Opportunities',
        sectionTitle: 'Compare offices with clarity.',
        sectionIntro: 'Opportunities vary by tower, floor, specification and ownership structure, giving buyers different options to consider.',
        advantageOneTitle: 'Choice of specifications',
        advantageOneText: 'Review shell-and-core, fitted and furnished offices according to availability.',
        advantageTwoTitle: 'Varied unit sizes',
        advantageTwoText: 'Consider compact units, larger offices and selected full-floor opportunities.',
        advantageThreeTitle: 'Building due diligence',
        advantageThreeText: 'Compare access, parking, facilities, service charges and building management.',
        supportTitle: 'From requirement to purchase shortlist.',
        supportIntro: 'Share your priorities and our commercial team will help you compare offices for sale on Sheikh Zayed Road.',
        stepOne: 'Share your preferred size, specification and purchase timeline.',
        stepTwo: 'Review relevant buildings, available units and key considerations.',
        stepThree: 'Arrange discussions and next steps for selected opportunities.',
        finalTitle: 'Ready to explore Sheikh Zayed Road offices for sale?',
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
            return;
        }

        let phone = mobileInput?.value.trim() || '';
        if (phoneInput) {
            if (!phoneInput.isValidNumber()) {
                showError('Please enter a valid contact number, including the country code.');
                mobileInput?.focus();
                return;
            }
            phone = phoneInput.getNumber();
        }

        if (form.action.includes('REPLACE_WITH_JLT_FORM_ID')) {
            showError('The enquiry form is ready but its Formspree endpoint still needs to be connected.');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalLabel = submitButton?.textContent || 'Submit Enquiry';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending…';
        }

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
            // PostHog lead event (tagged with rent/sale intent)
            if (typeof posthog !== 'undefined') {
                posthog.capture('lead_submitted', {
                    property_name: 'Sheikh Zayed Road',
                    intent: currentIntent,
                    gclid: (function(){ try { return localStorage.getItem('ad_gclid') || ''; } catch (e) { return ''; } })()
                });
            }
            // Meta Pixel lead event
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', { content_name: 'Sheikh Zayed Road', content_category: currentIntent });
            }

            if (leadCard) {
                leadCard.innerHTML = `
                    <div class="success-card">
                        <div class="success-icon" aria-hidden="true">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <h2>Enquiry received.</h2>
                        <p>Thank you. Our commercial team will contact you about Sheikh Zayed Road office
                            ${currentIntent === 'sale' ? 'purchase' : 'rental'} options.</p>
                        <div class="mini-location"><span>Sheikh Zayed Road, Dubai</span></div>
                    </div>
                `;
            }
        } catch {
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
