// Attribution, identity and engagement tracking live in
// attribution.js (loaded first). It exposes window.CWC.

const EXPERIENCES = {
    rent: {
        title: 'Office for Rent in DIFC Dubai | Cushman & Wakefield Core',
        description: 'Find office space for rent in DIFC with Cushman & Wakefield Core. Availability is selective across the premium market — our specialists will discuss current options.',
        kicker: 'DIFC Offices for Rent',
        heroTitle: 'Office for Rent<br>in DIFC',
        heroText: 'DIFC is a premium office market with Grade A and Grade A+ towers at the centre of a global financial ecosystem. Availability is selective.',
        pointOneTitle: 'Global financial ecosystem',
        pointOneText: 'Explore an office for rent in DIFC, Dubai\'s established financial and professional services district.',
        pointTwoTitle: 'Grade A & Grade A+ towers',
        pointTwoText: 'Compare premium specifications across the full DIFC market, subject to availability.',
        pointThreeTitle: 'Availability is selective',
        pointThreeText: 'Demand is strong and pricing is disciplined — we advise occupiers on realistic, current options.',
        formKicker: 'DIFC Rental Enquiry',
        formTitle: 'Find an Office to Rent',
        formSubject: 'New DIFC office rental enquiry',
        enquiryType: 'DIFC — Office rental enquiry',
        timelineLabel: 'Preferred Move-In (optional)',
        timelinePlaceholder: 'Select timeline',
        submitLabel: 'Submit',
        sectionKicker: 'Navigating the DIFC Office Market',
        sectionTitle: 'Deal structure matters as much as headline rent.',
        sectionIntro: 'High occupancy, limited supply and premium positioning mean terms deserve as much attention as the rent itself.',
        advantageOneTitle: 'High occupancy, limited supply',
        advantageOneText: 'Understand what is genuinely available before shaping your requirement.',
        advantageTwoTitle: 'Premium positioning',
        advantageTwoText: 'Compare Grade A and Grade A+ towers and their occupier profiles.',
        advantageThreeTitle: 'Structured, data-led guidance',
        advantageThreeText: 'Our brokers advise on incentives, lease terms and total cost of occupancy.',
        supportTitle: 'From requirement to rental shortlist.',
        supportIntro: 'Enquire to explore suitable options and our specialists will discuss current DIFC availability with you.',
        stepOne: 'Share your size, specification and timing requirements.',
        stepTwo: 'Review available towers, terms and deal structures.',
        stepThree: 'Arrange discussions and next steps for shortlisted options.',
        finalTitle: 'Ready to discuss current DIFC availability?',
        finalCta: 'Enquire About Offices for Rent'
    },
    sale: {
        title: 'Office for Sale in DIFC Dubai | Cushman & Wakefield Core',
        description: 'Review offices for sale in DIFC with Cushman & Wakefield Core. We advise occupiers and investors on this premium, supply-constrained market.',
        kicker: 'DIFC Offices for Sale',
        heroTitle: 'Office for Sale<br>in DIFC',
        heroText: 'Review offices for sale in DIFC, a premium market with disciplined pricing. We advise both occupiers and investors.',
        pointOneTitle: 'Premium financial district',
        pointOneText: 'Consider ownership in Dubai\'s global financial ecosystem, with Grade A and Grade A+ stock.',
        pointTwoTitle: 'Selective availability',
        pointTwoText: 'Compare available units and floors across the full DIFC market as opportunities arise.',
        pointThreeTitle: 'Occupiers and investors',
        pointThreeText: 'Assess pricing discipline, occupancy, service charges and transaction terms with independent advice.',
        formKicker: 'DIFC Sales Enquiry',
        formTitle: 'Find an Office to Buy',
        formSubject: 'New DIFC office sales enquiry',
        enquiryType: 'DIFC — Office sales enquiry',
        timelineLabel: 'Preferred Purchase Timeline (optional)',
        timelinePlaceholder: 'Select timeline',
        submitLabel: 'Submit',
        sectionKicker: 'DIFC Ownership Opportunities',
        sectionTitle: 'Compare offices with clarity.',
        sectionIntro: 'Limited supply and premium positioning mean opportunities vary significantly by tower, floor and specification.',
        advantageOneTitle: 'Grade A & Grade A+ stock',
        advantageOneText: 'Review premium specifications across the full DIFC market.',
        advantageTwoTitle: 'Disciplined pricing',
        advantageTwoText: 'Understand how strong demand and limited supply shape pricing.',
        advantageThreeTitle: 'Building due diligence',
        advantageThreeText: 'Compare access, parking, facilities, service charges and building management.',
        supportTitle: 'From requirement to purchase shortlist.',
        supportIntro: 'Share your priorities and our specialists will help you compare offices for sale in DIFC.',
        stepOne: 'Share your preferred size, specification and purchase timeline.',
        stepTwo: 'Review relevant buildings, available units and key considerations.',
        stepThree: 'Arrange discussions and next steps for selected opportunities.',
        finalTitle: 'Ready to explore DIFC offices for sale?',
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
                fbq('track', 'Lead', { content_name: 'DIFC', content_category: currentIntent });
            }

            if (leadCard) {
                leadCard.innerHTML = `
                    <div class="success-card">
                        <div class="success-icon" aria-hidden="true">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <h2>Enquiry received.</h2>
                        <p>Thank you. Our commercial team will contact you about DIFC office
                            ${currentIntent === 'sale' ? 'purchase' : 'rental'} options.</p>
                        <div class="mini-location"><span>DIFC, Dubai</span></div>
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
