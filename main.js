/* ============================================================
   FACUNDO TREES — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. HAMBURGER MENU ───────────────────────────────────── */
  const hamburger  = document.querySelector('.hamburger');
  const mobileNav  = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });

    // Close on any mobile nav link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── 2. HEADER SHADOW ON SCROLL ──────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ── 3. BACK-TO-TOP BUTTON ───────────────────────────────── */
  const btt = document.createElement('button');
  btt.id = 'back-to-top';
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '&#8679;';
  document.body.appendChild(btt);

  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── 4. SMOOTH SCROLL for anchor links ───────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const offset = (header ? header.offsetHeight : 0) + 12;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── 5. SCROLL-TRIGGERED FADE-IN ─────────────────────────── */
  // Add .reveal class to eligible elements; JS adds .visible when in view
  const revealSelectors = [
    '.service-card',
    '.step',
    '.detail-text',
    '.detail-images',
    '.gallery img',
    '.badge',
    '.faq-item',
    '.service-item',
    '.before-after-item',
    '.sub-service',
    '.section-intro',
  ].join(', ');

  const revealEls = document.querySelectorAll(revealSelectors);
  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger siblings in grid-like parents
      const siblings = el.parentElement.querySelectorAll(':scope > .reveal');
      const idx = Array.from(siblings).indexOf(el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx * 80, 320) + 'ms';
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  }

  /* ── 6. COUNTER ANIMATION for stat numbers ───────────────── */
  // Looks for elements with data-count="98" etc.
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const counterIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const end   = parseFloat(el.dataset.count);
        const isInt = Number.isInteger(end);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const dur   = 1400;
        const start = performance.now();

        const tick = now => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / dur, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = end * eased;
          el.textContent = prefix + (isInt ? Math.round(val) : val.toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterIO.observe(el));
  }

  /* ── 7. GALLERY LIGHTBOX ─────────────────────────────────── */
  const galleryImgs = document.querySelectorAll('.gallery img');
  if (galleryImgs.length) {
    // Build lightbox DOM
    const overlay = document.createElement('div');
    overlay.id = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.innerHTML = `
      <button id="lb-close" aria-label="Close">&times;</button>
      <button id="lb-prev" aria-label="Previous">&#8249;</button>
      <img id="lb-img" src="" alt="" />
      <button id="lb-next" aria-label="Next">&#8250;</button>
      <p id="lb-caption"></p>`;
    document.body.appendChild(overlay);

    const lbImg     = overlay.querySelector('#lb-img');
    const lbCaption = overlay.querySelector('#lb-caption');
    const lbClose   = overlay.querySelector('#lb-close');
    const lbPrev    = overlay.querySelector('#lb-prev');
    const lbNext    = overlay.querySelector('#lb-next');
    const imgs      = Array.from(galleryImgs);
    let current     = 0;

    const show = idx => {
      current = (idx + imgs.length) % imgs.length;
      lbImg.src = imgs[current].src;
      lbImg.alt = imgs[current].alt;
      lbCaption.textContent = imgs[current].alt;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    };

    const close = () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      imgs[current].focus();
    };

    imgs.forEach((img, i) => {
      img.style.cursor = 'zoom-in';
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `View full size: ${img.alt || 'photo'}`);
      img.addEventListener('click', () => show(i));
      img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); }});
    });

    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', () => show(current - 1));
    lbNext.addEventListener('click', () => show(current + 1));

    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowRight')  show(current + 1);
      if (e.key === 'ArrowLeft')   show(current - 1);
    });
  }

  /* ── 8. FAQ — keyboard accessibility enhancement ─────────── */
  // Native <details> already works; just ensure focus styles are visible
  // Nothing needed beyond CSS

  /* ── 9. ACTIVE NAV LINK on scroll (single-page sections) ─── */
  const navLinks   = document.querySelectorAll('.site-header nav a[href^="#"], .mobile-nav a[href^="#"]');
  const sections   = [];
  navLinks.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) sections.push({ link, sec });
  });

  if (sections.length) {
    const activateNav = () => {
      const scrollY = window.scrollY + 120;
      let active = null;
      sections.forEach(({ sec }) => {
        if (sec.offsetTop <= scrollY) active = sec.id;
      });
      sections.forEach(({ link, sec }) => {
        link.classList.toggle('active', sec.id === active);
      });
    };
    window.addEventListener('scroll', activateNav, { passive: true });
  }

})();
