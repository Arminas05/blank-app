/* CINDER motion — scroll progress, reveal-on-scroll, parallax/scrub, sticky CTA,
   accordions, product gallery and the proof video's visibility handling.

   Ported from the prototype's componentDidMount/wireInteractions. Every effect
   here is decorative: if this file fails to load the page still reads and sells. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cfg = window.CinderMotion || {};
  var allowReveal = cfg.reveal !== false;
  var allowParallax = cfg.parallax !== false && !reduced;

  /* ---------- scroll: progress bar, sticky CTA, parallax ---------- */

  var progress = document.getElementById('prog');
  var stickyCta = document.querySelector('.sticky-cta');
  var header = document.querySelector('.site-header');
  var parallaxEls = [];
  var scrubEls = [];

  function collectScrollEls() {
    parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
    scrubEls = [].slice.call(document.querySelectorAll('[data-scrub]'));
  }

  function onScroll() {
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    var pct = doc.scrollTop / max;

    if (progress) progress.style.width = (pct * 100).toFixed(2) + '%';

    if (header) header.classList.toggle('is-stuck', doc.scrollTop > 60);

    if (stickyCta) {
      stickyCta.classList.toggle(
        'is-visible',
        window.innerWidth < 760 && doc.scrollTop > 700
      );
    }

    if (!allowParallax) return;

    var y = doc.scrollTop;
    parallaxEls.forEach(function (el) {
      var k = parseFloat(el.getAttribute('data-parallax')) || 0;
      el.style.transform = 'translate3d(0,' + (-y * k).toFixed(1) + 'px,0)';
    });
    scrubEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var t = Math.min(1, Math.max(0, 1 - r.top / Math.max(1, window.innerHeight)));
      el.style.transform = 'scale(' + (1 + t * 0.06).toFixed(4) + ')';
    });
  }

  collectScrollEls();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- reveal on scroll ---------- */

  if (allowReveal && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        // Siblings entering together cascade rather than snapping in as a block.
        entries
          .filter(function (e) {
            return e.isIntersecting;
          })
          .forEach(function (e) {
            var parent = e.target.parentElement;
            var sibs = parent
              ? [].slice.call(parent.children).filter(function (n) {
                  return n.hasAttribute && n.hasAttribute('data-reveal');
                })
              : [];
            var i = Math.max(0, sibs.indexOf(e.target));
            e.target.style.transitionDelay =
              Math.min(i * (reduced ? 30 : 70), reduced ? 180 : 420) + 'ms';
            e.target.classList.add('is-revealed');
            io.unobserve(e.target);
          });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    var scan = function () {
      document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(function (el) {
        io.observe(el);
      });
      collectScrollEls();
    };
    scan();
    setInterval(scan, 900);

    // Failsafe: never leave content invisible because an observer misfired.
    var showAll = function () {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.classList.add('is-revealed');
      });
    };
    setTimeout(showAll, 1400);
    window.addEventListener('beforeprint', showAll);
    document.addEventListener('visibilitychange', showAll);
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  /* ---------- accordions ---------- */

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.accordion__trigger');
    if (!trigger) return;
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    var open = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!open));
    panel.style.maxHeight = open ? '0px' : panel.scrollHeight + 'px';
  });

  /* ---------- product gallery ---------- */

  document.addEventListener('click', function (e) {
    var thumb = e.target.closest('.product-gallery__thumb');
    if (!thumb) return;
    var gallery = thumb.closest('.product-gallery');
    if (!gallery) return;
    var main = gallery.querySelector('.product-gallery__main img');
    if (main) {
      main.src = thumb.dataset.full || thumb.querySelector('img').src;
      main.alt = thumb.querySelector('img').alt;
    }
    gallery.querySelectorAll('.product-gallery__thumb').forEach(function (t) {
      t.setAttribute('aria-current', String(t === thumb));
    });
  });

  /* ---------- proof video ----------
     Plays only while on screen and never fights a pause the visitor made
     deliberately. The mute/volume choice is remembered so a re-render or a
     revisit does not silently re-mute it. */

  var video = document.querySelector('[data-proof-video]');
  if (video) {
    var userPaused = false;
    var autoPause = false;
    var visible = false;
    var wantAudio = false;

    try {
      wantAudio = localStorage.getItem('cinderProofAudio') === '1';
    } catch (err) {
      /* private mode — fall back to muted */
    }

    video.muted = !wantAudio;
    video.loop = true;
    video.controls = true;
    video.setAttribute('controlsList', 'nodownload');
    video.setAttribute('disablePictureInPicture', '');
    video.removeAttribute('autoplay');

    video.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });

    var tryPlay = function () {
      if (userPaused || !visible) return;
      var p = video.play();
      if (p && p.catch) {
        p.catch(function () {
          // Autoplay with sound is blocked until the visitor interacts; retry muted.
          video.muted = true;
          var q = video.play();
          if (q && q.catch) q.catch(function () {});
        });
      }
    };

    video.addEventListener('volumechange', function () {
      try {
        localStorage.setItem(
          'cinderProofAudio',
          !video.muted && video.volume > 0 ? '1' : '0'
        );
      } catch (err) {
        /* ignore */
      }
      // Turning the volume up is an explicit ask to hear it: resume if paused.
      if (!video.muted && video.volume > 0) {
        userPaused = false;
        tryPlay();
      }
    });

    video.addEventListener('pause', function () {
      if (!autoPause) userPaused = true;
    });
    video.addEventListener('play', function () {
      userPaused = false;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            visible = e.isIntersecting;
            if (e.isIntersecting) {
              tryPlay();
            } else if (!video.paused) {
              autoPause = true;
              video.pause();
              autoPause = false;
            }
          });
        },
        { threshold: 0 }
      ).observe(video);
    }
  }

  /* ---------- time-math calculator ---------- */

  var calc = document.querySelector('[data-time-math]');
  if (calc) {
    var mins = calc.querySelector('[data-input-mins]');
    var cooks = calc.querySelector('[data-input-cooks]');
    var weeks = parseInt(calc.dataset.weeks, 10) || 26;
    var target = parseFloat(calc.dataset.target) || 1.5;

    var recalc = function () {
      var m = parseFloat(mins.value) || 0;
      var c = parseFloat(cooks.value) || 0;
      calc.querySelector('[data-out-mins]').textContent = m;
      calc.querySelector('[data-out-cooks]').textContent = c;
      calc.querySelector('[data-out-hours]').textContent = ((m * c * weeks) / 60).toFixed(1);
      calc.querySelector('[data-out-new]').textContent =
        ((target * c * weeks) / 60).toFixed(1) + ' hours';
    };

    mins.addEventListener('input', recalc);
    cooks.addEventListener('input', recalc);
    recalc();
  }
})();
