import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import api from '../lib/api';

export default function EmbedCode() {
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/widgets')
      .then(res => {
        setWidgets(res.data.widgets);
        if (res.data.widgets.length > 0) {
          setSelectedWidget(res.data.widgets[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const widgetUrl = import.meta.env.VITE_WIDGET_URL || 'http://localhost:3002';

  const getEmbedCode = () => {
    return `<!-- DonateWidget -->
<div id="donate-widget-${selectedWidget}"></div>
<script src="${widgetUrl}/donate-widget.js"></script>
<script>
  DonateWidget.init({
    widgetId: '${selectedWidget}',
    apiUrl: '${apiUrl}',
    container: '#donate-widget-${selectedWidget}'
  });
</script>`;
  };

  const getInlineCode = () => {
    return `<!-- DonateWidget Button Only -->
<script src="${widgetUrl}/donate-widget.js"></script>
<button onclick="DonateWidget.open({ widgetId: '${selectedWidget}', apiUrl: '${apiUrl}' })">
  Donate Now
</button>`;
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Embed Code</h1>
      </div>

      <div className="card">
        <h2>Select Widget</h2>
        <div className="form-group">
          <select value={selectedWidget} onChange={e => setSelectedWidget(e.target.value)}>
            {widgets.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedWidget && (
        <>
          <div className="card">
            <div className="embed-header">
              <h2>Full Widget Embed</h2>
              <p>Add this code to your website where you want the donation widget to appear.</p>
            </div>
            <div className="code-block">
              <button className="copy-btn" onClick={() => handleCopy(getEmbedCode())}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <pre><code>{getEmbedCode()}</code></pre>
            </div>
          </div>

          <div className="card">
            <div className="embed-header">
              <h2>Button Only (Popup)</h2>
              <p>Add just a button that opens the donation popup when clicked.</p>
            </div>
            <div className="code-block">
              <button className="copy-btn" onClick={() => handleCopy(getInlineCode())}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <pre><code>{getInlineCode()}</code></pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
