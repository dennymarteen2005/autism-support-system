import React, { useState, useEffect } from 'react';
import './App.css';
import Progress from './Progress';
import { useAuth } from './AuthContext';
import Login from './Login';
import MyAssessments from './MyAssessments';
import Register from './Register';
import Dashboard from './Dashboard';
import Navbar from './Navbar';



function App() {
  const [currentSection, setCurrentSection] = useState(-1);
  const [responses, setResponses] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
const [viewMode, setViewMode] = useState('login');// questionnaire | results | history | progress
  const { user, logout } = useAuth();
useEffect(() => {
  const auth = JSON.parse(localStorage.getItem('auth'));

  // if not logged in → stay on login
  if (!auth?.token) {
    setViewMode('login');
  }

  // if logged in, do NOTHING
  // because login success will decide where to go
}, []);
useEffect(() => {
  const goRegister = () => setViewMode('register');
  window.addEventListener('goRegister', goRegister);
  return () => window.removeEventListener('goRegister', goRegister);
}, []);
  // Scroll to top whenever section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection, viewMode, showResults]);

  const sections = [
    {
      title: "Basic Information",
      questions: [
        {
          id: "age",
          text: "Age Group",
          type: "select",
          options: ["2-4 years", "5-7 years", "8-12 years", "13-17 years", "18+ years"]
        },
        {
          id: "role",
          text: "Your Role",
          type: "select",
          options: ["Parent", "Caregiver", "Educator", "Self-assessment"]
        }
      ]
    },
    {
      title: "Social Communication",
      questions: [
        {
          id: "eye_contact",
          text: "How comfortable with making eye contact during conversation?",
          type: "scale",
          options: ["Very uncomfortable", "Uncomfortable", "Neutral", "Comfortable", "Very comfortable"]
        },
        {
          id: "social_greeting",
          text: "Response to social greetings (hello, goodbye)?",
          type: "scale",
          options: ["Rarely responds", "Sometimes responds", "Usually responds", "Always responds", "Initiates greetings"]
        },
        {
          id: "sharing",
          text: "Shows interest in sharing experiences with others?",
          type: "scale",
          options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
        },
        {
          id: "nonverbal",
          text: "Understanding non-verbal cues (facial expressions, body language)?",
          type: "scale",
          options: ["Very difficult", "Difficult", "Moderate", "Good", "Very good"]
        }
      ]
    },
    {
      title: "Sensory Processing",
      questions: [
        {
          id: "noise",
          text: "Reaction to loud or unexpected noises?",
          type: "scale",
          options: ["Very distressed", "Distressed", "Mildly bothered", "Unbothered", "Doesn't notice"]
        },
        {
          id: "lights",
          text: "Response to bright lights or visual patterns?",
          type: "scale",
          options: ["Very sensitive", "Sensitive", "Sometimes bothered", "Rarely bothered", "Not bothered"]
        },
        {
          id: "textures",
          text: "Reaction to different food textures?",
          type: "scale",
          options: ["Very selective", "Selective", "Somewhat selective", "Flexible", "Very flexible"]
        },
        {
          id: "clothing",
          text: "Reaction to clothing tags, seams, or fabrics?",
          type: "scale",
          options: ["Cannot tolerate", "Very bothered", "Sometimes bothered", "Rarely bothered", "Not bothered"]
        }
      ]
    },
    {
      title: "Behavioral Patterns & Routines",
      questions: [
        {
          id: "routine_change",
          text: "Response to changes in routine or schedule?",
          type: "scale",
          options: ["Very distressed", "Distressed", "Mildly upset", "Adapts with support", "Adapts easily"]
        },
        {
          id: "repetitive",
          text: "Engagement in repetitive behaviors or movements?",
          type: "scale",
          options: ["Very frequent", "Frequent", "Occasional", "Rare", "Never"]
        },
        {
          id: "interests",
          text: "Intensity of focus on specific interests or topics?",
          type: "scale",
          options: ["All-consuming", "Very intense", "Moderate", "Mild", "Varied interests"]
        }
      ]
    },
    {
      title: "Communication & Expression",
      questions: [
        {
          id: "verbal",
          text: "Verbal communication comfort level?",
          type: "scale",
          options: ["Non-verbal", "Limited words", "Simple sentences", "Full sentences", "Advanced vocabulary"]
        },
        {
          id: "emotions",
          text: "Ability to express emotions and feelings?",
          type: "scale",
          options: ["Very difficult", "Difficult", "Moderate", "Good", "Very good"]
        },
        {
          id: "literal",
          text: "Understanding of figurative language (jokes, sarcasm)?",
          type: "scale",
          options: ["Takes everything literally", "Usually literal", "Sometimes understands", "Often understands", "Fully understands"]
        }
      ]
    },
    {
    title: "Interests & Skills",
    questions: [
      {
        id: "interest",
        text: "Which activity does the individual enjoy most?",
        type: "select",
        options: [
          "Music",
          "Drawing / Art",
          "Sports",
          "Technology",
          "Storytelling / Reading",
          "Building / Puzzles"
        ]
      }
    ]
  }
  ];

  const handleResponse = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };

const analyzeWithBackend = async () => {
  setLoading(true);

  try {
    const auth = JSON.parse(localStorage.getItem('auth'));
    const token = auth?.token;

    console.log('JWT being sent:', token); // 🔍 DEBUG

    const response = await fetch(
      'http://localhost:5000/api/analyze',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          responses,
          userName: userName || 'Anonymous',
          userEmail: userEmail || null
        })
      }
    );

    const data = await response.json();
    console.log('Analyze response:', data);

    if (!data.success) {
      throw new Error('Analysis failed');
    }

    setAnalysisResult(data);
    setShowResults(true);

  } catch (err) {
    console.error(err);
    alert('Failed to analyze responses');
  } finally {
    setLoading(false);
  }
};

const startQuestionnaire = () => {
  if (!userName.trim()) {
    alert('Please enter your name to continue');
    return;
  }
  setViewMode('questionnaire');
  setCurrentSection(0);
};

  const goNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      analyzeWithBackend();
    }
  };

  const goBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else if (currentSection === 0) {
      setCurrentSection(-1);
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const copyAccessToken = () => {
    if (analysisResult?.accessToken) {
      navigator.clipboard.writeText(analysisResult.accessToken);
      alert('Access token copied! Save this to view your assessment later.');
    }
  };

  const viewHistory = () => {
    setViewMode('history');
  };

  const loadAssessment = async (token) => {
    setLoading(true);
    try {
      const response = await fetch(
  process.env.NODE_ENV === 'development'
    ? `http://localhost:5000/api/assessment/${token}`
    : `/api/assessment/${token}`
);


      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult({
          analysis: data.assessment.analysis,
          recommendations: data.assessment.recommendations,
          strengths: data.assessment.analysis.strengths,
          accessToken: data.assessment.accessToken,
          success: true
        });
        setShowResults(true);
        setViewMode('results');
      } else {
        alert('Assessment not found');
      }
    } catch (error) {
      console.error('Load error:', error);
      alert('Failed to load assessment. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="App">
        <Navbar setViewMode={setViewMode} />
        <div className="animated-background"></div>
        <div className="container">
          <div className="loading">
            <div className="loader-circle"></div>
            <h2>🧠 Analyzing Responses...</h2>
            <p>Generating personalized recommendations based on AI analysis</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }
// Progress Tracker View
if (viewMode === 'progress') {
  return (
    <div className="App">
      <div className="animated-background"></div>
      <div className="container">
        <button
          className="btn-secondary"
          onClick={() => setViewMode('questionnaire')}
        >
          ← Back
        </button>

        <Progress />
      </div>
    </div>
  );
}

  // History View
  if (viewMode === 'history') {
    const savedTokens = JSON.parse(localStorage.getItem('assessmentTokens') || '[]');
    
    return (
      <div className="App">
        <div className="animated-background"></div>
        <div className="container">
          <div className="history-header">
            <h1>📚 Assessment History</h1>
            <button onClick={() => { setViewMode('questionnaire'); setShowResults(false); setCurrentSection(-1); }} className="btn-secondary">
              ← Back to Home
            </button>
          </div>

          {savedTokens.length === 0 ? (
            <div className="empty-state">
              <p>No saved assessments found</p>
              <button onClick={() => setViewMode('questionnaire')} className="btn-primary">
                Take New Assessment
              </button>
            </div>
          ) : (
            <div className="history-grid">
              {savedTokens.reverse().map((item, idx) => (
                <div key={idx} className="history-card">
                  <div className="history-info">
                    <h3>{item.name}</h3>
                    <p className="history-date">
                      {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString()}
                    </p>
                    <p className="history-token">Token: {item.token.substring(0, 16)}...</p>
                  </div>
                  <button onClick={() => loadAssessment(item.token)} className="btn-primary btn-small">
                    View Results
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
if (viewMode === 'my-assessments') {
  return (
    <div className="App">
      <div className="animated-background"></div>
      <div className="container">
        <MyAssessments />
        <button
          className="btn-secondary"
          onClick={() => setViewMode('results')}
          style={{ marginTop: '20px' }}
        >
          ← Back to Results
        </button>
      </div>
    </div>
  );
}

  // Results Display
  if (showResults && analysisResult) {
    return (
      
      <div className="App">
        <div className="animated-background"></div>
        <div className="container">
          <div className="disclaimer no-print">
            ⚠️ <strong>Important Disclaimer:</strong> This is NOT a diagnostic tool. 
            This system provides support suggestions only. Please consult healthcare 
            professionals for medical advice and formal assessment.
          </div>
          <p style={{marginTop:'15px'}}>
This support plan adapts over time as new assessments and progress
data are recorded, allowing personalized developmental guidance.
</p>

          <h1>✨ Your Personalized Support Plan</h1>
          {analysisResult.dailyTip && (
  <div className="recommendation-card highlight">
    <h3>🌞 Today’s AI Tip</h3>
    <p>{analysisResult.dailyTip}</p>
  </div>
)}

          {analysisResult.accessToken && (
            <div className="access-token-card no-print">
              <h3>🔑 Your Access Token</h3>
              <p>Save this token to view your assessment results later:</p>
              <div className="token-display">
                <code>{analysisResult.accessToken}</code>
                <button onClick={copyAccessToken} className="btn-copy">📋 Copy</button>
              </div>
            </div>
          )}

          {analysisResult.analysis && (
            <div className="analysis-summary">
              <h3>📊 Analysis Summary</h3>
              <div className="summary-grid">
                {responses.interest && (
  <div className="summary-item">
    <span className="label">Detected Interest:</span>
    <span className="value">{responses.interest}</span>
  </div>
)}
                <div className="summary-item">
                  <span className="label">Support Needs Level:</span>
                  <span className={`badge badge-${analysisResult.analysis.needsLevel.toLowerCase()}`}>
                    {analysisResult.analysis.needsLevel}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Age Group:</span>
                  <span className="value">{analysisResult.analysis.ageGroup}</span>
                </div>
              </div>
              {analysisResult.supportPlan && (
  <div className="recommendation-card">
    <h3>🧩 Personalized Support Plan</h3>

    <h4>🧘 Exercises</h4>
    <ul>
      {analysisResult.supportPlan.exercises.map((e, i) => (
        <li key={i}>{e}</li>
      ))}
    </ul>

    <h4>🥗 Diet</h4>
    <ul>
      {analysisResult.supportPlan.diet.map((d, i) => (
        <li key={i}>{d}</li>
      ))}
    </ul>

    <h4>💬 Motivation</h4>
    <ul>
      {analysisResult.supportPlan.motivation.map((m, i) => (
        <li key={i}>{m}</li>
      ))}
    </ul>
    <h4>🎥 Recommended Videos</h4>
<ul>
  {analysisResult.supportPlan.videos?.map((v, i) => (
    <li key={i}>
      <a href={v.url} target="_blank" rel="noreferrer">
        ▶ {v.title}
      </a>
    </li>
  ))}
</ul>
  </div>
)}

              
              {analysisResult.strengths && analysisResult.strengths.length > 0 && (
                <div className="strengths-section">
                  <h4>💪 Identified Strengths:</h4>
                  <div className="strengths-grid">
                    {analysisResult.strengths.map((strength, idx) => (
                      <div key={idx} className="strength-card">
                        ✨ {strength}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="results">
            {analysisResult.recommendations && analysisResult.recommendations.map((rec, idx) => (
              <div key={idx} className="recommendation-card">
                <div className="card-header">
                  <h3>{rec.category}</h3>
                  {rec.priority && <span className="priority-badge">{rec.priority}</span>}
                </div>
                
                {rec.items && rec.items.map((item, i) => (
                  <div key={i} className="recommendation-item">
                    <h4>🎯 {item.title}</h4>
                    <ul>
                      {item.suggestions && item.suggestions.map((suggestion, j) => (
                        <li key={j}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="actions no-print">
            <button
  onClick={() => setViewMode('my-assessments')}
  className="btn-secondary"
>
  📊 My Assessments
</button>

          <button
  onClick={() => setViewMode('progress')}
  className="btn-secondary"
>
  📈 Track Progress
</button>

            <button onClick={downloadPDF} className="btn-primary">
              📄 Download Report (PDF)
            </button>
            <button onClick={viewHistory} className="btn-secondary">
              📚 View History
            </button>
<button
  onClick={() => {
    setShowResults(false);
    setAnalysisResult(null);
    setResponses({});
    setUserName('');
    setUserEmail('');
    setCurrentSection(-1);
    setViewMode('home');
  }}
  className="btn-secondary"
>
  🔄 New Assessment
</button>
          </div>

          <div className="next-steps">
            <h3>🚀 Recommended Next Steps</h3>
            <div className="steps-list">
              <div className="step">
                <span className="step-number">1</span>
                <p>Share these recommendations with caregivers and educators</p>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <p>Implement suggestions gradually and observe responses</p>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <p>Consult with pediatricians, therapists, or special education professionals</p>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <p>Track progress and adjust strategies as needed</p>
              </div>
              <div className="step">
                <span className="step-number">5</span>
                <p>Join support groups and connect with autism community resources</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

if (viewMode === 'login') {
  return <Login onSuccess={() => setViewMode('home')} />;
}
if (viewMode === 'register') {
  return <Register onBack={() => setViewMode('login')} />;
}


if (viewMode === 'dashboard') {
  return (
<Dashboard
  onStartAssessment={() => {
    setViewMode('questionnaire');
    setCurrentSection(0);
  }}
  onOpenProgress={() => setViewMode('progress')}
  onOpenHistory={() => setViewMode('history')}
/>
  );
}
  // User Info Collection (Start Screen)
  if (viewMode === 'home') {
    return (
      <div className="App">
        <div className="animated-background"></div>
        <div className="container">
          <div className="welcome-screen">
            <h1>🧩 Welcome to Autism Support Assessment</h1>
            <p className="subtitle">An AI-powered tool for identifying personalized developmental support strategies</p>
            
            <div className="info-card">
              <h3>Before We Begin</h3>
              <p>This assessment will help identify support needs and provide personalized recommendations. It takes about 10-15 minutes to complete.</p>
            </div>

            <div className="user-form">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="form-input"
                />
                <small>We'll never share your email. It's only for your records.</small>
              </div>
            </div>

            <div className="action-buttons">
  <button onClick={startQuestionnaire} className="btn-primary btn-large">
    Start Assessment ✨
  </button>
   <button
  onClick={() => setViewMode('dashboard')}
  className="btn-secondary"
>
  📊 Go to Dashboard
</button>   
  <button onClick={viewHistory} className="btn-secondary">
    📚 View Past Assessments
  </button>

  {!user ? (
    <>
      <button
        onClick={() => setViewMode('login')}
        className="btn-secondary"
      >
        🔐 Login
      </button>

      <button
        onClick={() => setViewMode('register')}
        className="btn-secondary"
      >
        📝 Register
      </button>
    </>
  ) : (
    <>
      <p className="logged-user">
        👋 Welcome, <strong>{user.name}</strong>
      </p>

      <button onClick={logout} className="btn-secondary">
        🚪 Logout
      </button>
    </>
  )}
</div>


            <div className="disclaimer">
              ⚠️ <strong>Important:</strong> This is NOT a diagnostic tool. Always consult healthcare professionals for medical advice.
            </div>
          </div>
        </div>
      </div>
    );
  }
  

  // Questionnaire Display
let currentQ = null;
let progress = 0;

if (viewMode === 'questionnaire' && currentSection >= 0) {
  currentQ = sections[currentSection];
  progress = ((currentSection + 1) / sections.length) * 100;
}
if (viewMode === 'questionnaire' && currentQ) {
  return (
    <div className="App">
      <div className="animated-background"></div>
      <div className="container">
        <div className="disclaimer">
          ⚠️ <strong>Important:</strong> This is NOT a diagnostic tool. This system provides 
          support suggestions based on behavioral patterns. Always consult healthcare professionals.
        </div>

        <div className="header">
          <h1>🧩 Autism Support Needs Assessment</h1>
          <p>Answering for: <strong>{userName}</strong></p>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">
            Section {currentSection + 1} of {sections.length} • {Math.round(progress)}% Complete
          </p>
        </div>

        <div className="section">
          <h2>{currentQ.title}</h2>
          
          {currentQ.questions.map((q) => (
            <div key={q.id} className="question">
              <label>{q.text}</label>
              {q.type === "select" ? (
                <select 
                  value={responses[q.id] || ""} 
                  onChange={(e) => handleResponse(q.id, e.target.value)}
                  className="custom-select"
                >
                  <option value="">-- Please Select --</option>
                  {q.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <div className="scale-options">
                  {q.options.map((opt) => (
                    <label key={opt} className="radio-label">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={responses[q.id] === opt}
                        onChange={(e) => handleResponse(q.id, e.target.value)}
                      />
                      <span className="radio-text">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="navigation">
          <button 
            onClick={goBack} 
            className="btn-secondary"
          >
            ← Previous
          </button>
          <button onClick={goNext} className="btn-primary">
            {currentSection === sections.length - 1 ? "Get Recommendations ✨" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
}

export default App;