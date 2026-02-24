import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './Auth.css';   // 👈 new CSS file

function Login({ onBack, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      if (onSuccess) onSuccess();

    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>🧩 Autism Support System</h1>
          <p>Login to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

<div style={{ display:'flex', gap:'10px', marginTop:'12px' }}>

  <button type="button" onClick={onBack} className="auth-back">
    ← Back
  </button>

  <button
    type="button"
    onClick={() => window.dispatchEvent(new Event('goRegister'))}
    className="auth-back"
  >
    Create Account
  </button>

</div>

        </form>
      </div>
    </div>
  );
}

export default Login;