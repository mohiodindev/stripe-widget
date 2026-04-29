import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    api.get(`/donations?limit=${limit}&offset=${page * limit}`)
      .then(res => {
        setDonations(res.data.donations);
        setTotal(res.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const formatAmount = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Donations</h1>
        <span className="badge badge-blue">{total} total</span>
      </div>

      <div className="card">
        {loading ? (
          <div className="page-loading">Loading...</div>
        ) : donations.length === 0 ? (
          <div className="empty-state">
            <p>No donations found.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Donor</th>
                    <th>Email</th>
                    <th>Widget</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d.id}>
                      <td>{new Date(d.created_at).toLocaleDateString()}</td>
                      <td>{d.donor_name || 'Anonymous'}</td>
                      <td>{d.donor_email || '-'}</td>
                      <td>{d.widget_name}</td>
                      <td className="amount">{formatAmount(d.amount)}</td>
                      <td>
                        <span className={`badge ${
                          d.status === 'completed' ? 'badge-green' :
                          d.status === 'pending' ? 'badge-yellow' : 'badge-gray'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                className="btn btn-sm btn-outline"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span>Page {page + 1} of {Math.ceil(total / limit) || 1}</span>
              <button
                className="btn btn-sm btn-outline"
                disabled={(page + 1) * limit >= total}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
