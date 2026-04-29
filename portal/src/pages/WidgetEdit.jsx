import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, Palette, Type, Layout, CreditCard, Heart, Smartphone } from 'lucide-react';
import api from '../lib/api';

const CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud'];
const BUTTON_STYLES = ['rounded', 'pill', 'square'];
const BUTTON_SIZES = ['small', 'medium', 'large'];
const HEADER_STYLES = ['gradient', 'solid', 'radial'];
const FONT_FAMILIES = ['system', 'inter', 'poppins', 'playfair', 'mono'];
const THANK_YOU_STYLES = ['confetti', 'checkmark', 'heart'];

export default function WidgetEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [widget, setWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    api.get(`/widgets/${id}`)
      .then(res => {
        const w = res.data.widget;
        w.preset_amounts = typeof w.preset_amounts === 'string' ? JSON.parse(w.preset_amounts) : w.preset_amounts;
        setWidget(w);
      })
      .catch(() => navigate('/widgets'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/widgets/${id}`, {
        ...widget,
        preset_amounts: JSON.stringify(widget.preset_amounts)
      });
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setWidget(prev => ({ ...prev, [field]: value }));
  };

  if (loading || !widget) return <div className="page-loading">Loading...</div>;

  const tabs = [
    { id: 'general', label: 'General', icon: <Type size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'amounts', label: 'Amounts', icon: <CreditCard size={16} /> },
    { id: 'payments', label: 'Payments', icon: <Smartphone size={16} /> },
    { id: 'advanced', label: 'Advanced', icon: <Layout size={16} /> },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="header-left">
          <button className="btn btn-ghost" onClick={() => navigate('/widgets')}>
            <ArrowLeft size={18} />
          </button>
          <h1>{widget.name}</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye size={18} />
            <span>Preview</span>
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      <div className="edit-layout">
        <div className="edit-form card">
          {/* Tabs */}
          <div className="edit-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`edit-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="tab-content">
              <div className="form-group">
                <label>Widget Name</label>
                <input value={widget.name} onChange={e => updateField('name', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Popup Title</label>
                <input value={widget.title} onChange={e => updateField('title', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={widget.description} onChange={e => updateField('description', e.target.value)} rows={3} />
              </div>

              <div className="form-group">
                <label>Success Message</label>
                <input value={widget.success_message} onChange={e => updateField('success_message', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Header Image URL (optional)</label>
                <input
                  type="url"
                  value={widget.header_image_url || ''}
                  onChange={e => updateField('header_image_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <span className="form-hint">Shows your logo/icon instead of the default heart icon</span>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="tab-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Primary Color</label>
                  <div className="color-input">
                    <input type="color" value={widget.primary_color} onChange={e => updateField('primary_color', e.target.value)} />
                    <input type="text" value={widget.primary_color} onChange={e => updateField('primary_color', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Secondary Color</label>
                  <div className="color-input">
                    <input type="color" value={widget.secondary_color || '#8b5cf6'} onChange={e => updateField('secondary_color', e.target.value)} />
                    <input type="text" value={widget.secondary_color || '#8b5cf6'} onChange={e => updateField('secondary_color', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Header Style</label>
                  <div className="style-options">
                    {HEADER_STYLES.map(s => (
                      <button
                        key={s}
                        className={`style-option ${widget.header_style === s ? 'active' : ''}`}
                        onClick={() => updateField('header_style', s)}
                        style={{
                          background: s === 'gradient'
                            ? `linear-gradient(135deg, ${widget.primary_color}, ${widget.secondary_color || '#8b5cf6'})`
                            : s === 'radial'
                            ? `radial-gradient(circle at 30% 30%, ${widget.secondary_color || '#8b5cf6'}, ${widget.primary_color})`
                            : widget.primary_color,
                          color: '#fff',
                          fontSize: '0.7rem'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Font Family</label>
                  <select value={widget.font_family || 'system'} onChange={e => updateField('font_family', e.target.value)}>
                    {FONT_FAMILIES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Button Text</label>
                  <input value={widget.button_text} onChange={e => updateField('button_text', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Button Style</label>
                  <select value={widget.button_style} onChange={e => updateField('button_style', e.target.value)}>
                    {BUTTON_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Button Size</label>
                <select value={widget.button_size} onChange={e => updateField('button_size', e.target.value)}>
                  {BUTTON_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Thank You Animation</label>
                <select value={widget.thank_you_style || 'confetti'} onChange={e => updateField('thank_you_style', e.target.value)}>
                  {THANK_YOU_STYLES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Amounts Tab */}
          {activeTab === 'amounts' && (
            <div className="tab-content">
              <div className="form-group">
                <label>Currency</label>
                <select value={widget.currency} onChange={e => updateField('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Preset Amounts</label>
                <div className="preset-amounts">
                  {widget.preset_amounts.map((amt, i) => (
                    <div key={i} className="preset-amount-item">
                      <input
                        type="number"
                        value={amt}
                        onChange={e => {
                          const newAmounts = [...widget.preset_amounts];
                          newAmounts[i] = Number(e.target.value);
                          updateField('preset_amounts', newAmounts);
                        }}
                      />
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => {
                          const newAmounts = widget.preset_amounts.filter((_, idx) => idx !== i);
                          updateField('preset_amounts', newAmounts);
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => updateField('preset_amounts', [...widget.preset_amounts, 50])}
                  >
                    + Add Amount
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Amount</label>
                  <input type="number" value={widget.min_amount} onChange={e => updateField('min_amount', Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Max Amount</label>
                  <input type="number" value={widget.max_amount} onChange={e => updateField('max_amount', Number(e.target.value))} />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={!!widget.allow_custom_amount} onChange={e => updateField('allow_custom_amount', e.target.checked)} />
                  Allow custom amounts
                </label>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="tab-content">
              <div className="payment-method-card">
                <div className="payment-method-header">
                  <div className="payment-method-icon gpay-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M12.24 10.285V14.4h2.87c-.12.82-.56 1.5-1.16 1.96l1.88 1.46c1.1-1.02 1.73-2.51 1.73-4.29 0-.41-.04-.81-.11-1.19H12.24z" fill="#4285F4"/><path d="M5.98 13.388l-.42.32-1.49 1.16C5.37 17.32 7.92 19 10.95 19c1.84 0 3.38-.61 4.5-1.65l-1.88-1.46c-.58.39-1.32.62-2.13.62-1.64 0-3.03-1.11-3.53-2.6l-.43.05z" fill="#34A853"/><path d="M4.07 7.915C3.55 8.94 3.25 10.1 3.25 11.32c0 1.22.3 2.38.82 3.41.37-.32.99-.87 1.49-1.16.07-.05.28-.22.42-.32-.28-.56-.43-1.2-.43-1.93 0-.73.16-1.37.43-1.93l-.42-.32-1.49-1.1z" fill="#FBBC05"/><path d="M10.95 7.02c.96 0 1.82.33 2.5.97l1.84-1.84C14.08 5.02 12.66 4.32 10.95 4.32c-3.03 0-5.58 1.68-6.88 4.12l1.91 1.48c.5-1.49 1.89-2.9 3.53-2.9h.44z" fill="#EA4335"/></svg>
                  </div>
                  <div className="payment-method-info">
                    <h3>Google Pay</h3>
                    <p>Accept payments from Google Pay wallets</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={!!widget.enable_google_pay} onChange={e => updateField('enable_google_pay', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="payment-method-card">
                <div className="payment-method-header">
                  <div className="payment-method-icon apple-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  </div>
                  <div className="payment-method-info">
                    <h3>Apple Pay</h3>
                    <p>Accept payments from Apple Pay wallets</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={!!widget.enable_apple_pay} onChange={e => updateField('enable_apple_pay', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="payment-method-card">
                <div className="payment-method-header">
                  <div className="payment-method-icon card-icon">
                    <CreditCard size={24} />
                  </div>
                  <div className="payment-method-info">
                    <h3>Credit / Debit Card</h3>
                    <p>Visa, Mastercard, Amex via Stripe Checkout</p>
                  </div>
                  <span className="badge badge-green">Always On</span>
                </div>
              </div>

              <div className="info-card">
                <Heart size={16} />
                <p>Google Pay and Apple Pay appear automatically in Stripe Checkout when the donor&apos;s device supports them. The wallet buttons in the widget provide a visual cue to donors.</p>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="tab-content">
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={!!widget.show_branding} onChange={e => updateField('show_branding', e.target.checked)} />
                  Show DonateWidget branding
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={!!widget.enable_recurring} onChange={e => updateField('enable_recurring', e.target.checked)} />
                  Enable recurring donations (coming soon)
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={!!widget.show_donor_wall} onChange={e => updateField('show_donor_wall', e.target.checked)} />
                  Show donor wall (coming soon)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="edit-preview">
            <h2>Live Preview</h2>
            <div className="preview-container">
              <WidgetPreview widget={widget} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WidgetPreview({ widget }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const buttonStyles = {
    rounded: '12px',
    pill: '9999px',
    square: '4px'
  };

  const getHeaderBg = () => {
    const style = widget.header_style || 'gradient';
    const c1 = widget.primary_color;
    const c2 = widget.secondary_color || '#8b5cf6';
    if (style === 'solid') return c1;
    if (style === 'radial') return `radial-gradient(circle at 30% 30%, ${c2}, ${c1})`;
    return `linear-gradient(135deg, ${c1}, ${c2})`;
  };

  const sym = widget.currency === 'usd' ? '$' : widget.currency === 'eur' ? '\u20AC' : widget.currency === 'gbp' ? '\u00A3' : '$';

  return (
    <div className="widget-preview-popup">
      <div className="preview-popup-header" style={{ background: getHeaderBg() }}>
        <div className="preview-header-icon">
          {widget.header_image_url ? (
            <img src={widget.header_image_url} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          )}
        </div>
        <h3>{widget.title}</h3>
        <p>{widget.description}</p>
      </div>

      <div className="preview-popup-body">
        <div className="preview-section-label">Select Amount</div>
        <div className="preview-amounts">
          {widget.preset_amounts.map(amt => (
            <button
              key={amt}
              className={`preview-amount-btn ${selectedAmount === amt ? 'selected' : ''}`}
              style={selectedAmount === amt ? {
                borderColor: widget.primary_color,
                background: `linear-gradient(135deg, ${widget.primary_color}10, ${widget.secondary_color || '#8b5cf6'}10)`,
                color: widget.primary_color
              } : {}}
              onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
            >
              <span className="preview-amt-value">{sym}{amt}</span>
            </button>
          ))}
        </div>

        {widget.allow_custom_amount && (
          <div className="preview-custom">
            <span className="preview-custom-symbol">{sym}</span>
            <input
              type="number"
              placeholder="Enter custom amount"
              value={customAmount}
              onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
            />
          </div>
        )}

        {(widget.enable_google_pay || widget.enable_apple_pay) && (
          <>
            <div className="preview-wallets">
              {widget.enable_google_pay && (
                <button className="preview-wallet-btn">
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12.24 10.285V14.4h2.87c-.12.82-.56 1.5-1.16 1.96l1.88 1.46c1.1-1.02 1.73-2.51 1.73-4.29 0-.41-.04-.81-.11-1.19H12.24z" fill="#4285F4"/><path d="M5.98 13.388l-.42.32-1.49 1.16C5.37 17.32 7.92 19 10.95 19c1.84 0 3.38-.61 4.5-1.65l-1.88-1.46c-.58.39-1.32.62-2.13.62-1.64 0-3.03-1.11-3.53-2.6l-.43.05z" fill="#34A853"/><path d="M4.07 7.915C3.55 8.94 3.25 10.1 3.25 11.32c0 1.22.3 2.38.82 3.41l1.91-1.48c-.28-.56-.43-1.2-.43-1.93 0-.73.16-1.37.43-1.93l-1.91-1.42z" fill="#FBBC05"/><path d="M10.95 7.02c.96 0 1.82.33 2.5.97l1.84-1.84C14.08 5.02 12.66 4.32 10.95 4.32c-3.03 0-5.58 1.68-6.88 4.12l1.91 1.48c.5-1.49 1.89-2.9 3.53-2.9h.44z" fill="#EA4335"/></svg>
                  Google Pay
                </button>
              )}
              {widget.enable_apple_pay && (
                <button className="preview-wallet-btn">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Apple Pay
                </button>
              )}
            </div>
            <div className="preview-divider"><span>or pay with card</span></div>
          </>
        )}

        <button
          className="preview-donate-btn"
          style={{
            background: `linear-gradient(135deg, ${widget.primary_color}, ${widget.secondary_color || '#8b5cf6'})`,
            borderRadius: buttonStyles[widget.button_style],
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {widget.button_text}
        </button>

        <div className="preview-secure">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Secured by Stripe
        </div>

        {widget.show_branding && (
          <p className="preview-branding">Powered by DonateWidget</p>
        )}
      </div>
    </div>
  );
}
