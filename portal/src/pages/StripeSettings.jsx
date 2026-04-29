import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function StripeSettings() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = () => {
    api.get('/stripe/status')
      .then(res => setStatus(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await api.post('/stripe/connect');
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Connect error:', err);
      setConnecting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  const success = searchParams.get('success');

  return (
    <div className="page">
      <div className="page-header">
        <h1>Stripe Settings</h1>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={20} />
          <span>Stripe account connected successfully! Refreshing status...</span>
        </div>
      )}

      <div className="card stripe-card">
        <div className="stripe-header">
          <CreditCard size={32} />
          <div>
            <h2>Stripe Connect</h2>
            <p>Connect your Stripe account to receive donations directly</p>
          </div>
        </div>

        <div className="stripe-status">
          {status?.onboarded ? (
            <div className="status-connected">
              <CheckCircle2 size={24} color="#16a34a" />
              <div>
                <strong>Connected</strong>
                <p>Account ID: {status.accountId}</p>
                <p>Charges: {status.chargesEnabled ? 'Enabled' : 'Disabled'}</p>
                <p>Payouts: {status.payoutsEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          ) : status?.connected ? (
            <div className="status-pending">
              <AlertCircle size={24} color="#d97706" />
              <div>
                <strong>Onboarding Incomplete</strong>
                <p>Your Stripe account is connected but setup is not complete.</p>
              </div>
            </div>
          ) : (
            <div className="status-disconnected">
              <AlertCircle size={24} color="#6b7280" />
              <div>
                <strong>Not Connected</strong>
                <p>Connect your Stripe account to start receiving donations.</p>
              </div>
            </div>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? (
            <Loader2 size={18} className="spinner" />
          ) : status?.onboarded ? (
            <>
              <ExternalLink size={18} />
              <span>Update Stripe Account</span>
            </>
          ) : (
            <>
              <CreditCard size={18} />
              <span>{status?.connected ? 'Complete Setup' : 'Connect Stripe'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
