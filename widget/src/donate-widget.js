(function () {
  'use strict';

  var DonateWidget = window.DonateWidget || {};

  var FONTS = {
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    inter: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    poppins: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    playfair: "'Playfair Display', Georgia, serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace"
  };

  var STYLES = '\
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap");\
    .dw-overlay {\
      position: fixed;\
      inset: 0;\
      background: rgba(0,0,0,0.6);\
      backdrop-filter: blur(4px);\
      -webkit-backdrop-filter: blur(4px);\
      z-index: 999999;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      padding: 1rem;\
      animation: dw-fadeIn 0.3s ease;\
    }\
    @keyframes dw-fadeIn {\
      from { opacity: 0; }\
      to { opacity: 1; }\
    }\
    @keyframes dw-slideUp {\
      from { transform: translateY(30px) scale(0.95); opacity: 0; }\
      to { transform: translateY(0) scale(1); opacity: 1; }\
    }\
    @keyframes dw-pulse {\
      0%, 100% { transform: scale(1); }\
      50% { transform: scale(1.02); }\
    }\
    @keyframes dw-shimmer {\
      0% { background-position: -200% 0; }\
      100% { background-position: 200% 0; }\
    }\
    @keyframes dw-confetti {\
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }\
      100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }\
    }\
    @keyframes dw-heartbeat {\
      0%, 100% { transform: scale(1); }\
      14% { transform: scale(1.3); }\
      28% { transform: scale(1); }\
      42% { transform: scale(1.3); }\
      70% { transform: scale(1); }\
    }\
    @keyframes dw-checkmark {\
      0% { stroke-dashoffset: 100; }\
      100% { stroke-dashoffset: 0; }\
    }\
    .dw-popup {\
      background: #fff;\
      border-radius: 20px;\
      width: 100%;\
      max-width: 420px;\
      max-height: 90vh;\
      overflow-y: auto;\
      box-shadow: 0 32px 100px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);\
      animation: dw-slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);\
      position: relative;\
    }\
    .dw-popup::-webkit-scrollbar { width: 6px; }\
    .dw-popup::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }\
    .dw-header {\
      padding: 2rem 1.5rem 1.5rem;\
      text-align: center;\
      color: #fff;\
      border-radius: 20px 20px 0 0;\
      position: relative;\
      overflow: hidden;\
    }\
    .dw-header::before {\
      content: "";\
      position: absolute;\
      inset: 0;\
      background: url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'40\' fill=\'rgba(255,255,255,0.05)\'/%3E%3Ccircle cx=\'180\' cy=\'80\' r=\'60\' fill=\'rgba(255,255,255,0.04)\'/%3E%3Ccircle cx=\'60\' cy=\'160\' r=\'30\' fill=\'rgba(255,255,255,0.06)\'/%3E%3C/svg%3E");\
      pointer-events: none;\
    }\
    .dw-header-icon {\
      display: inline-flex;\
      align-items: center;\
      justify-content: center;\
      width: 56px;\
      height: 56px;\
      background: rgba(255,255,255,0.2);\
      border-radius: 16px;\
      margin-bottom: 0.75rem;\
      backdrop-filter: blur(8px);\
    }\
    .dw-header-icon svg {\
      width: 28px;\
      height: 28px;\
      fill: none;\
      stroke: #fff;\
      stroke-width: 2;\
    }\
    .dw-header-img {\
      width: 64px;\
      height: 64px;\
      border-radius: 16px;\
      object-fit: cover;\
      margin-bottom: 0.75rem;\
      border: 3px solid rgba(255,255,255,0.3);\
    }\
    .dw-header h3 {\
      margin: 0 0 0.25rem 0;\
      font-size: 1.35rem;\
      font-weight: 700;\
      letter-spacing: -0.02em;\
      position: relative;\
    }\
    .dw-header p {\
      margin: 0;\
      font-size: 0.875rem;\
      opacity: 0.9;\
      position: relative;\
      line-height: 1.5;\
    }\
    .dw-org-badge {\
      display: inline-flex;\
      align-items: center;\
      gap: 4px;\
      background: rgba(255,255,255,0.15);\
      border-radius: 20px;\
      padding: 3px 10px;\
      font-size: 0.7rem;\
      margin-top: 0.75rem;\
      backdrop-filter: blur(4px);\
      position: relative;\
    }\
    .dw-org-badge svg {\
      width: 12px;\
      height: 12px;\
      stroke: currentColor;\
      fill: none;\
      stroke-width: 2;\
    }\
    .dw-close {\
      position: absolute;\
      top: 0.75rem;\
      right: 0.75rem;\
      background: rgba(255,255,255,0.15);\
      border: none;\
      color: #fff;\
      width: 36px;\
      height: 36px;\
      border-radius: 50%;\
      cursor: pointer;\
      font-size: 18px;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      transition: all 0.2s;\
      backdrop-filter: blur(4px);\
      z-index: 2;\
    }\
    .dw-close:hover { background: rgba(255,255,255,0.25); transform: rotate(90deg); }\
    .dw-body {\
      padding: 1.5rem;\
    }\
    .dw-section-label {\
      font-size: 0.7rem;\
      font-weight: 600;\
      text-transform: uppercase;\
      letter-spacing: 0.08em;\
      color: #94a3b8;\
      margin-bottom: 0.75rem;\
    }\
    .dw-amounts {\
      display: grid;\
      grid-template-columns: repeat(2, 1fr);\
      gap: 0.5rem;\
      margin-bottom: 1.25rem;\
    }\
    .dw-amount-btn {\
      padding: 0.875rem 0.5rem;\
      border: 2px solid #e2e8f0;\
      border-radius: 12px;\
      background: #fff;\
      cursor: pointer;\
      font-size: 1.1rem;\
      font-weight: 700;\
      color: #1e293b;\
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);\
      position: relative;\
      overflow: hidden;\
    }\
    .dw-amount-btn::after {\
      content: "";\
      position: absolute;\
      inset: 0;\
      background: linear-gradient(135deg, var(--dw-primary) 0%, var(--dw-secondary) 100%);\
      opacity: 0;\
      transition: opacity 0.2s;\
    }\
    .dw-amount-btn:hover {\
      border-color: var(--dw-primary);\
      transform: translateY(-1px);\
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);\
    }\
    .dw-amount-btn.selected {\
      border-color: var(--dw-primary);\
      background: linear-gradient(135deg, color-mix(in srgb, var(--dw-primary) 8%, white), color-mix(in srgb, var(--dw-secondary) 8%, white));\
      color: var(--dw-primary);\
      transform: translateY(-1px);\
      box-shadow: 0 4px 16px color-mix(in srgb, var(--dw-primary) 25%, transparent);\
    }\
    .dw-amount-btn .dw-amount-value {\
      position: relative;\
      z-index: 1;\
    }\
    .dw-amount-btn .dw-amount-label {\
      display: block;\
      font-size: 0.65rem;\
      font-weight: 500;\
      color: #94a3b8;\
      margin-top: 2px;\
      position: relative;\
      z-index: 1;\
    }\
    .dw-custom {\
      margin-bottom: 1.25rem;\
    }\
    .dw-custom-wrap {\
      position: relative;\
    }\
    .dw-custom-symbol {\
      position: absolute;\
      left: 14px;\
      top: 50%;\
      transform: translateY(-50%);\
      font-size: 1.1rem;\
      font-weight: 600;\
      color: #94a3b8;\
      pointer-events: none;\
    }\
    .dw-custom input {\
      width: 100%;\
      padding: 0.875rem 0.875rem 0.875rem 2rem;\
      border: 2px solid #e2e8f0;\
      border-radius: 12px;\
      font-size: 1rem;\
      font-weight: 500;\
      box-sizing: border-box;\
      transition: all 0.2s;\
      background: #f8fafc;\
    }\
    .dw-custom input:focus {\
      outline: none;\
      border-color: var(--dw-primary);\
      background: #fff;\
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--dw-primary) 12%, transparent);\
    }\
    .dw-custom input::placeholder {\
      color: #cbd5e1;\
      font-weight: 400;\
    }\
    .dw-divider {\
      display: flex;\
      align-items: center;\
      gap: 0.75rem;\
      margin-bottom: 1.25rem;\
      color: #94a3b8;\
      font-size: 0.75rem;\
    }\
    .dw-divider::before, .dw-divider::after {\
      content: "";\
      flex: 1;\
      height: 1px;\
      background: #e2e8f0;\
    }\
    .dw-wallets {\
      display: flex;\
      gap: 0.5rem;\
      margin-bottom: 1.25rem;\
    }\
    .dw-wallet-btn {\
      flex: 1;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      gap: 8px;\
      padding: 0.75rem;\
      border: 2px solid #e2e8f0;\
      border-radius: 12px;\
      background: #fff;\
      cursor: pointer;\
      font-size: 0.85rem;\
      font-weight: 600;\
      color: #1e293b;\
      transition: all 0.2s;\
    }\
    .dw-wallet-btn:hover {\
      border-color: #cbd5e1;\
      transform: translateY(-1px);\
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);\
    }\
    .dw-wallet-btn svg {\
      width: 20px;\
      height: 20px;\
    }\
    .dw-fields {\
      margin-bottom: 1.25rem;\
    }\
    .dw-field-row {\
      position: relative;\
      margin-bottom: 0.5rem;\
    }\
    .dw-field-icon {\
      position: absolute;\
      left: 12px;\
      top: 50%;\
      transform: translateY(-50%);\
      color: #94a3b8;\
      pointer-events: none;\
    }\
    .dw-field-icon svg {\
      width: 16px;\
      height: 16px;\
      stroke: currentColor;\
      fill: none;\
      stroke-width: 2;\
    }\
    .dw-fields input {\
      width: 100%;\
      padding: 0.75rem 0.75rem 0.75rem 2.25rem;\
      border: 2px solid #e2e8f0;\
      border-radius: 10px;\
      font-size: 0.9rem;\
      box-sizing: border-box;\
      transition: all 0.2s;\
      background: #f8fafc;\
    }\
    .dw-fields input:focus {\
      outline: none;\
      border-color: var(--dw-primary);\
      background: #fff;\
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--dw-primary) 12%, transparent);\
    }\
    .dw-fields input::placeholder { color: #cbd5e1; }\
    .dw-donate-btn {\
      width: 100%;\
      padding: 1rem;\
      border: none;\
      color: #fff;\
      font-size: 1rem;\
      font-weight: 700;\
      cursor: pointer;\
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      gap: 0.5rem;\
      letter-spacing: 0.02em;\
      position: relative;\
      overflow: hidden;\
    }\
    .dw-donate-btn::before {\
      content: "";\
      position: absolute;\
      inset: 0;\
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);\
      transform: translateX(-100%);\
    }\
    .dw-donate-btn:hover::before {\
      animation: dw-shimmer 1.5s ease;\
    }\
    .dw-donate-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px color-mix(in srgb, var(--dw-primary) 35%, transparent); }\
    .dw-donate-btn:active { transform: translateY(0); }\
    .dw-donate-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }\
    .dw-donate-btn:disabled:hover::before { animation: none; }\
    .dw-donate-btn svg {\
      width: 18px;\
      height: 18px;\
      stroke: currentColor;\
      fill: none;\
      stroke-width: 2;\
    }\
    .dw-secure {\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      gap: 6px;\
      margin-top: 0.75rem;\
      font-size: 0.7rem;\
      color: #94a3b8;\
    }\
    .dw-secure svg {\
      width: 12px;\
      height: 12px;\
      stroke: currentColor;\
      fill: none;\
      stroke-width: 2;\
    }\
    .dw-payment-icons {\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      gap: 0.5rem;\
      margin-top: 0.5rem;\
      opacity: 0.5;\
    }\
    .dw-payment-icons img {\
      height: 18px;\
    }\
    .dw-branding {\
      text-align: center;\
      margin-top: 0.75rem;\
      font-size: 0.65rem;\
      color: #b0b8c4;\
    }\
    .dw-branding a { color: #b0b8c4; text-decoration: none; }\
    .dw-branding a:hover { color: #64748b; }\
    .dw-error {\
      background: linear-gradient(135deg, #fef2f2, #fff1f2);\
      color: #dc2626;\
      padding: 0.625rem 0.875rem;\
      border-radius: 10px;\
      font-size: 0.85rem;\
      margin-bottom: 1rem;\
      display: flex;\
      align-items: center;\
      gap: 0.5rem;\
      border: 1px solid #fecaca;\
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
      font-weight: 700;\
      display: inline-flex;\
      align-items: center;\
      gap: 0.5rem;\
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);\
      position: relative;\
      overflow: hidden;\
      letter-spacing: 0.02em;\
    }\
    .dw-trigger-btn::before {\
      content: "";\
      position: absolute;\
      inset: 0;\
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);\
      transform: translateX(-100%);\
    }\
    .dw-trigger-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px color-mix(in srgb, var(--dw-primary) 30%, transparent); }\
    .dw-trigger-btn:hover::before { animation: dw-shimmer 1.5s ease; }\
    .dw-trigger-btn:active { transform: translateY(0); }\
    .dw-trigger-btn svg {\
      flex-shrink: 0;\
    }\
    .dw-success-overlay {\
      position: absolute;\
      inset: 0;\
      background: #fff;\
      display: flex;\
      flex-direction: column;\
      align-items: center;\
      justify-content: center;\
      border-radius: 20px;\
      z-index: 10;\
      animation: dw-fadeIn 0.3s ease;\
      padding: 2rem;\
      text-align: center;\
    }\
    .dw-success-icon {\
      width: 72px;\
      height: 72px;\
      margin-bottom: 1rem;\
    }\
    .dw-success-icon circle {\
      stroke: #16a34a;\
      stroke-width: 2;\
      fill: none;\
    }\
    .dw-success-icon path {\
      stroke: #16a34a;\
      stroke-width: 3;\
      fill: none;\
      stroke-linecap: round;\
      stroke-linejoin: round;\
      stroke-dasharray: 100;\
      animation: dw-checkmark 0.6s ease forwards;\
    }\
    .dw-success-title {\
      font-size: 1.25rem;\
      font-weight: 700;\
      color: #1e293b;\
      margin-bottom: 0.5rem;\
    }\
    .dw-success-msg {\
      color: #64748b;\
      font-size: 0.9rem;\
      line-height: 1.5;\
    }\
    @media (max-width: 480px) {\
      .dw-popup { max-width: 100%; border-radius: 20px 20px 0 0; align-self: flex-end; }\
      .dw-header { border-radius: 20px 20px 0 0; }\
      .dw-overlay { align-items: flex-end; padding: 0; }\
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

  var AMOUNT_LABELS = {
    10: 'Coffee',
    25: 'Lunch',
    50: 'Gift',
    100: 'Champion',
    250: 'Hero',
    500: 'Patron',
    1000: 'Legend'
  };

  // SVG icons
  var ICONS = {
    heart: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    user: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    mail: '<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    gpay: '<svg viewBox="0 0 24 24" fill="none"><path d="M12.24 10.285V14.4h2.87c-.12.82-.56 1.5-1.16 1.96l1.88 1.46c1.1-1.02 1.73-2.51 1.73-4.29 0-.41-.04-.81-.11-1.19H12.24z" fill="#4285F4"/><path d="M5.98 13.388l-.42.32-1.49 1.16C5.37 17.32 7.92 19 10.95 19c1.84 0 3.38-.61 4.5-1.65l-1.88-1.46c-.58.39-1.32.62-2.13.62-1.64 0-3.03-1.11-3.53-2.6l-.43.05z" fill="#34A853"/><path d="M4.07 7.915C3.55 8.94 3.25 10.1 3.25 11.32c0 1.22.3 2.38.82 3.41.37-.32.99-.87 1.49-1.16.07-.05.28-.22.42-.32-.28-.56-.43-1.2-.43-1.93 0-.73.16-1.37.43-1.93l-.42-.32-1.49-1.1z" fill="#FBBC05"/><path d="M10.95 7.02c.96 0 1.82.33 2.5.97l1.84-1.84C14.08 5.02 12.66 4.32 10.95 4.32c-3.03 0-5.58 1.68-6.88 4.12l1.91 1.48c.5-1.49 1.89-2.9 3.53-2.9h.44z" fill="#EA4335"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>'
  };

  function createOverlay(config, onClose) {
    var overlay = document.createElement('div');
    overlay.className = 'dw-overlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) onClose();
    });
    return overlay;
  }

  function getHeaderBg(config) {
    var style = config.header_style || 'gradient';
    var c1 = config.primary_color || '#6366f1';
    var c2 = config.secondary_color || '#8b5cf6';
    if (style === 'solid') return c1;
    if (style === 'gradient') return 'linear-gradient(135deg, ' + c1 + ' 0%, ' + c2 + ' 100%)';
    if (style === 'radial') return 'radial-gradient(circle at 30% 30%, ' + c2 + ' 0%, ' + c1 + ' 100%)';
    return 'linear-gradient(135deg, ' + c1 + ' 0%, ' + c2 + ' 100%)';
  }

  function getFontFamily(config) {
    return FONTS[(config.font_family || 'system')] || FONTS.system;
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
    popup.style.fontFamily = getFontFamily(config);

    var presets = [];
    try {
      presets = typeof config.preset_amounts === 'string' ? JSON.parse(config.preset_amounts) : (config.preset_amounts || [10, 25, 50, 100]);
    } catch (e) {
      presets = [10, 25, 50, 100];
    }

    var btnStyle = config.button_style || 'rounded';
    var btnRadius = btnStyle === 'pill' ? '9999px' : btnStyle === 'square' ? '4px' : '12px';
    var sym = getCurrencySymbol(config.currency);

    // Header with icon or image
    var headerIconHTML = '';
    if (config.header_image_url) {
      headerIconHTML = '<img class="dw-header-img" src="' + escapeHTML(config.header_image_url) + '" alt="" />';
    } else {
      headerIconHTML = '<div class="dw-header-icon">' + ICONS.heart + '</div>';
    }

    var orgBadge = config.org_name ? '<div class="dw-org-badge">' + ICONS.shield + ' ' + escapeHTML(config.org_name) + '</div>' : '';

    var headerHTML = '<div class="dw-header" style="background:' + getHeaderBg(config) + '">'
      + '<button class="dw-close" aria-label="Close">&times;</button>'
      + headerIconHTML
      + '<h3>' + escapeHTML(config.title || 'Support Our Cause') + '</h3>'
      + '<p>' + escapeHTML(config.description || 'Your contribution makes a difference.') + '</p>'
      + orgBadge
      + '</div>';

    // Amount buttons with labels
    var amountsHTML = '<div class="dw-section-label">Select Amount</div><div class="dw-amounts">';
    for (var i = 0; i < presets.length; i++) {
      var label = AMOUNT_LABELS[presets[i]] || '';
      amountsHTML += '<button class="dw-amount-btn" data-amount="' + presets[i] + '">'
        + '<span class="dw-amount-value">' + sym + presets[i] + '</span>'
        + (label ? '<span class="dw-amount-label">' + label + '</span>' : '')
        + '</button>';
    }
    amountsHTML += '</div>';

    // Custom amount with currency symbol
    var customHTML = '';
    if (config.allow_custom_amount !== 0 && config.allow_custom_amount !== false) {
      customHTML = '<div class="dw-custom"><div class="dw-custom-wrap"><span class="dw-custom-symbol">' + sym + '</span><input type="number" placeholder="Enter custom amount" min="' + (config.min_amount || 1) + '" max="' + (config.max_amount || 10000) + '" /></div></div>';
    }

    // Wallet buttons (Google Pay / Apple Pay)
    var walletsHTML = '';
    var hasWallets = config.enable_google_pay || config.enable_apple_pay;
    if (hasWallets) {
      walletsHTML = '<div class="dw-wallets">';
      if (config.enable_google_pay) {
        walletsHTML += '<button class="dw-wallet-btn" data-wallet="google">' + ICONS.gpay + ' Google Pay</button>';
      }
      if (config.enable_apple_pay) {
        walletsHTML += '<button class="dw-wallet-btn" data-wallet="apple">' + ICONS.apple + ' Apple Pay</button>';
      }
      walletsHTML += '</div>';
      walletsHTML += '<div class="dw-divider">or pay with card</div>';
    }

    // Donor fields with icons
    var fieldsHTML = '<div class="dw-fields">'
      + '<div class="dw-field-row"><span class="dw-field-icon">' + ICONS.user + '</span><input type="text" placeholder="Your name (optional)" data-field="name" /></div>'
      + '<div class="dw-field-row"><span class="dw-field-icon">' + ICONS.mail + '</span><input type="email" placeholder="Your email (optional)" data-field="email" /></div>'
      + '</div>';

    // Donate button with icon
    var donateBtnHTML = '<button class="dw-donate-btn" style="background:linear-gradient(135deg, ' + (config.primary_color || '#6366f1') + ', ' + (config.secondary_color || '#8b5cf6') + ');border-radius:' + btnRadius + '" disabled>'
      + ICONS.heart + ' <span>' + escapeHTML(config.button_text || 'Donate') + '</span></button>';

    // Security badge
    var secureHTML = '<div class="dw-secure">' + ICONS.lock + ' Secured by Stripe</div>';

    // Branding
    var brandingHTML = '';
    if (config.show_branding !== 0 && config.show_branding !== false) {
      brandingHTML = '<div class="dw-branding">Powered by <a href="#">DonateWidget</a></div>';
    }

    popup.innerHTML = headerHTML
      + '<div class="dw-body">'
      + '<div class="dw-error" style="display:none"></div>'
      + amountsHTML
      + customHTML
      + walletsHTML
      + fieldsHTML
      + donateBtnHTML
      + secureHTML
      + brandingHTML
      + '</div>';

    popup.style.setProperty('--dw-primary', config.primary_color || '#6366f1');
    popup.style.setProperty('--dw-secondary', config.secondary_color || '#8b5cf6');

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

    // Wallet button handlers
    var walletBtns = popup.querySelectorAll('.dw-wallet-btn');
    for (var w = 0; w < walletBtns.length; w++) {
      walletBtns[w].addEventListener('click', function () {
        var amount = state.selectedAmount || Number(state.customAmount);
        if (!amount || amount <= 0) {
          errorEl.textContent = 'Please select or enter a donation amount first.';
          errorEl.style.display = 'flex';
          return;
        }
        // For wallet payments, use the same checkout flow
        // Stripe Checkout automatically shows Google Pay / Apple Pay when available
        handleDonate(config, state, donateBtn, errorEl, close, popup);
      });
    }

    donateBtn.addEventListener('click', function () {
      handleDonate(config, state, donateBtn, errorEl, close, popup);
    });

    return { overlay: overlay, close: close };
  }

  function handleDonate(config, state, donateBtn, errorEl, close, popup) {
    if (state.loading) return;
    var amount = state.selectedAmount || Number(state.customAmount);
    if (!amount || amount <= 0) return;

    state.loading = true;
    state.error = '';
    errorEl.style.display = 'none';
    donateBtn.disabled = true;
    var origHTML = donateBtn.innerHTML;
    donateBtn.innerHTML = '<svg style="width:18px;height:18px;animation:spin 1s linear infinite" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31 31" stroke-linecap="round"/></svg> Processing...';

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
          errorEl.style.display = 'flex';
          state.loading = false;
          donateBtn.disabled = false;
          donateBtn.innerHTML = origHTML;
          return;
        }
        if (data.url) {
          var checkoutWindow = window.open(data.url, '_blank', 'width=600,height=700');
          // Listen for success message
          window.addEventListener('message', function onMsg(e) {
            if (e.data && e.data.type === 'donation-success') {
              window.removeEventListener('message', onMsg);
              showSuccess(popup, config);
            }
            if (e.data && e.data.type === 'donation-cancelled') {
              window.removeEventListener('message', onMsg);
              state.loading = false;
              donateBtn.disabled = false;
              donateBtn.innerHTML = origHTML;
            }
          });
        }
        state.loading = false;
        donateBtn.disabled = false;
        donateBtn.innerHTML = origHTML;
      })
      .catch(function (err) {
        state.error = 'Something went wrong. Please try again.';
        errorEl.textContent = state.error;
        errorEl.style.display = 'flex';
        state.loading = false;
        donateBtn.disabled = false;
        donateBtn.innerHTML = origHTML;
      });
  }

  function showSuccess(popup, config) {
    var successHTML = '<div class="dw-success-overlay">'
      + '<svg class="dw-success-icon" viewBox="0 0 72 72"><circle cx="36" cy="36" r="34"/><path d="M22 36l10 10 18-20"/></svg>'
      + '<div class="dw-success-title">' + escapeHTML(config.success_message || 'Thank you!') + '</div>'
      + '<div class="dw-success-msg">Your generosity makes a difference.</div>'
      + '</div>';
    popup.insertAdjacentHTML('beforeend', successHTML);
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
        var btnRadius = btnStyle === 'pill' ? '9999px' : btnStyle === 'square' ? '4px' : '12px';
        var sizes = { small: '10px 20px', medium: '14px 28px', large: '18px 36px' };
        var padding = sizes[config.button_size || 'medium'];
        var fontSizes = { small: '14px', medium: '16px', large: '18px' };

        var btn = document.createElement('button');
        btn.className = 'dw-trigger-btn';
        btn.style.background = 'linear-gradient(135deg, ' + (config.primary_color || '#6366f1') + ', ' + (config.secondary_color || '#8b5cf6') + ')';
        btn.style.borderRadius = btnRadius;
        btn.style.padding = padding;
        btn.style.fontSize = fontSizes[config.button_size || 'medium'];
        btn.style.fontFamily = getFontFamily(config);
        btn.style.setProperty('--dw-primary', config.primary_color || '#6366f1');
        btn.innerHTML = ICONS.heart + ' ' + escapeHTML(config.button_text || 'Donate');

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
