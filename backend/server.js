/**
 * ✅ PRODUCTION-STABLE SERVER
 * SINGLE FILE — SAFE FOR LOCAL + RENDER
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

/* ===================== MIDDLEWARE ===================== */
app.use(cors());
app.use(bodyParser.json());

/* ===================== AUTH MIDDLEWARE ===================== */
const authOptional = (req, _, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
  } catch {}
  next();
};

const authRequired = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/* ===================== DATABASE ===================== */
let useDatabase = false;
let assessmentsMemory = [];

mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    useDatabase = true;
    console.log('✅ MongoDB Connected');
  })
  .catch(() => {
    console.log('⚠️ MongoDB failed, using memory');
  });

/* ===================== MODELS ===================== */
const User = mongoose.model(
  'User',
  new mongoose.Schema(
    {
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: String
    },
    { timestamps: true }
  )
);

const Assessment = mongoose.model(
  'Assessment',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, default: null },
      userName: String,
      userEmail: String,
      responses: Object,
      analysis: Object,
      recommendations: Array,
      supportPlan: Object,
      dailyTip: String,
      accessToken: String,
      assessmentDate: { type: Date, default: Date.now }
    },
    { timestamps: true }
  )
);

const Progress = mongoose.model(
  'Progress',
  new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      mood: String,
      activities: [String],
      notes: String,
      streak: { type: Number, default: 1 }   // ⭐ ADD THIS LINE
    },
    { timestamps: true }
  )
);
/* ===================== AI ENGINE ===================== */
class SupportAnalyzer {
  constructor(responses) {
    this.responses = responses;
  }

 analyze() {

  const strengths = [];

  // 🎯 INTEREST DETECTION
  if (this.responses.interest === "Music") {
    strengths.push("Strong response to musical stimulation and rhythm-based learning.");
  }

  if (this.responses.interest === "Drawing / Art") {
    strengths.push("Creative visual expression strength detected.");
  }

  if (this.responses.interest === "Sports") {
    strengths.push("Shows strong motor engagement and physical activity interest.");
  }

  if (this.responses.interest === "Technology") {
    strengths.push("Logical thinking and structured interaction preference detected.");
  }

  if (this.responses.interest === "Storytelling / Reading") {
    strengths.push("Language processing and imagination engagement strength.");
  }

  if (this.responses.interest === "Building / Puzzles") {
    strengths.push("Problem-solving and pattern-recognition strength detected.");
  }

  return {
    scores: { sensory: 3, social: 3, routine: 3, communication: 3 },
    needsLevel: 'Moderate',
    ageGroup: this.responses.age,
    role: this.responses.role,
    strengths
  };
}
}

const generateRecommendations = () => [
  {
    category: 'Sensory Regulation',
    priority: 'High',
    items: [
      {
        title: 'Calming Strategies',
        suggestions: [
          'Noise-canceling headphones',
          'Low-light environments',
          'Predictable routines'
        ]
      }
    ]
  }
];
const generateSupportPlan = () => ({
  exercises: [
    '5-minute breathing exercise',
    'Stretching or walking',
    'Quiet focus activity'
  ],
  diet: [
    'Reduce sugar intake',
    'Encourage hydration',
    'Whole foods preferred'
  ],
  motivation: [
    'Praise effort',
    'Keep tasks small',
    'Celebrate progress'
  ],

  videos: [
    {
      title: "Calming sensory routine",
      url: "https://www.youtube.com/watch?v=1ZYbU82GVz4"
    },
    {
      title: "Speech therapy exercise",
      url: "https://www.youtube.com/watch?v=YtvP5A5OHpU"
    },
    {
      title: "Structured routine activity",
      url: "https://www.youtube.com/watch?v=6gJjCkN8QnA"
    }
  ]
});

const generateDailyTip = analysis =>
  analysis.needsLevel === 'High'
    ? 'Keep today calm and predictable.'
    : analysis.needsLevel === 'Moderate'
    ? 'Small structured activities help a lot today.'
    : 'Encourage exploration and independence.';

const generateAccessToken = () =>
  crypto.randomBytes(16).toString('hex');

/* ===================== ANALYZE ===================== */
app.post('/api/analyze', authOptional, async (req, res) => {
  try {
    const { responses, userName, userEmail } = req.body;
    if (!responses) return res.status(400).json({ error: 'No responses' });

    const analysis = new SupportAnalyzer(responses).analyze();
    const recommendations = generateRecommendations();
    const supportPlan = generateSupportPlan();
    const dailyTip = generateDailyTip(analysis);
    const accessToken = generateAccessToken();

    const data = {
      userId: req.user?.id || null,
      userName,
      userEmail,
      responses,
      analysis,
      recommendations,
      supportPlan,
      dailyTip,
      accessToken
    };

    if (useDatabase) await new Assessment(data).save();
    else assessmentsMemory.push(data);

    res.json({ success: true, ...data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

/* ===================== PROGRESS TRACKER ===================== */
app.post('/api/progress', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev_secret'
    );

    const { mood, activities, notes } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    // 🔥 FIND LAST ENTRY
    const lastEntry = await Progress.findOne({ userId: decoded.id })
      .sort({ createdAt: -1 });

    let streak = 1;

    if (lastEntry) {
      const lastDate = new Date(lastEntry.createdAt);
      const today = new Date();

      const diffDays = Math.floor(
        (today - lastDate) / (1000 * 60 * 60 * 24)
      );

      // yesterday → streak++
      if (diffDays === 1) {
        streak = lastEntry.streak + 1;
      }

      // same day → keep streak
      if (diffDays === 0) {
        streak = lastEntry.streak;
      }
    }

    const progress = await Progress.create({
      userId: decoded.id,
      mood,
      activities: activities || [],
      notes: notes || '',
      streak
    });

    res.status(201).json({
      success: true,
      progress,
      streak
    });

  } catch (err) {
    console.error('Progress save error:', err);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});
app.get('/api/progress', authRequired, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Progress fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

/* ===================== AUTH ===================== */
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Missing fields' });

  if (await User.findOne({ email }))
    return res.status(400).json({ error: 'User exists' });

  await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role
  });

  res.json({ success: true });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/* ===================== HEALTH ===================== */
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', database: useDatabase ? 'MongoDB' : 'Memory' });
});

/* ===================== FRONTEND ===================== */
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (_, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

/* ===================== START ===================== */
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
