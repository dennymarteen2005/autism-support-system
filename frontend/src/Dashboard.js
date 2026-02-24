import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function Dashboard({ onStartAssessment, onOpenProgress, onOpenHistory }) {
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [latestProgress, setLatestProgress] = useState(null);

  const auth = JSON.parse(localStorage.getItem('auth'));
  const token = auth?.token;
  const user = auth?.user;

  const API_BASE =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : '';

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!token) return;

    // load assessments
    fetch(`${API_BASE}/api/my-assessments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.assessments.length > 0)
          setLatestAssessment(d.assessments[0]);
      });

    // load progress
    fetch(`${API_BASE}/api/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.progress.length > 0)
          setLatestProgress(d.progress[0]);
      });

  }, [token, API_BASE]);

  return (
    <div className="dashboard-container">

      <h1>👋 Welcome, {user?.name || 'User'}</h1>
      <p className="subtitle">
        Your personalized autism support dashboard
      </p>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>🧠 Support Level</h3>
          <p className="big">
            {latestAssessment?.analysis?.needsLevel || 'Not taken yet'}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>🔥 Current Streak</h3>
          <p className="big">
            {latestProgress?.streak || 0} days
          </p>
        </div>

        <div className="dashboard-card">
          <h3>😊 Last Mood</h3>
          <p className="big">
            {latestProgress?.mood || 'No data'}
          </p>
        </div>

      </div>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="dashboard-actions">

        <button className="btn-primary" onClick={onStartAssessment}>
          🧩 Take New Assessment
        </button>

        <button className="btn-secondary" onClick={onOpenProgress}>
          📈 View Progress Tracker
        </button>

        <button className="btn-secondary" onClick={onOpenHistory}>
          📚 Assessment History
        </button>

      </div>

      {/* ===== MOTIVATION ===== */}
      <div className="dashboard-motivation">
        <h3>💬 Motivation</h3>
        <p>
          Every small step matters. Consistency builds progress.
          You’re doing great today.
        </p>
      </div>

    </div>
  );
}

export default Dashboard;