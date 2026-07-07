# Project Memory — Commercial Properties UAE

This file is a persistent memory document for AI agents working on this project.
Read this before making any changes so you understand the current state of the project.

---

## Project Overview

**Client**: Cushman & Wakefield Core  
**Live Website**: https://commercialpropertiesintheuae.ae/  
**GitHub Repository**: https://github.com/Cushwake-max/commercial-properties-uae  
**Hosting**: GitHub Pages (auto-deploys on push to `main`)  
**Local Workspace**: `c:\Users\mujtaba.sajawal\Downloads\commercial-properties-uae`

---

## Landing Pages

The site has 5 landing pages, each in its own directory:

| Page | Directory | Live URL |
|---|---|---|
| Home / Property Index | `/` (root index.html) | https://commercialpropertiesintheuae.ae/ |
| AHS Tower | ahs-tower/ | https://commercialpropertiesintheuae.ae/ahs-tower/ |
| Boulevard Plaza Tower 1 | boulevard-plaza-tower-1/ | https://commercialpropertiesintheuae.ae/boulevard-plaza-tower-1/ |
| City Tower | city-tower/ | https://commercialpropertiesintheuae.ae/city-tower/ |
| Sweid One | sweidone/ | https://commercialpropertiesintheuae.ae/sweidone/ |

> **Note**: `city-tower` is a compiled React/Vite app (its index.html is minified and contains inlined JS). All other pages are plain HTML + vanilla JS.

---

## File Structure (per landing page)

```
boulevard-plaza-tower-1/
├── index.html      <- PostHog snippet + global event listeners
├── script.js       <- Form submit handlers + posthog.capture() calls
├── style.css
└── images/
    └── favicon.svg <- Shared SVG favicon (source of truth)
```

The **`PROPERTY_CONFIG`** object at the top of each `script.js` defines the property name and other per-page settings. It is referenced in PostHog event properties.

---

## Analytics — PostHog Setup

**Project Token**: `phc_mZ2q6V3KFpBJZyMmgGAyS2xjq4FPbp4g8xqnwk4de25T`  
**API Host**: `https://us.i.posthog.com`  
**PostHog Project ID**: `501242`  
**PostHog Region**: US Cloud  
**PostHog Dashboard**: https://us.posthog.com/project/sTMFPsFhdP1Ssg

The PostHog snippet is placed in the `<head>` of every index.html. It uses the official PostHog JS SDK loaded from their CDN.

---

## Custom Event Tracking

The following custom events are fired using `posthog.capture()`. They are implemented in two places:

### 1. Global click listener (in each index.html `<head>`)

| PostHog Event | Trigger | Properties |
|---|---|---|
| `whatsapp_clicked` | Click on `a[href*="wa.me"]` or `.whatsapp-link` | `property_name`, `target_url` |
| `phone_clicked` | Click on `a[href^="tel:"]` | `property_name`, `phone_number` |
| `enquire_button_clicked` | Click on `a[href="#lead-form"]` | `property_name` |
| `brochure_trigger_clicked` | Click on `.brochure-trigger` button | `property_name` |

### 2. Form submit handlers (in each script.js)

Fires only on **successful** Formspree submission (after a 200 OK response):

| PostHog Event | Trigger | Properties |
|---|---|---|
| `lead_submitted` | Successful enquiry form submit | `property_name`, `form_type: enquiry_card` |
| `lead_submitted` | Successful brochure download form submit | `property_name`, `form_type: brochure_download` |

`property_name` is read from `PROPERTY_CONFIG.propertyName` (defined at top of script.js).

---

## Lead Capture — Formspree

Forms submit to Formspree endpoints defined in each index.html form action attribute. No backend server. On success, the JS replaces the form card with a success message and fires the PostHog event.

---

## Favicon

All pages use the same SVG favicon. Source of truth: `boulevard-plaza-tower-1/images/favicon.svg`
Copies exist at:
- `images/favicon.svg` (root)
- `ahs-tower/images/favicon.svg`
- `city-tower/favicon.svg`
- `sweidone/favicon.svg`

---

## Deployment Workflow

1. Make changes locally
2. `git add . && git commit -m "description"`
3. `git push origin main`
4. GitHub Pages auto-deploys within ~1 minute

**Git credential account**: `mujtaba695-afk` (must have write access to Cushwake-max org repo)

---

## PostHog Checks (as of 2026-07-07)

- pageview - PASS
- pageleave - PASS
- Scroll depth - PASS
- Authorized URLs - PASS (commercialpropertiesintheuae.ae)
- Web Vitals Autocapture - PASS (enabled in PostHog project settings)
- Reverse proxy - NOT configured (optional; would need Cloudflare Worker)
