import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, TrendingUp, Calendar, Users } from 'lucide-react';
import api from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/donations/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatAmount = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.org_name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}>
            <DollarSign size={24} color="#7c3aed" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Donations</span>
            <span className="stat-value">{formatAmount(stats?.total?.amount || 0)}</span>
            <span className="stat-sub">{stats?.total?.count || 0} donations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <TrendingUp size={24} color="#16a34a" />
          </div>
          <div className="stat-content">
            <span className="stat-label">This Month</span>
            <span className="stat-value">{formatAmount(stats?.month?.amount || 0)}</span>
            <span className="stat-sub">{stats?.month?.count || 0} donations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <Calendar size={24} color="#2563eb" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Today</span>
            <span className="stat-value">{formatAmount(stats?.today?.amount || 0)}</span>
            <span className="stat-sub">{stats?.today?.count || 0} donations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <Users size={24} color="#d97706" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Avg Donation</span>
            <span className="stat-value">
              {stats?.total?.count > 0
                ? formatAmount(Math.round(stats.total.amount / stats.total.count))
                : '$0.00'}
            </span>
            <span className="stat-sub">per donation</span>
          </div>
        </div>
      </div>

      {/* Recent donations */}
      <div className="card">
        <h2>Recent Donations</h2>
        {stats?.recent?.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor</th>
                  <th>Widget</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map(d => (
                  <tr key={d.id}>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>{d.donor_name || d.donor_email || 'Anonymous'}</td>
                    <td>{d.widget_name}</td>
                    <td className="amount">{formatAmount(d.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No donations yet. Share your widget to start receiving donations!</p>
          </div>
        )}
      </div>
    </div>
  );
}
