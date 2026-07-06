/**
 * Shared page behaviour for the three static DPP access-level pages.
 * No data model, no role switching — each page is a standalone artifact.
 * Handles: access gate for restricted tiers, mobile nav toggle,
 * expand/collapse-all for the dropdown attribute browser, and rendering
 * the page's QR code.
 */
(function () {
  'use strict';

  /* ---- Access gate (pilot-grade: client-side only, real deployments
     gate at the registry/API layer). Pages opt in via
     <body data-gate="legit|authority" data-gate-title="..."> ---- */
  var GATE_PASSWORD = '1234';
  var gateTier = document.body.getAttribute('data-gate');
  if (gateTier && sessionStorage.getItem('dpp-gate-' + gateTier) !== 'unlocked') {
    var gateTitle = document.body.getAttribute('data-gate-title') || 'Restricted access';
    var overlay = document.createElement('div');
    overlay.className = 'gate-overlay';
    overlay.innerHTML =
      '<div class="gate-card" role="dialog" aria-modal="true" aria-labelledby="gateTitle">' +
      '  <span class="tier-badge tier-badge--' + gateTier + '"><span class="dot"></span>' + gateTitle + '</span>' +
      '  <h1 id="gateTitle">This record is restricted.</h1>' +
      '  <p>Access to this view of the Digital Product Passport is limited to verified users. Enter the access code issued by Lumen Apparel.</p>' +
      '  <form class="gate-form" novalidate>' +
      '    <label for="gateInput" class="sr-only">Access code</label>' +
      '    <input id="gateInput" type="password" inputmode="numeric" autocomplete="one-time-code" placeholder="Access code" required>' +
      '    <button type="submit" class="btn btn-primary">Unlock</button>' +
      '  </form>' +
      '  <p class="gate-error" hidden>That code is not valid. Please try again.</p>' +
      '  <a class="gate-back" href="public-access.html">&larr; View the public record instead</a>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.classList.add('is-gated');

    var form = overlay.querySelector('.gate-form');
    var input = overlay.querySelector('#gateInput');
    var error = overlay.querySelector('.gate-error');
    input.focus();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value === GATE_PASSWORD) {
        sessionStorage.setItem('dpp-gate-' + gateTier, 'unlocked');
        document.body.classList.remove('is-gated');
        overlay.remove();
      } else {
        error.hidden = false;
        input.value = '';
        input.focus();
      }
    });
  }

  var menuBtn = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuBtn && mobilePanel) {
    menuBtn.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  var toggleAllBtn = document.getElementById('toggleAll');
  if (toggleAllBtn) {
    var expanded = false;
    toggleAllBtn.addEventListener('click', function () {
      expanded = !expanded;
      document.querySelectorAll('.dpp-cat').forEach(function (el) {
        el.open = expanded;
      });
      toggleAllBtn.textContent = expanded ? 'Collapse all' : 'Expand all';
    });
  }

  /* QR codes always encode the real, live URL of their target page —
     data-qr-page names a sibling page (hub use), no attribute = this page.
     This keeps every printed/scanned code valid wherever the site is hosted. */
  if (typeof QRCode !== 'undefined') {
    document.querySelectorAll('[data-qr], #qrCode').forEach(function (el) {
      var page = el.getAttribute('data-qr-page');
      var url = new URL(page || window.location.pathname, window.location.href);
      new QRCode(el, {
        text: url.toString(),
        width: parseInt(el.getAttribute('data-qr-size') || '96', 10),
        height: parseInt(el.getAttribute('data-qr-size') || '96', 10),
        colorDark: '#0E2A47',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M,
      });
    });
  }
})();
