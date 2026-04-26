/* ================================================================
   DROPPOINT — main.js
   Handles: navbar scroll effect, mobile menu, active link
   tracking, smooth scroll, and form feedback.
================================================================ */

(function () {
  'use strict';

  /* ── CONFIG ──────────────────────────────────────────────────
     Edit these values to adjust behaviour.
  ─────────────────────────────────────────────────────────────── */
  const CONFIG = {
    // px scrolled before navbar gets solid background
    navbarScrollThreshold: 20,

    // offset (px) from top of viewport when a section is
    // considered "active" during scroll tracking
    activeSectionOffset: 100,

    // form success message shown after submission
    contactSuccessMsg: 'Thanks! We\'ll be in touch soon. 🎉',
    subscribeSuccessMsg: 'You\'re on the list! We\'ll keep you updated.',

    // how long (ms) the success message stays visible
    formMsgDuration: 5000,
  };


  /* ── ELEMENTS ─────────────────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const navToggle   = document.getElementById('navToggle');
  const navLinks    = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('section[id]');
  const contactForm = document.getElementById('contactForm');
  const subForm     = document.getElementById('subscribeForm');
  const formNote    = document.getElementById('formNote');


  /* ── NAVBAR: scroll effect ───────────────────────────────── */
  function onScroll() {
    if (window.scrollY > CONFIG.navbarScrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    updateActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load


  /* ── NAVBAR: mobile toggle ───────────────────────────────── */
  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu when a link is clicked
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });


  /* ── NAVBAR: active link on scroll ──────────────────────── */
  function updateActiveLink() {
    let currentId = '';

    sections.forEach(function (section) {
      const contact_btn = document.getElementById('nav-contact-btn')
      const rect = section.getBoundingClientRect();
      if (rect.top <= CONFIG.activeSectionOffset) {
        currentId = section.id;
      }

      if (currentId == 'contact') {
        contact_btn.classList.add('shimmer')
      } else {
        contact_btn.classList.remove('shimmer')
      }
    });

    

    allNavLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === '#' + currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }


  /* ── CONTACT FORM ────────────────────────────────────────── */
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // In production: replace this block with a real fetch/POST
      // to your backend, e.g.:
      //
      //   const data = new FormData(contactForm);
      //   fetch('/api/contact', { method: 'POST', body: data })
      //     .then(r => r.json())
      //     .then(() => showMsg(formNote, CONFIG.contactSuccessMsg));
      //

      showMsg(formNote, CONFIG.contactSuccessMsg);
      contactForm.reset();
    });
  }


  /* ── SUBSCRIBE FORM ──────────────────────────────────────── */
  if (subForm) {
    subForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const emailInput = subForm.querySelector('input[type="email"]');
      if (!emailInput.value || !emailInput.checkValidity()) {
        emailInput.reportValidity();
        return;
      }

      // Replace with real API call when ready.
      const note = subForm.parentElement.querySelector('.subscribe-note');
      if (note) {
        const original = note.textContent;
        note.textContent = CONFIG.subscribeSuccessMsg;
        note.style.color = '#38BDF8';

        setTimeout(function () {
          note.textContent = original;
          note.style.color = '';
        }, CONFIG.formMsgDuration);
      }

      subForm.reset();
    });
  }


  /* ── VIDEO: autoplay on scroll ──────────────────────────── */
  // Requires enablejsapi=1 in the iframe src (already set in index.html).
  // Browsers only allow programmatic autoplay when the video is muted,
  // so mute=1 is also set in the src.
  if ('IntersectionObserver' in window) {
    const videoIframe = document.getElementById('promoVideo');

    if (videoIframe) {
      function sendYT(func) {
        videoIframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: func, args: [] }),
          'https://www.youtube.com'
        );
      }

      var videoObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              // Play first, then unmute — browser requires the video to be
              // playing before it will honour an unmute via postMessage.
              sendYT('playVideo');
              sendYT('unMute');
            } else {
              // Re-mute before pausing so it resets cleanly for the next scroll.
              sendYT('mute');
              sendYT('pauseVideo');
            }
          });
        },
        // Trigger when 50% of the iframe is visible
        { threshold: 0.5 }
      );

      videoObserver.observe(videoIframe);
    }
  }


  /* ── SCROLL REVEAL (simple fade-in on enter) ─────────────── */
  if ('IntersectionObserver' in window) {
    const revealElements = document.querySelectorAll(
      '.about-card, .product-card, .plan-card, .step, .contact-info-item'
    );

    // Set initial hidden state via JS (avoids flash if CSS not loaded)
    revealElements.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* ── HELPER: show a timed message ────────────────────────── */
  function showMsg(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.color = 'var(--color-primary)';

    setTimeout(function () {
      el.textContent = '';
    }, CONFIG.formMsgDuration);
  }

})();
