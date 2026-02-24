import React, { useEffect, useState } from 'react';

function MyAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
const auth = JSON.parse(localStorage.getItem('auth'));
const token = auth?.token;
if (!token) {
  setError('Please login again');
  setLoading(false);
  return;
}



        const res = await fetch('/api/my-assessments', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed');

        setAssessments(data.assessments);
      } catch (err) {
        setError('Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) return <p>Loading assessments...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard">
      <h2>📊 My Assessments</h2>

      {assessments.length === 0 && (
        <p>No assessments found.</p>
      )}

      {assessments.map((a, i) => (
        <div key={i} className="card">
          <p><strong>Date:</strong> {new Date(a.createdAt).toLocaleString()}</p>
          <p><strong>Needs Level:</strong> {a.analysis?.needsLevel}</p>

          <button
            onClick={() =>
              window.location.href = `/result/${a.accessToken}`
            }
          >
            View Result
          </button>
        </div>
      ))}
    </div>
  );
}

export default MyAssessments;
