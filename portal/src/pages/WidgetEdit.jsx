import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye } from 'lucide-react';
import api from '../lib/api';

const CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud'];
const BUTTON_STYLES = ['rounded', 'pill', 'square'];
const BUTTON_SIZES = ['small', 'medium', 'large'];

export default function WidgetEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [widget, setWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
        {/* Settings form */}
        <div className="edit-form card">
          <h2>General Settings</h2>

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

          <h2>Appearance</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Primary Color</label>
              <div className="color-input">
                <input type="color" value={widget.primary_color} onChange={e => updateField('primary_color', e.target.value)} />
                <input type="text" value={widget.primary_color} onChange={e => updateField('primary_color', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Button Text</label>
              <input value={widget.button_text} onChange={e => updateField('button_text', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Button Style</label>
              <select value={widget.button_style} onChange={e => updateField('button_style', e.target.value)}>
                {BUTTON_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Button Size</label>
              <select value={widget.button_size} onChange={e => updateField('button_size', e.target.value)}>
                {BUTTON_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <h2>Donation Settings</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Currency</label>
              <select value={widget.currency} onChange={e => updateField('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
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

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={!!widget.show_branding} onChange={e => updateField('show_branding', e.target.checked)} />
              Show DonateWidget branding
            </label>
          </div>
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
    rounded: '8px',
    pill: '9999px',
    square: '0px'
  };

  const buttonSizes = {
    small: { padding: '8px 16px', fontSize: '14px' },
    medium: { padding: '12px 24px', fontSize: '16px' },
    large: { padding: '16px 32px', fontSize: '18px' }
  };

  return (
    <div className="widget-preview-popup">
      <div className="preview-popup-header" style={{ background: widget.primary_color }}>
        <h3>{widget.title}</h3>
        <p>{widget.description}</p>
      </div>

      <div className="preview-popup-body">
        <div className="preview-amounts">
          {widget.preset_amounts.map(amt => (
            <button
              key={amt}
              className={`preview-amount-btn ${selectedAmount === amt ? 'selected' : ''}`}
              style={selectedAmount === amt ? { borderColor: widget.primary_color, background: widget.primary_color + '10' } : {}}
              onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
            >
              {widget.currency === 'usd' ? '$' : widget.currency === 'eur' ? '\u20AC' : widget.currency === 'gbp' ? '\u00A3' : '$'}{amt}
            </button>
          ))}
        </div>

        {widget.allow_custom_amount && (
          <div className="preview-custom">
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
            />
          </div>
        )}

        <button
          className="preview-donate-btn"
          style={{
            background: widget.primary_color,
            borderRadius: buttonStyles[widget.button_style],
            ...buttonSizes[widget.button_size]
          }}
        >
          {widget.button_text}
        </button>

        {widget.show_branding && (
          <p className="preview-branding">Powered by DonateWidget</p>
        )}
      </div>
    </div>
  );
}
