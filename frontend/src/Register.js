import React, { useState } from 'react';
import './Auth.css';   // 👈 use same CSS as login

function Register({ onBack }) {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : '';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      alert('✅ Registration successful! Please login.');
      onBack();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>🧩 Autism Support System</h1>
          <p>Create your account to continue</p>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleRegister} className="auth-form">

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="custom-select"
            >
              <option value="parent">Parent</option>
              <option value="guardian">Guardian</option>
              <option value="educator">Educator</option>
              <option value="self">Self</option>
            </select>
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="auth-back"
          >
            ← Back to Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default Register;