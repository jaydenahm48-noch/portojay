/**
 * about-animations.js
 * RPG pixel-world About Me animations.
 * Runs only when the About section is active.
 * Respects prefers-reduced-motion.
 */

(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var aboutInitialized = false;

    // ── Helpers ──────────────────────────────────────────────────────────────

    function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
    function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

    // ── Typewriter ───────────────────────────────────────────────────────────

    function initTypewriter() {
        var dialog = qs('#about-dialog');
        if (!dialog || dialog.dataset.typedDone) return;

        var fullText = dialog.dataset.fullText || '';
        var displayEl = qs('.rpg-typewriter', dialog);
        var cursor = qs('.rpg-typewriter-cursor', dialog);
        var skipBtn = qs('.rpg-skip', dialog);
        if (!displayEl) return;

        if (reducedMotion) {
            displayEl.textContent = fullText;
            if (cursor) cursor.classList.add('hidden');
            if (skipBtn) skipBtn.classList.add('done');
            dialog.dataset.typedDone = '1';
            return;
        }

        var idx = 0;
        var speed = 22;
        var timer = null;
        displayEl.textContent = '';

        function finish() {
            clearInterval(timer);
            displayEl.textContent = fullText;
            if (cursor) cursor.classList.add('hidden');
            if (skipBtn) skipBtn.classList.add('done');
            dialog.dataset.typedDone = '1';
        }

        function type() {
            if (idx < fullText.length) {
                displayEl.textContent = fullText.slice(0, ++idx);
            } else {
                finish();
            }
        }

        timer = setInterval(type, speed);

        if (skipBtn) {
            skipBtn.addEventListener('click', finish, { once: true });
        }
        // Also skip on click anywhere in dialog
        dialog.addEventListener('click', finish, { once: true });
    }

    // ── Personal info rows ───────────────────────────────────────────────────

    function revealInfoRows() {
        var rows = qsa('.about-info-row');
        rows.forEach(function (row, i) {
            if (reducedMotion) {
                row.classList.add('row-visible');
                return;
            }
            setTimeout(function () {
                row.classList.add('row-visible');
                row.style.animationDelay = '0s';
            }, 80 + i * 55);
        });
    }

    // ── Skill bars ───────────────────────────────────────────────────────────

    function animateSkills() {
        var skills = qsa('.about .skill-item');
        skills.forEach(function (item, i) {
            if (reducedMotion) {
                item.classList.add('skill-visible');
                return;
            }
            setTimeout(function () {
                var bar = qs('.progress-in', item);
                if (bar) {
                    // Capture target width from inline style
                    var targetWidth = bar.style.width || '0%';
                    // Reset to 0 so animation plays from 0
                    bar.style.width = '0%';
                    // Force reflow
                    bar.getBoundingClientRect();
                    // Apply animation + restore target width
                    bar.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
                    // Small delay before setting target so transition triggers
                    setTimeout(function () {
                        bar.style.width = targetWidth;
                    }, 30);
                }
                item.style.animationDelay = '0s';
                item.classList.add('skill-visible');
            }, 120 + i * 100);
        });
    }

    // ── Timeline ─────────────────────────────────────────────────────────────

    function animateTimeline(containerEl) {
        if (!containerEl) return;
        var items = qsa('.timeline-item', containerEl);
        var allItems = qsa('.timeline-item', qs('.about'));

        // Draw animated line
        var line = document.createElement('div');
        line.className = 'timeline-line-anim';
        containerEl.style.position = 'relative';
        containerEl.insertBefore(line, containerEl.firstChild);

        if (reducedMotion) {
            line.classList.add('drawn');
            items.forEach(function (item) { item.classList.add('item-visible'); });
            // Mark last education item as active milestone
            markActiveMilestone(allItems);
            return;
        }

        // Stagger item reveals
        items.forEach(function (item, i) {
            setTimeout(function () {
                item.classList.add('item-visible');
            }, 200 + i * 180);
        });

        // Draw line after first item
        setTimeout(function () { line.classList.add('drawn'); }, 300);

        markActiveMilestone(allItems);
    }

    function markActiveMilestone(allItems) {
        // Mark the last item (current stage) as active
        var last = allItems[allItems.length - 1];
        if (last) last.classList.add('milestone-active');
    }

    // ── Pixel particles canvas (About) ───────────────────────────────────────

    function initAboutParticles() {
        if (reducedMotion) return;
        if (window.innerWidth <= 767) return;

        var section = qs('#about');
        if (!section) return;

        // Remove existing canvas if any
        var existing = qs('.about-particles-canvas', section);
        if (existing) existing.remove();

        var canvas = document.createElement('canvas');
        canvas.className = 'about-particles-canvas';
        section.insertBefore(canvas, section.firstChild);

        var ctx = canvas.getContext('2d');
        var particles = [];
        var raf = null;
        var COLORS = ['#ec1839', '#ffffff', '#8fa3b8'];
        var COUNT = 30;

        function resize() {
            canvas.width  = section.offsetWidth;
            canvas.height = section.offsetHeight;
        }
        resize();

        for (var i = 0; i < COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: canvas.height * (0.3 + Math.random() * 0.7),
                size: Math.random() < 0.5 ? 2 : 3,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.35 - 0.1,
                alpha: Math.random() * 0.5 + 0.15,
                baseAlpha: 0,
            });
        }
        // Stagger alpha appearance
        particles.forEach(function (p, i) {
            setTimeout(function () { p.baseAlpha = p.alpha; }, i * 40);
        });

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(function (p) {
                if (!p.baseAlpha) return;
                ctx.globalAlpha = p.baseAlpha;
                ctx.fillStyle = p.color;
                ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -8) {
                    p.y = canvas.height + 4;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x < -8) p.x = canvas.width + 4;
                if (p.x > canvas.width + 8) p.x = -4;
            });
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(draw);
        }

        raf = requestAnimationFrame(draw);

        // Pause when section not visible
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    if (!raf) raf = requestAnimationFrame(draw);
                } else {
                    if (raf) { cancelAnimationFrame(raf); raf = null; }
                }
            });
        }, { threshold: 0.05 });
        observer.observe(section);

        window.addEventListener('resize', resize);
    }

    // ── Window light dots ────────────────────────────────────────────────────

    function initWindowLights() {
        if (reducedMotion) return;
        if (window.innerWidth <= 767) return;

        var section = qs('#about');
        if (!section) return;

        // Remove existing
        qsa('.about-win-light', section).forEach(function (el) { el.remove(); });

        var positions = [
            { left: '12%', top: '55%' }, { left: '15%', top: '62%' },
            { left: '18%', top: '58%' }, { left: '22%', top: '65%' },
            { left: '75%', top: '52%' }, { left: '78%', top: '60%' },
            { left: '82%', top: '57%' }, { left: '88%', top: '63%' },
            { left: '65%', top: '68%' }, { left: '68%', top: '73%' },
        ];

        positions.forEach(function (pos, i) {
            var dot = document.createElement('div');
            dot.className = 'about-win-light';
            dot.style.left = pos.left;
            dot.style.top  = pos.top;
            dot.style.setProperty('--win-dur',   (3.5 + Math.random() * 5).toFixed(1) + 's');
            dot.style.setProperty('--win-delay', (Math.random() * 4).toFixed(1) + 's');
            dot.style.setProperty('--win-base',  (0.4 + Math.random() * 0.4).toFixed(2));
            section.appendChild(dot);
        });
    }

    // ── Main init — runs when About becomes active ───────────────────────────

    function initAbout() {
        if (aboutInitialized) return;
        aboutInitialized = true;

        var section = qs('#about');
        if (!section) return;

        // Add visible class for CSS entrance animations
        section.classList.add('about-visible');

        // Run all systems with slight stagger
        initTypewriter();
        setTimeout(revealInfoRows, 200);
        setTimeout(animateSkills, 350);

        // Timeline — education
        var eduTimeline  = qs('.education .timeline', section);
        var expTimeline  = qs('.experience .timeline', section);
        setTimeout(function () { animateTimeline(eduTimeline); }, 450);
        setTimeout(function () { animateTimeline(expTimeline); }, 600);

        // Particles and atmosphere
        setTimeout(initAboutParticles, 100);
        setTimeout(initWindowLights,   150);
    }

    // ── Watch for About section activation ──────────────────────────────────

    function observeAbout() {
        var section = qs('#about');
        if (!section) return;

        // Method 1: watch for .active class (used by script.js nav)
        var mutObs = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                if (m.attributeName === 'class' && section.classList.contains('active')) {
                    initAbout();
                }
            });
        });
        mutObs.observe(section, { attributes: true, attributeFilter: ['class'] });

        // Method 2: IntersectionObserver fallback
        var ioObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting && e.intersectionRatio > 0.2) {
                    initAbout();
                }
            });
        }, { threshold: 0.2 });
        ioObs.observe(section);

        // Method 3: if About is already active on load
        if (section.classList.contains('active')) {
            setTimeout(initAbout, 50);
        }
    }

    // ── Boot ─────────────────────────────────────────────────────────────────

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeAbout);
    } else {
        observeAbout();
    }

})();
