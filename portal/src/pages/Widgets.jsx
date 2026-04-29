import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';

export default function Widgets() {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWidgets = () => {
    api.get('/widgets')
      .then(res => setWidgets(res.data.widgets))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWidgets(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this widget?')) return;
    try {
      await api.delete(`/widgets/${id}`);
      fetchWidgets();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggle = async (widget) => {
    try {
      await api.put(`/widgets/${widget.id}`, { is_active: !widget.is_active });
      fetchWidgets();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/widgets', { name: 'New Widget' });
      fetchWidgets();
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Widgets</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={18} />
          <span>New Widget</span>
        </button>
      </div>

      {widgets.length === 0 ? (
        <div className="empty-state card">
          <p>No widgets yet. Create your first donation widget!</p>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={18} /> Create Widget
          </button>
        </div>
      ) : (
        <div className="widgets-grid">
          {widgets.map(w => (
            <div key={w.id} className="widget-card card">
              <div className="widget-card-header">
                <div className="widget-color-dot" style={{ background: w.primary_color }} />
                <h3>{w.name}</h3>
                <span className={`badge ${w.is_active ? 'badge-green' : 'badge-gray'}`}>
                  {w.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="widget-desc">{w.title}</p>
              <div className="widget-meta">
                <span>{w.currency.toUpperCase()}</span>
                <span>{w.button_text}</span>
                <span>{JSON.parse(w.preset_amounts).join(', ')}</span>
              </div>
              <div className="widget-actions">
                <Link to={`/widgets/${w.id}`} className="btn btn-sm btn-outline">
                  <Pencil size={14} /> Edit
                </Link>
                <button className="btn btn-sm btn-outline" onClick={() => handleToggle(w)}>
                  {w.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  {w.is_active ? 'Disable' : 'Enable'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(w.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
