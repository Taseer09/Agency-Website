/* ================================================================
   SPINNERS — Main JavaScript
   ─ Preloader: full splash only on FIRST homepage visit (sessionStorage)
   ─ Sub-pages: instant curtain-out reveal (no lengthy preloader)
   ─ Page transitions: 400ms curtain, coordinated via sessionStorage flag
   ─ Mobile dropdown: tap-toggled Resources menu
   ─ Scroll reveal, cursor, magnetic buttons, nav, back-to-top
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ─────────────────────────────────────────────
       1. PRELOADER  (index.html only)
       Shows the full experience only on the very
       first visit in a browser session. After that,
       the preloader is skipped and content fades in.
    ───────────────────────────────────────────── */
    const preloader  = document.getElementById('preloader');
    const pageReveal = document.getElementById('page-reveal');
    const barFill    = document.getElementById('preloader-bar');
    const counterEl  = document.getElementById('preloader-counter');

    if (preloader) {
        const hasHash = window.location.hash && window.location.hash !== '#';
        if (!sessionStorage.getItem('spinnersHomeVisited') && !hasHash) {
            sessionStorage.setItem('spinnersHomeVisited', 'true');
            document.body.classList.add('page-animating');

            let progress = 0;
            const totalDuration = 2200;
            const interval      = 25;
            const steps         = totalDuration / interval;
            let step            = 0;

            const tick = setInterval(() => {
                step++;
                const ease = 1 - Math.pow(1 - step / steps, 3);
                progress = Math.min(Math.round(ease * 100), 100);

                if (barFill)   barFill.style.width  = progress + '%';
                if (counterEl) counterEl.textContent = progress;

                if (progress >= 100) {
                    clearInterval(tick);
                    finishPreloader();
                }
            }, interval);

            function finishPreloader() {
                setTimeout(() => preloader.classList.add('hidden'), 200);
                setTimeout(() => { if (pageReveal) pageReveal.classList.add('revealed'); }, 300);
                setTimeout(() => {
                    document.body.classList.remove('page-animating');
                    document.body.classList.add('page-ready');
                }, 800);
            }
        } else {
            // Already visited this session or navigated to a hash, hide immediately
            sessionStorage.setItem('spinnersHomeVisited', 'true');
            preloader.style.display = 'none';
            if (pageReveal) pageReveal.style.display = 'none';
            document.body.classList.add('page-ready');
        }
    }

    // Removed PAGE TRANSITION CURTAIN to keep it simple and clean.

    /* ─────────────────────────────────────────────
       3. SCROLL REVEAL
    ───────────────────────────────────────────── */
    const revealEls = document.querySelectorAll('.reveal');

    if (revealEls.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, i * 80);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    /* ─────────────────────────────────────────────
       4. MOBILE DROPDOWN (Resources menu)
       Tap the "Resources" link to toggle open/close.
       Tapping any sub-link closes the mobile nav.
    ───────────────────────────────────────────── */
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks   = document.querySelector('.nav-links');

    // Toggle Resources dropdown on mobile tap
    document.querySelectorAll('.nav-links .dropdown').forEach(dropdown => {
        const trigger = dropdown.querySelector(':scope > a');
        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
            // Only intercept on mobile (hamburger visible)
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('active');
            }
        });
    });

    // Hamburger toggle
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Close any open dropdowns when nav closes
            if (!navLinks.classList.contains('active')) {
                navLinks.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            }
        });

        // Close nav when a non-dropdown link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            // Don't close nav if clicking the Resources trigger itself
            const isDropdownTrigger = link.closest('.dropdown') && !link.closest('.dropdown-menu');
            if (isDropdownTrigger) return;

            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navLinks.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            });
        });
    }

    /* ─────────────────────────────────────────────
       5. CUSTOM CURSOR
    ───────────────────────────────────────────── */
    const cursor = document.getElementById('custom-cursor');

    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top  = e.clientY + 'px';
        });

        const clickables = document.querySelectorAll('a, button, .service-item, .btn-editorial, .dropdown, .menu-toggle');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    /* ─────────────────────────────────────────────
       6. BACK TO TOP
    ───────────────────────────────────────────── */
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 400);
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ─────────────────────────────────────────────
       7. MAGNETIC BUTTONS
    ───────────────────────────────────────────── */
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const pos = btn.getBoundingClientRect();
            const x   = e.clientX - (pos.left + pos.width  / 2);
            const y   = e.clientY - (pos.top  + pos.height / 2);
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.5}px)`;
        });
        btn.addEventListener('mouseout', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    /* ─────────────────────────────────────────────
       8. SMOOTH SCROLL (hash anchors)
    ───────────────────────────────────────────── */
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            try {
                const url = new URL(this.href);
                // Check if the link points to the same page
                const isSamePage = url.pathname === window.location.pathname || 
                                   (window.location.pathname.endsWith('/') && url.pathname.endsWith('index.html')) ||
                                   (window.location.pathname.endsWith('index.html') && url.pathname.endsWith('/'));

                if (isSamePage) {
                    const targetId = url.hash;
                    if (!targetId || targetId === '#') {
                        if (this.getAttribute('href') === '#') e.preventDefault();
                        return;
                    }

                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        const navHeight      = document.querySelector('nav').offsetHeight;
                        const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                        window.history.pushState(null, '', targetId);
                    }
                }
            } catch(err) {
                // Fallback / ignore invalid URLs
            }
        });
    });

    // On page load, if there's a hash, smooth scroll to it
    if (window.location.hash) {
        setTimeout(() => {
            const targetEl = document.querySelector(window.location.hash);
            if (targetEl) {
                const navHeight      = document.querySelector('nav').offsetHeight;
                const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        }, 150);
    }

    /* ─────────────────────────────────────────────
       9. NAVBAR SCROLL EFFECT
    ───────────────────────────────────────────── */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.style.boxShadow = window.scrollY > 50
                ? '0 10px 30px rgba(0,0,0,0.02)'
                : 'none';
        });
    }

    console.log('Spinners — All systems initialized.');
});
