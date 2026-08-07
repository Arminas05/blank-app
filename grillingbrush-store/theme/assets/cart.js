/* GrillingBrush cart — replaces the prototype's local-state cart with the real
   Shopify Cart AJAX API (SHOPIFY-HANDOFF.md §4).

   Contract:
     - any form whose action is /cart/add posts to /cart/add.js instead. Matching
       on action (not a data attribute) means Shopify's {% form 'product' %} tag
       is picked up without needing to inject attributes into it.
     - the drawer re-renders from the cart-drawer section via the Section
       Rendering API, so markup lives in Liquid and never here
     - [data-cart-open] / [data-cart-close] toggle the drawer
     - [data-qty-change] adjusts a line by key */
(function () {
  'use strict';

  var overlay = document.querySelector('[data-cart-overlay]');
  var drawer = document.querySelector('[data-cart-drawer]');
  var busy = false;

  function openDrawer() {
    if (overlay) overlay.classList.add('is-open');
    if (drawer) {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      var close = drawer.querySelector('[data-cart-close]');
      if (close) close.focus();
    }
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (overlay) overlay.classList.remove('is-open');
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  /* Re-render the drawer and the header count from the server so the markup
     stays in Liquid. Falls back to a full reload if the fetch fails. */
  function refresh() {
    return fetch('?sections=cart-drawer', { headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('section fetch failed: ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var html = data['cart-drawer'];
        if (!html) return;
        var parsed = new DOMParser().parseFromString(html, 'text/html');

        var freshDrawer = parsed.querySelector('[data-cart-drawer]');
        var liveDrawer = document.querySelector('[data-cart-drawer]');
        if (freshDrawer && liveDrawer) {
          var wasOpen = liveDrawer.classList.contains('is-open');
          liveDrawer.innerHTML = freshDrawer.innerHTML;
          if (wasOpen) liveDrawer.classList.add('is-open');
        }

        var freshCount = parsed.querySelector('[data-cart-count]');
        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
          if (freshCount) el.textContent = freshCount.textContent;
        });
      })
      .catch(function (err) {
        console.warn('[grillingbrush] cart refresh failed, reloading', err);
        window.location.reload();
      });
  }

  function setBusy(form, state) {
    busy = state;
    if (!form) return;
    var btn = form.querySelector('[type="submit"]');
    if (btn) {
      btn.disabled = state;
      btn.dataset.idleLabel = btn.dataset.idleLabel || btn.textContent;
      btn.textContent = state ? 'Adding…' : btn.dataset.idleLabel;
    }
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[action*="/cart/add"]');
    if (!form || busy) return;
    e.preventDefault();
    setBusy(form, true);

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (r) {
        return r.json().then(function (body) {
          if (!r.ok) throw new Error(body.description || body.message || 'Add to cart failed');
          return body;
        });
      })
      .then(function () {
        return refresh();
      })
      .then(function () {
        openDrawer();
      })
      .catch(function (err) {
        var slot = form.querySelector('[data-cart-error]');
        if (slot) {
          slot.textContent = err.message;
          slot.hidden = false;
        } else {
          alert(err.message);
        }
      })
      .finally(function () {
        setBusy(form, false);
      });
  });

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-open]')) {
      e.preventDefault();
      openDrawer();
      return;
    }

    if (e.target.closest('[data-cart-close]') || e.target.closest('[data-cart-overlay]')) {
      e.preventDefault();
      closeDrawer();
      return;
    }

    // Quantity stepper on a buy form (before the line exists in the cart).
    var stepBtn = e.target.closest('[data-qty-step]');
    if (stepBtn) {
      e.preventDefault();
      var input = stepBtn.parentElement.querySelector('[data-qty-input]');
      if (input) {
        var next = (parseInt(input.value, 10) || 1) + parseInt(stepBtn.dataset.qtyStep, 10);
        input.value = Math.max(1, next);
      }
      return;
    }

    var step = e.target.closest('[data-qty-change]');
    if (step && !busy) {
      e.preventDefault();
      busy = true;
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          id: step.dataset.lineKey,
          quantity: parseInt(step.dataset.qtyChange, 10)
        })
      })
        .then(refresh)
        .finally(function () {
          busy = false;
        });
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });
})();
