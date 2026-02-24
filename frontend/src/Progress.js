import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import './Progress.css';

function Progress() {
  const [mood, setMood] = useState('');
  const [activities, setActivities] = useState('');
  const [notes, setNotes] = useState('');
  const [progressList, setProgressList] = useState([]);

  const auth = JSON.parse(localStorage.getItem('auth'));
  const token = auth?.token;

  const API_BASE =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : '';

  /* ================= FETCH PROGRESS ================= */
  const fetchProgress = useCallback(async () => {
    try {
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setProgressList(data.progress);
      }
    } catch (err) {
      console.error('Fetch progress failed:', err);
    }
  }, [token, API_BASE]);

  /* ================= SAVE PROGRESS ================= */
  const submitProgress = async () => {
    try {
      if (!token) {
        alert('Please login again');
        return;
      }

      const res = await fetch(`${API_BASE}/api/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood,
          activities: activities
            ? activities.split(',').map(a => a.trim())
            : [],
          notes,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error();

      setMood('');
      setActivities('');
      setNotes('');
      fetchProgress();
    } catch {
      alert('Failed to save progress');
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  /* ================= MOOD SCORE FOR CHART ================= */
  const moodScore = m => {
    if (!m) return 0;
    const value = m.toLowerCase();

    if (value.includes('happy')) return 5;
    if (value.includes('calm')) return 4;
    if (value.includes('okay')) return 3;
    if (value.includes('sad')) return 2;
    if (value.includes('angry') || value.includes('anxious')) return 1;
    return 3;
  };

  const chartData = progressList
    .slice()
    .reverse()
    .map(p => ({
      date: new Date(p.createdAt).toLocaleDateString(),
      mood: moodScore(p.mood)
    }));

  /* ================= UI ================= */
  return (
    <div className="progress-container">
      <h2>📈 Daily Progress Tracker</h2>

      <input
        className="progress-input"
        placeholder="Mood (Happy, Calm, Sad...)"
        value={mood}
        onChange={e => setMood(e.target.value)}
      />

      <input
        className="progress-input"
        placeholder="Activities (Music, Art, Exercise)"
        value={activities}
        onChange={e => setActivities(e.target.value)}
      />

      <textarea
        className="progress-textarea"
        placeholder="Notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />

      <button className="btn-primary" onClick={submitProgress}>
        💾 Save Progress
      </button>

      {/* ================= CHART ================= */}
      {chartData.length > 0 && (
        <>
          <h3 style={{ marginTop: 40 }}>📊 Mood Growth Chart</h3>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#6C63FF"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ================= HISTORY ================= */}
      <h3>🕒 Past Progress</h3>

      {progressList.length === 0 && (
        <p className="empty-text">No progress recorded yet.</p>
      )}

      {progressList.map(p => (
        <div key={p._id} className="progress-card">
          <strong>{new Date(p.createdAt).toDateString()}</strong>
          <p><b>Mood:</b> {p.mood}</p>
          <p><b>Activities:</b> {p.activities.join(', ')}</p>
          <p><b>Notes:</b> {p.notes}</p>
          {p.streak && <p><b>🔥 Streak:</b> {p.streak} days</p>}
        </div>
      ))}
    </div>
  );
}

export default Progress;