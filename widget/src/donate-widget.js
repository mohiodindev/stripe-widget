(function () {
  'use strict';

  var DonateWidget = window.DonateWidget || {};

  var STYLES = '\
    .dw-overlay {\
      position: fixed;\
      inset: 0;\
      background: rgba(0,0,0,0.5);\
      z-index: 999999;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      padding: 1rem;\
      animation: dw-fadeIn 0.3s ease;\
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\
    }\
    @keyframes dw-fadeIn {\
      from { opacity: 0; }\
      to { opacity: 1; }\
    }\
    @keyframes dw-slideUp {\
      from { transform: translateY(20px); opacity: 0; }\
      to { transform: translateY(0); opacity: 1; }\
    }\
    .dw-popup {\
      background: #fff;\
      border-radius: 16px;\
      width: 100%;\
      max-width: 400px;\
      max-height: 90vh;\
      overflow-y: auto;\
      box-shadow: 0 24px 80px rgba(0,0,0,0.25);\
      animation: dw-slideUp 0.3s ease;\
    }\
    .dw-header {\
      padding: 1.5rem;\
      text-align: center;\
      color: #fff;\
      border-radius: 16px 16px 0 0;\
    }\
    .dw-header h3 {\
      margin: 0 0 0.25rem 0;\
      font-size: 1.25rem;\
      font-weight: 700;\
    }\
    .dw-header p {\
      margin: 0;\
      font-size: 0.875rem;\
      opacity: 0.9;\
    }\
    .dw-close {\
      position: absolute;\
      top: 0.75rem;\
      right: 0.75rem;\
      background: rgba(255,255,255,0.2);\
      border: none;\
      color: #fff;\
      width: 32px;\
      height: 32px;\
      border-radius: 50%;\
      cursor: pointer;\
      font-size: 18px;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      transition: background 0.2s;\
    }\
    .dw-close:hover { background: rgba(255,255,255,0.3); }\
    .dw-body {\
      padding: 1.5rem;\
    }\
    .dw-amounts {\
      display: grid;\
      grid-template-columns: repeat(2, 1fr);\
      gap: 0.5rem;\
      margin-bottom: 1rem;\
    }\
    .dw-amount-btn {\
      padding: 0.75rem;\
      border: 2px solid #e2e8f0;\
      border-radius: 10px;\
      background: #fff;\
      cursor: pointer;\
      font-size: 1rem;\
      font-weight: 600;\
      color: #1e293b;\
      transition: all 0.2s;\
    }\
    .dw-amount-btn:hover {\
      border-color: #cbd5e1;\
    }\
    .dw-amount-btn.selected {\
      border-color: var(--dw-primary);\
      background: color-mix(in srgb, var(--dw-primary) 8%, white);\
      color: var(--dw-primary);\
    }\
    .dw-custom {\
      margin-bottom: 1rem;\
    }\
    .dw-custom input {\
      width: 100%;\
      padding: 0.75rem;\
      border: 2px solid #e2e8f0;\
      border-radius: 10px;\
      font-size: 1rem;\
      box-sizing: border-box;\
      transition: border-color 0.2s;\
    }\
    .dw-custom input:focus {\
      outline: none;\
      border-color: var(--dw-primary);\
    }\
    .dw-fields {\
      margin-bottom: 1rem;\
    }\
    .dw-fields input {\
      width: 100%;\
      padding: 0.625rem 0.75rem;\
      border: 1px solid #e2e8f0;\
      border-radius: 8px;\
      font-size: 0.9rem;\
      margin-bottom: 0.5rem;\
      box-sizing: border-box;\
    }\
    .dw-fields input:focus {\
      outline: none;\
      border-color: var(--dw-primary);\
    }\
    .dw-donate-btn {\
      width: 100%;\
      padding: 0.875rem;\
      border: none;\
      color: #fff;\
      font-size: 1rem;\
      font-weight: 600;\
      cursor: pointer;\
      transition: opacity 0.2s;\
    }\
    .dw-donate-btn:hover { opacity: 0.9; }\
    .dw-donate-btn:disabled { opacity: 0.6; cursor: not-allowed; }\
    .dw-branding {\
      text-align: center;\
      margin-top: 1rem;\
      font-size: 0.7rem;\
      color: #94a3b8;\
    }\
    .dw-branding a { color: #94a3b8; text-decoration: none; }\
    .dw-branding a:hover { color: #64748b; }\
    .dw-error {\
      background: #fef2f2;\
      color: #dc2626;\
      padding: 0.5rem 0.75rem;\
      border-radius: 8px;\
      font-size: 0.85rem;\
      margin-bottom: 1rem;\
    }\
    .dw-loading {\
      text-align: center;\
      padding: 2rem;\
      color: #64748b;\
    }\
    .dw-trigger-btn {\
      border: none;\
      color: #fff;\
      cursor: pointer;\
      font-weight: 600;\
      display: inline-flex;\
      align-items: center;\
      gap: 0.5rem;\
      transition: opacity 0.2s;\
    }\
    .dw-trigger-btn:hover { opacity: 0.9; }\
    .dw-trigger-btn svg {\
      flex-shrink: 0;\
    }\
  ';

  var styleInjected = false;
  function injectStyles() {
    if (styleInjected) return;
    var style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
    styleInjected = true;
  }

  var currencySymbols = {
    usd: '$', eur: '\u20AC', gbp: '\u00A3', cad: 'CA$', aud: 'A$'
  };

  function getCurrencySymbol(c) {
    return currencySymbols[(c || 'usd').toLowerCase()] || '$';
  }

  function createOverlay(config, onClose) {
    var overlay = document.createElement('div');
    overlay.className = 'dw-overlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) onClose();
    });
    return overlay;
  }

  function buildPopup(config) {
    injectStyles();

    var state = {
      selectedAmount: null,
      customAmount: '',
      donorName: '',
      donorEmail: '',
      loading: false,
      error: ''
    };

    var overlay, popup, amountBtns, customInput, donateBtn, errorEl;

    function close() {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }

    overlay = createOverlay(config, close);

    popup = document.createElement('div');
    popup.className = 'dw-popup';

    var presets = [];
    try {
      presets = typeof config.preset_amounts === 'string' ? JSON.parse(config.preset_amounts) : (config.preset_amounts || [10, 25, 50, 100]);
    } catch (e) {
      presets = [10, 25, 50, 100];
    }

    var btnStyle = config.button_style || 'rounded';
    var btnRadius = btnStyle === 'pill' ? '9999px' : btnStyle === 'square' ? '0' : '10px';
    var sym = getCurrencySymbol(config.currency);

    var headerHTML = '<div class="dw-header" style="background:' + (config.primary_color || '#6366f1') + ';position:relative">'
      + '<button class="dw-close" aria-label="Close">&times;</button>'
      + '<h3>' + escapeHTML(config.title || 'Support Our Cause') + '</h3>'
      + '<p>' + escapeHTML(config.description || 'Your contribution makes a difference.') + '</p>'
      + '</div>';

    var amountsHTML = '<div class="dw-amounts">';
    for (var i = 0; i < presets.length; i++) {
      amountsHTML += '<button class="dw-amount-btn" data-amount="' + presets[i] + '">' + sym + presets[i] + '</button>';
    }
    amountsHTML += '</div>';

    var customHTML = '';
    if (config.allow_custom_amount !== 0 && config.allow_custom_amount !== false) {
      customHTML = '<div class="dw-custom"><input type="number" placeholder="Custom amount (' + sym + ')" min="' + (config.min_amount || 1) + '" max="' + (config.max_amount || 10000) + '" /></div>';
    }

    var fieldsHTML = '<div class="dw-fields">'
      + '<input type="text" placeholder="Your name (optional)" data-field="name" />'
      + '<input type="email" placeholder="Your email (optional)" data-field="email" />'
      + '</div>';

    var donateBtnHTML = '<button class="dw-donate-btn" style="background:' + (config.primary_color || '#6366f1') + ';border-radius:' + btnRadius + '" disabled>'
      + (config.button_text || 'Donate') + '</button>';

    var brandingHTML = '';
    if (config.show_branding !== 0 && config.show_branding !== false) {
      brandingHTML = '<div class="dw-branding">Powered by <a href="#">DonateWidget</a></div>';
    }

    popup.innerHTML = headerHTML
      + '<div class="dw-body">'
      + '<div class="dw-error" style="display:none"></div>'
      + amountsHTML
      + customHTML
      + fieldsHTML
      + donateBtnHTML
      + brandingHTML
      + '</div>';

    popup.style.setProperty('--dw-primary', config.primary_color || '#6366f1');

    overlay.appendChild(popup);

    // Wire up events
    var closeBtn = popup.querySelector('.dw-close');
    closeBtn.addEventListener('click', close);

    amountBtns = popup.querySelectorAll('.dw-amount-btn');
    customInput = popup.querySelector('.dw-custom input');
    donateBtn = popup.querySelector('.dw-donate-btn');
    errorEl = popup.querySelector('.dw-error');

    function updateSelection() {
      for (var j = 0; j < amountBtns.length; j++) {
        var isSelected = Number(amountBtns[j].getAttribute('data-amount')) === state.selectedAmount;
        amountBtns[j].className = 'dw-amount-btn' + (isSelected ? ' selected' : '');
      }
      var hasAmount = state.selectedAmount || (state.customAmount && Number(state.customAmount) > 0);
      donateBtn.disabled = !hasAmount;
    }

    for (var k = 0; k < amountBtns.length; k++) {
      amountBtns[k].addEventListener('click', function () {
        state.selectedAmount = Number(this.getAttribute('data-amount'));
        state.customAmount = '';
        if (customInput) customInput.value = '';
        updateSelection();
      });
    }

    if (customInput) {
      customInput.addEventListener('input', function () {
        state.customAmount = this.value;
        state.selectedAmount = null;
        updateSelection();
      });
    }

    var nameInput = popup.querySelector('[data-field="name"]');
    var emailInput = popup.querySelector('[data-field="email"]');
    nameInput.addEventListener('input', function () { state.donorName = this.value; });
    emailInput.addEventListener('input', function () { state.donorEmail = this.value; });

    donateBtn.addEventListener('click', function () {
      if (state.loading) return;
      var amount = state.selectedAmount || Number(state.customAmount);
      if (!amount || amount <= 0) return;

      state.loading = true;
      state.error = '';
      errorEl.style.display = 'none';
      donateBtn.disabled = true;
      donateBtn.textContent = 'Processing...';

      var apiUrl = config.apiUrl || 'http://localhost:3001';
      fetch(apiUrl + '/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: config.widgetId,
          amount: amount,
          currency: config.currency || 'usd',
          donorName: state.donorName,
          donorEmail: state.donorEmail
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.error) {
            state.error = data.error;
            errorEl.textContent = data.error;
            errorEl.style.display = 'block';
            state.loading = false;
            donateBtn.disabled = false;
            donateBtn.textContent = config.button_text || 'Donate';
            return;
          }
          if (data.url) {
            window.open(data.url, '_blank', 'width=600,height=700');
          }
          state.loading = false;
          donateBtn.disabled = false;
          donateBtn.textContent = config.button_text || 'Donate';
        })
        .catch(function (err) {
          state.error = 'Something went wrong. Please try again.';
          errorEl.textContent = state.error;
          errorEl.style.display = 'block';
          state.loading = false;
          donateBtn.disabled = false;
          donateBtn.textContent = config.button_text || 'Donate';
        });
    });

    return { overlay: overlay, close: close };
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Public API: init - renders button in a container
  DonateWidget.init = function (options) {
    injectStyles();

    var container = document.querySelector(options.container);
    if (!container) {
      console.error('DonateWidget: container not found:', options.container);
      return;
    }

    // Fetch widget config
    var apiUrl = options.apiUrl || 'http://localhost:3001';
    fetch(apiUrl + '/api/widgets/' + options.widgetId + '/public')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.widget) {
          container.innerHTML = '<div class="dw-error">Widget not found</div>';
          return;
        }

        var config = data.widget;
        config.apiUrl = apiUrl;
        config.widgetId = options.widgetId;

        var btnStyle = config.button_style || 'rounded';
        var btnRadius = btnStyle === 'pill' ? '9999px' : btnStyle === 'square' ? '0' : '10px';
        var sizes = { small: '8px 16px', medium: '12px 24px', large: '16px 32px' };
        var padding = sizes[config.button_size || 'medium'];

        var btn = document.createElement('button');
        btn.className = 'dw-trigger-btn';
        btn.style.background = config.primary_color || '#6366f1';
        btn.style.borderRadius = btnRadius;
        btn.style.padding = padding;
        btn.style.fontSize = config.button_size === 'large' ? '18px' : config.button_size === 'small' ? '14px' : '16px';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> '
          + escapeHTML(config.button_text || 'Donate');

        btn.addEventListener('click', function () {
          var popup = buildPopup(config);
          document.body.appendChild(popup.overlay);
        });

        container.appendChild(btn);
      })
      .catch(function (err) {
        console.error('DonateWidget: Failed to load config', err);
        container.innerHTML = '<div class="dw-error">Failed to load widget</div>';
      });
  };

  // Public API: open - programmatically open the popup
  DonateWidget.open = function (options) {
    injectStyles();

    var apiUrl = options.apiUrl || 'http://localhost:3001';
    fetch(apiUrl + '/api/widgets/' + options.widgetId + '/public')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.widget) {
          console.error('DonateWidget: Widget not found');
          return;
        }

        var config = data.widget;
        config.apiUrl = apiUrl;
        config.widgetId = options.widgetId;

        var popup = buildPopup(config);
        document.body.appendChild(popup.overlay);
      })
      .catch(function (err) {
        console.error('DonateWidget: Failed to load config', err);
      });
  };

  window.DonateWidget = DonateWidget;
})();
