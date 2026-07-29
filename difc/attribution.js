/* ==========================================================================
   CWC — campaign attribution + engagement tracking
   --------------------------------------------------------------------------
   Shared across all area landing pages. Loaded BEFORE experience.js.

   Responsibilities
     1. Persistent pseudonymous identity: visitor / session / touch / lead codes
     2. FIRST touch written once and never overwritten; latest touch updated
     3. Full touch history + attribution path (e.g. "meta > google")
     4. Click-id + UTM + ValueTrack + ad-hierarchy capture
     5. PostHog events (landing, touch, return, scroll, form funnel, contact)
     6. Hidden attribution fields injected into the lead form
     7. WhatsApp prefill + reference, telephone reference

   Public API (window.CWC)
     snapshot()            flat object of every attribution field
     track(event, props)   PostHog capture with base properties merged in
     newLeadCode()         mint + remember a lead code
     injectInto(form)      write hidden fields into a form
   ========================================================================== */
(function (window, document) {
    'use strict';

    var STORE_KEY = 'cwc_attr_v1';
    var COOKIE_KEY = 'cwc_attr_v1';
    var SESSION_GAP_MS = 30 * 60 * 1000;   // 30 min inactivity = new session
    var MAX_TOUCHES = 20;
    // Crockford base32 without I, L, O, U so codes can be read aloud.
    var ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

    // ---------------------------------------------------------------- codes
    function randomChars(n) {
        var out = '';
        var bytes = new Uint8Array(n);
        try { window.crypto.getRandomValues(bytes); } catch (e) { bytes = null; }
        for (var i = 0; i < n; i++) {
            var v = bytes ? bytes[i] : Math.floor(Math.random() * 256);
            out += ALPHABET.charAt(v % ALPHABET.length);
        }
        return out;
    }
    function newVisitorCode() { return 'CWC-' + randomChars(4) + '-' + randomChars(4); }
    function newCode(prefix) { return prefix + '-' + randomChars(6); }

    // -------------------------------------------------------------- storage
    var memoryFallback = null;

    function readCookie(name) {
        var m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
        return m ? decodeURIComponent(m[1]) : null;
    }
    function writeCookie(name, value) {
        try {
            document.cookie = name + '=' + encodeURIComponent(value) +
                '; path=/; max-age=31536000; SameSite=Lax' +
                (location.protocol === 'https:' ? '; Secure' : '');
        } catch (e) { /* ignore */ }
    }
    function load() {
        var raw = null;
        try { raw = window.localStorage.getItem(STORE_KEY); } catch (e) { /* private mode */ }
        if (!raw) raw = readCookie(COOKIE_KEY);
        if (!raw && memoryFallback) return memoryFallback;
        if (!raw) return null;
        try { return JSON.parse(raw); } catch (e) { return null; }
    }
    function save(state) {
        var raw = JSON.stringify(state);
        memoryFallback = state;
        try { window.localStorage.setItem(STORE_KEY, raw); } catch (e) { /* ignore */ }
        // Cookie mirror is deliberately trimmed - cookies have a size limit.
        try {
            writeCookie(COOKIE_KEY, JSON.stringify({
                visitor_code: state.visitor_code,
                first_touch: state.first_touch,
                latest_touch: state.latest_touch,
                touch_path: state.touch_path,
                touch_count: state.touch_count,
                session_count: state.session_count,
                first_seen_at: state.first_seen_at
            }));
        } catch (e) { /* ignore */ }
    }

    // --------------------------------------------------------------- params
    var params = new URLSearchParams(window.location.search);
    function p(name) {
        var v = params.get(name);
        return v ? String(v).slice(0, 300) : '';
    }

    var CLICK_IDS = [
        ['gclid', 'google'], ['wbraid', 'google'], ['gbraid', 'google'],
        ['fbclid', 'meta'], ['li_fat_id', 'linkedin'], ['msclkid', 'microsoft'],
        ['ttclid', 'tiktok']
    ];

    function detectClickId() {
        for (var i = 0; i < CLICK_IDS.length; i++) {
            var v = p(CLICK_IDS[i][0]);
            if (v) return { id: v, type: CLICK_IDS[i][0], channel: CLICK_IDS[i][1] };
        }
        return null;
    }

    // Normalise many spellings of a source into one canonical channel.
    function canonicalSource(utmSource, utmMedium, clickChannel) {
        var s = (utmSource || '').toLowerCase();
        if (/facebook|instagram|^fb$|^ig$|meta|threads/.test(s)) return 'meta';
        if (/linkedin|^li$/.test(s)) return 'linkedin';
        if (/google|adwords|gads/.test(s)) return 'google';
        if (/bing|microsoft/.test(s)) return 'microsoft';
        if (/tiktok/.test(s)) return 'tiktok';
        if (s) return s.replace(/[^a-z0-9_-]/g, '').slice(0, 40);
        if (clickChannel) return clickChannel;
        if (/cpc|paid/.test((utmMedium || '').toLowerCase())) return 'paid_other';
        return '';
    }

    function pageArea() {
        return (document.body && document.body.dataset.area) ||
            (window.CWC_AREA || '') || '';
    }
    function pageIntent() {
        return (document.body && document.body.dataset.intent) || 'rent';
    }

    // Build the touch object for THIS arrival, or null if not a campaign touch.
    function buildTouch() {
        var click = detectClickId();
        var utmSource = p('utm_source');
        var source = canonicalSource(utmSource, p('utm_medium'), click && click.channel);

        // A touch is only recorded for a paid/tagged arrival. Organic and
        // direct revisits still count as sessions but must not pollute the path.
        if (!click && !utmSource) return null;

        return {
            touch_code: newCode('T'),
            source: source,
            medium: p('utm_medium'),
            campaign: p('utm_campaign'),
            content: p('utm_content'),
            term: p('utm_term'),
            click_id: click ? click.id : '',
            click_id_type: click ? click.type : '',
            campaign_id: p('campaign_id') || p('campaignid'),
            adgroup_id: p('adgroup_id') || p('adgroupid'),
            adset_id: p('adset_id') || p('adsetid'),
            ad_id: p('ad_id') || p('adid'),
            creative_id: p('creative_id') || p('creative'),
            keyword_target_id: p('keyword_target_id') || p('targetid'),
            matched_keyword: p('utm_term') || p('keyword'),
            match_type: p('match_type') || p('matchtype'),
            network: p('network'),
            device_param: p('device'),
            placement: p('placement'),
            physical_location_id: p('physical_location_id') || p('loc_physical_ms'),
            interest_location_id: p('interest_location_id') || p('loc_interest_ms'),
            area: pageArea(),
            intent: pageIntent(),
            landing_url: String(window.location.href).slice(0, 500),
            referrer: String(document.referrer || '').slice(0, 300),
            timestamp: new Date().toISOString()
        };
    }

    function buildPath(touches) {
        var path = [];
        for (var i = 0; i < touches.length; i++) {
            var s = touches[i].source || 'unknown';
            if (path[path.length - 1] !== s) path.push(s);   // collapse repeats
        }
        return path.join(' > ');
    }

    // ----------------------------------------------------------------- init
    var now = Date.now();
    var nowIso = new Date().toISOString();
    var state = load();
    var isNewVisitor = !state || !state.visitor_code;
    var isNewSession;

    if (isNewVisitor) {
        state = {
            visitor_code: newVisitorCode(),
            first_seen_at: nowIso,
            last_seen_at: nowIso,
            session_count: 1,
            touch_count: 0,
            touches: [],
            touch_path: '',
            first_touch: null,
            latest_touch: null,
            session_code: newCode('S'),
            session_started_at: nowIso,
            lead_codes: []
        };
        isNewSession = true;
    } else {
        var last = Date.parse(state.last_seen_at || 0) || 0;
        isNewSession = (now - last) > SESSION_GAP_MS || !state.session_code;
        if (isNewSession) {
            state.session_code = newCode('S');
            state.session_started_at = nowIso;
            state.session_count = (state.session_count || 0) + 1;
        }
        state.touches = state.touches || [];
        state.lead_codes = state.lead_codes || [];
    }

    var previousSource = state.latest_touch ? state.latest_touch.source : '';
    var thisTouch = buildTouch();

    if (thisTouch) {
        // FIRST TOUCH IS WRITE-ONCE. This is the defect the old code had.
        if (!state.first_touch) state.first_touch = thisTouch;
        state.latest_touch = thisTouch;
        state.touches.push({
            touch_code: thisTouch.touch_code,
            source: thisTouch.source,
            campaign: thisTouch.campaign,
            click_id: thisTouch.click_id,
            timestamp: thisTouch.timestamp
        });
        if (state.touches.length > MAX_TOUCHES) {
            // Keep the first touch plus the most recent ones.
            state.touches = [state.touches[0]].concat(
                state.touches.slice(state.touches.length - (MAX_TOUCHES - 1)));
        }
        state.touch_count = (state.touch_count || 0) + 1;
        state.touch_path = buildPath(state.touches);
    }

    state.last_seen_at = nowIso;
    save(state);

    // ------------------------------------------------------------- snapshot
    function daysBetween(aIso, bMs) {
        var a = Date.parse(aIso || 0);
        if (!a) return null;
        return Math.round(((bMs - a) / 86400000) * 10) / 10;
    }

    function snapshot() {
        var ft = state.first_touch || {};
        var lt = state.latest_touch || {};
        var out = {
            visitor_code: state.visitor_code,
            session_code: state.session_code,
            area: pageArea(),
            intent: pageIntent(),
            is_returning: !isNewVisitor,
            session_count: state.session_count || 1,
            touch_count: state.touch_count || 0,
            touch_path: state.touch_path || '',
            first_touch_source: ft.source || '',
            first_touch_medium: ft.medium || '',
            first_touch_campaign: ft.campaign || '',
            first_touch_at: ft.timestamp || '',
            // First-touch detail is retained in full. Without this, a visitor
            // who arrives on Meta and converts on Google loses every Meta
            // identifier, which defeats the point of multi-touch tracking.
            first_touch_content: ft.content || '',
            first_touch_term: ft.term || '',
            first_touch_click_id: ft.click_id || '',
            first_touch_click_id_type: ft.click_id_type || '',
            first_touch_campaign_id: ft.campaign_id || '',
            first_touch_adset_id: ft.adset_id || '',
            first_touch_adgroup_id: ft.adgroup_id || '',
            first_touch_ad_id: ft.ad_id || '',
            first_touch_creative_id: ft.creative_id || '',
            first_touch_placement: ft.placement || '',
            first_touch_area: ft.area || '',
            first_touch_intent: ft.intent || '',
            latest_touch_source: lt.source || '',
            latest_touch_medium: lt.medium || '',
            latest_touch_campaign: lt.campaign || '',
            latest_touch_at: lt.timestamp || '',
            click_id: lt.click_id || '',
            click_id_type: lt.click_id_type || '',
            matched_keyword: lt.matched_keyword || '',
            match_type: lt.match_type || '',
            network: lt.network || '',
            device_param: lt.device_param || '',
            placement: lt.placement || '',
            campaign_id: lt.campaign_id || '',
            adgroup_id: lt.adgroup_id || '',
            adset_id: lt.adset_id || '',
            ad_id: lt.ad_id || '',
            creative_id: lt.creative_id || '',
            keyword_target_id: lt.keyword_target_id || '',
            physical_location_id: lt.physical_location_id || '',
            interest_location_id: lt.interest_location_id || '',
            page_url: String(window.location.href).slice(0, 500),
            referrer: String(document.referrer || '').slice(0, 300),
            first_seen_at: state.first_seen_at || '',
            days_since_first_touch: daysBetween(ft.timestamp, now)
        };
        // Individual click ids, so the lead email shows them explicitly.
        // Checked against the current URL, the latest touch AND the first
        // touch, so e.g. an fbclid survives a later Google conversion.
        for (var i = 0; i < CLICK_IDS.length; i++) {
            var key = CLICK_IDS[i][0];
            var val = p(key) ||
                (lt.click_id_type === key ? lt.click_id : '') ||
                (ft.click_id_type === key ? ft.click_id : '');
            if (val) out[key] = val;
        }
        // UTMs of the current arrival (falls back to latest touch).
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
            var v = p(k);
            if (v) out[k] = v;
        });
        if (!out.utm_source && lt.source) out.utm_source = lt.source;
        return out;
    }

    // ---------------------------------------------------------------- track
    function baseProps() {
        var s = snapshot();
        return {
            visitor_code: s.visitor_code,
            session_code: s.session_code,
            area: s.area,
            intent: s.intent,
            is_returning: s.is_returning,
            session_count: s.session_count,
            touch_count: s.touch_count,
            touch_path: s.touch_path,
            first_touch_source: s.first_touch_source,
            first_touch_campaign: s.first_touch_campaign,
            first_touch_at: s.first_touch_at,
            latest_touch_source: s.latest_touch_source,
            latest_touch_campaign: s.latest_touch_campaign,
            click_id: s.click_id,
            click_id_type: s.click_id_type,
            matched_keyword: s.matched_keyword,
            match_type: s.match_type,
            page_url: s.page_url
        };
    }

    function track(event, props) {
        var merged = baseProps();
        if (props) {
            for (var k in props) {
                if (Object.prototype.hasOwnProperty.call(props, k)) merged[k] = props[k];
            }
        }
        try {
            if (window.posthog && typeof window.posthog.capture === 'function') {
                window.posthog.capture(event, merged);
            }
        } catch (e) { /* never break the page for analytics */ }
    }

    function newLeadCode() {
        var code = newCode('L');
        state.lead_codes = (state.lead_codes || []).concat([code]).slice(-10);
        save(state);
        return code;
    }

    // ------------------------------------------------- hidden form fields
    function setHidden(form, name, value) {
        if (value === null || value === undefined || value === '') return;
        var existing = form.querySelector('input[name="' + name + '"]');
        if (existing) { existing.value = value; return; }
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }

    function injectInto(form, extra) {
        if (!form) return;
        var s = snapshot();
        // Device context, so it is readable in the lead email too.
        s.device_type = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
        s.viewport = window.innerWidth + 'x' + window.innerHeight;
        s.submitted_at = new Date().toISOString();
        if (extra) {
            for (var k in extra) {
                if (Object.prototype.hasOwnProperty.call(extra, k)) s[k] = extra[k];
            }
        }
        Object.keys(s).forEach(function (key) { setHidden(form, key, s[key]); });
    }

    function injectAllForms(extra) {
        var forms = document.querySelectorAll('form');
        for (var i = 0; i < forms.length; i++) injectInto(forms[i], extra);
    }

    // ------------------------------------------------------- page events
    function firePageEvents() {
        track('campaign_landing_viewed', {
            is_paid: !!thisTouch,
            network: thisTouch ? thisTouch.network : '',
            device_param: thisTouch ? thisTouch.device_param : '',
            placement: thisTouch ? thisTouch.placement : ''
        });

        if (thisTouch) {
            track('campaign_touch_recorded', {
                touch_code: thisTouch.touch_code,
                touch_index: state.touch_count,
                source: thisTouch.source,
                campaign: thisTouch.campaign,
                campaign_id: thisTouch.campaign_id,
                adset_id: thisTouch.adset_id,
                adgroup_id: thisTouch.adgroup_id,
                ad_id: thisTouch.ad_id,
                creative_id: thisTouch.creative_id,
                placement: thisTouch.placement
            });
        }

        if (!isNewVisitor && isNewSession) {
            track('return_visit_recorded', {
                days_since_first_touch: daysBetween(
                    (state.first_touch || {}).timestamp, now),
                days_since_last_visit: daysBetween(state.last_seen_at, now),
                previous_source: previousSource
            });
        }

        track('intent_experience_viewed', {
            intent: pageIntent(),
            intent_source: params.get('intent') ? 'url_param' : 'default'
        });
    }

    // ------------------------------------------------------- scroll depth
    function initScrollDepth() {
        var marks = [25, 50, 75, 90];
        var hit = {};
        var started = Date.now();
        function onScroll() {
            var doc = document.documentElement;
            var scrollable = doc.scrollHeight - window.innerHeight;
            if (scrollable <= 0) return;
            var pct = ((window.scrollY || doc.scrollTop) / scrollable) * 100;
            for (var i = 0; i < marks.length; i++) {
                var m = marks[i];
                if (pct >= m && !hit[m]) {
                    hit[m] = true;
                    track('scroll_depth_reached', {
                        depth_percent: m,
                        seconds_to_depth: Math.round((Date.now() - started) / 100) / 10
                    });
                }
            }
            if (hit[90]) window.removeEventListener('scroll', onScroll);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // --------------------------------------------------------- form funnel
    function initFormFunnel() {
        var form = document.getElementById('leadCaptureForm');
        if (!form) return;
        var card = form.closest('.lead-card') || form;

        // form_viewed - at least half visible for a full second.
        if ('IntersectionObserver' in window) {
            var timer = null;
            var seen = false;
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        if (seen || timer) return;
                        timer = window.setTimeout(function () {
                            seen = true;
                            var doc = document.documentElement;
                            var scrollable = doc.scrollHeight - window.innerHeight;
                            track('form_viewed', {
                                scroll_depth_at_view: scrollable > 0
                                    ? Math.round(((window.scrollY || 0) / scrollable) * 100)
                                    : 0
                            });
                            io.disconnect();
                        }, 1000);
                    } else if (timer) {
                        window.clearTimeout(timer);
                        timer = null;
                    }
                });
            }, { threshold: [0, 0.5, 1] });
            io.observe(card);
        }

        // form_started - first interaction with any field.
        var started = false;
        function onFirstInput(e) {
            if (started) return;
            var t = e.target;
            if (!t || !t.name || t.name === '_gotcha' || t.type === 'hidden') return;
            started = true;
            track('form_started', { first_field: t.name });
        }
        form.addEventListener('focusin', onFirstInput);
        form.addEventListener('input', onFirstInput);
    }

    // --------------------------------------------- WhatsApp and telephone
    var waClicks = 0;
    var telClicks = 0;

    function buttonLocation(el) {
        if (el.closest('.sticky-actions')) return 'sticky_bar';
        if (el.closest('.site-footer')) return 'footer';
        if (el.closest('.site-header')) return 'header';
        return 'inline';
    }

    function initContactLinks() {
        var area = pageArea() || 'Dubai';
        var verb = pageIntent() === 'sale' ? 'to buy' : 'for rent';

        // Prefill every WhatsApp link with an area/intent message + reference.
        var waLinks = document.querySelectorAll('a[href*="wa.me"]');
        for (var i = 0; i < waLinks.length; i++) {
            (function (link) {
                var ref = newCode('W');
                link.dataset.cwcRef = ref;
                var base = link.href.split('?')[0];
                var msg = "Hi, I'm enquiring about office space " + verb +
                    ' in ' + area + '. [Ref: ' + ref + ']';
                link.href = base + '?text=' + encodeURIComponent(msg);
            })(waLinks[i]);
        }

        document.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('a');
            if (!a || !a.href) return;

            if (a.href.indexOf('wa.me') !== -1) {
                waClicks++;
                track('whatsapp_clicked', {
                    whatsapp_reference: a.dataset.cwcRef || '',
                    button_location: buttonLocation(a),
                    is_repeat_click: waClicks > 1,
                    click_index: waClicks
                });
            } else if (a.href.indexOf('tel:') === 0 || a.href.indexOf('tel:') !== -1) {
                telClicks++;
                track('phone_clicked', {
                    phone_reference: newCode('P'),
                    button_location: buttonLocation(a),
                    phone_number: a.href.replace('tel:', ''),
                    is_repeat_click: telClicks > 1,
                    click_index: telClicks
                });
            } else if (a.getAttribute('href') === '#lead-form') {
                track('enquire_button_clicked', { button_location: buttonLocation(a) });
            }
        }, true);
    }

    // ----------------------------------------------------------- bootstrap
    window.CWC = {
        snapshot: snapshot,
        track: track,
        newLeadCode: newLeadCode,
        injectInto: injectInto,
        injectAllForms: injectAllForms,
        isNewVisitor: isNewVisitor,
        isNewSession: isNewSession,
        thisTouch: thisTouch
    };

    function boot() {
        injectAllForms();
        firePageEvents();
        initScrollDepth();
        initFormFunnel();
        initContactLinks();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window, document);
