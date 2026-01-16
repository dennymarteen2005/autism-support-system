/**
 * ⚠️ PRODUCTION-STABLE BASELINE
 * This file is DEPLOYED and WORKING on Render.
 * Do NOT modify existing routes or logic.
 * Only ADD new features below marked sections.
 */

require('dotenv').config();


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());

let useDatabase = false;
let assessmentsMemory = [];

// Connect to MongoDB with better error handling
// Connect to MongoDB with correct options (MongoDB 8.x compatible)
const connectDB = async () => {
  try {
   await mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
});


    useDatabase = true;
    console.log('✅ MongoDB Connected Successfully');
    return true;

  } catch (err) {
    useDatabase = false;
    console.log('⚠️  MongoDB connection failed:', err.message);
    console.log('   Using in-memory storage instead');
    return false;
  }
};


// Call connection
connectDB();

// Assessment Schema
const AssessmentSchema = new mongoose.Schema({
  userName: { type: String, default: 'Anonymous' },
  userEmail: { type: String, default: null },
  responses: { type: Object, required: true },
  analysis: {
    scores: {
      sensory: Number,
      social: Number,
      routine: Number,
      communication: Number
    },
    needsLevel: String,
    ageGroup: String,
    role: String,
    strengths: [String]
  },
  recommendations: { type: Array, default: [] },
  assessmentDate: { type: Date, default: Date.now },
  accessToken: { type: String, required: true, unique: true }
}, { timestamps: true });

const Assessment = mongoose.model('Assessment', AssessmentSchema);

// AI Analysis Engine
class SupportAnalyzer {
  constructor(responses) {
    this.responses = responses;
    this.scores = {
      sensory: 0,
      social: 0,
      routine: 0,
      communication: 0
    };
  }

  analyzeSensory() {
    const sensoryQuestions = ['noise', 'lights', 'textures', 'clothing'];
    const highSensitivity = ['Very distressed', 'Distressed', 'Very sensitive', 'Sensitive', 'Very selective', 'Selective', 'Cannot tolerate', 'Very bothered'];
    
    sensoryQuestions.forEach(q => {
      if (highSensitivity.includes(this.responses[q])) {
        this.scores.sensory += 2;
      } else if (this.responses[q] && !['Not bothered', 'Rarely bothered', 'Very flexible', 'Flexible'].includes(this.responses[q])) {
        this.scores.sensory += 1;
      }
    });
    return this.scores.sensory;
  }

  analyzeSocial() {
    const socialQuestions = {
      'eye_contact': ['Very uncomfortable', 'Uncomfortable'],
      'social_greeting': ['Rarely responds', 'Sometimes responds'],
      'sharing': ['Never', 'Rarely'],
      'nonverbal': ['Very difficult', 'Difficult']
    };

    Object.keys(socialQuestions).forEach(q => {
      if (socialQuestions[q].includes(this.responses[q])) {
        this.scores.social += 2;
      } else if (this.responses[q] && !['Very comfortable', 'Comfortable', 'Always', 'Often', 'Very good', 'Good'].includes(this.responses[q])) {
        this.scores.social += 1;
      }
    });
    return this.scores.social;
  }

  analyzeRoutine() {
    const routineQuestions = {
      'routine_change': ['Very distressed', 'Distressed'],
      'repetitive': ['Very frequent', 'Frequent'],
      'interests': ['All-consuming', 'Very intense']
    };

    Object.keys(routineQuestions).forEach(q => {
      if (routineQuestions[q].includes(this.responses[q])) {
        this.scores.routine += 2;
      } else if (this.responses[q] && !['Adapts easily', 'Adapts with support', 'Never', 'Rare', 'Varied interests'].includes(this.responses[q])) {
        this.scores.routine += 1;
      }
    });
    return this.scores.routine;
  }

  analyzeCommunication() {
    const commQuestions = {
      'verbal': ['Non-verbal', 'Limited words'],
      'emotions': ['Very difficult', 'Difficult'],
      'literal': ['Takes everything literally', 'Usually literal']
    };

    Object.keys(commQuestions).forEach(q => {
      if (commQuestions[q].includes(this.responses[q])) {
        this.scores.communication += 2;
      } else if (this.responses[q] && !['Advanced vocabulary', 'Full sentences', 'Very good', 'Good', 'Fully understands'].includes(this.responses[q])) {
        this.scores.communication += 1;
      }
    });
    return this.scores.communication;
  }

  identifyStrengths() {
    const strengths = [];
    if (this.responses.interests === 'All-consuming' || this.responses.interests === 'Very intense') {
      strengths.push('Deep focus and expertise in areas of interest');
    }
    if (this.responses.routine_change === 'Adapts easily' || this.responses.repetitive === 'Never') {
      strengths.push('Flexibility and adaptability');
    }
    if (this.responses.verbal === 'Advanced vocabulary' || this.responses.verbal === 'Full sentences') {
      strengths.push('Strong verbal communication abilities');
    }
    if (this.responses.nonverbal === 'Very good' || this.responses.nonverbal === 'Good') {
      strengths.push('Good understanding of social cues');
    }
    if (this.responses.emotions === 'Very good' || this.responses.emotions === 'Good') {
      strengths.push('Emotional awareness and expression');
    }
    return strengths;
  }

  analyze() {
    this.analyzeSensory();
    this.analyzeSocial();
    this.analyzeRoutine();
    this.analyzeCommunication();

    return {
      scores: this.scores,
      strengths: this.identifyStrengths(),
      needsLevel: this.calculateNeedsLevel(),
      ageGroup: this.responses.age,
      role: this.responses.role
    };
  }

  calculateNeedsLevel() {
    const total = this.scores.sensory + this.scores.social + this.scores.routine + this.scores.communication;
    if (total >= 20) return 'High';
    if (total >= 12) return 'Moderate';
    if (total >= 6) return 'Mild';
    return 'Low';
  }
}

// Complete Recommendation Generator
class RecommendationGenerator {
  constructor(analysis, responses) {
    this.analysis = analysis;
    this.responses = responses;
  }

  generateSensoryRecommendations() {
    if (this.analysis.scores.sensory < 3) return null;

    const recommendations = {
      category: "Sensory Support Strategies",
      priority: this.analysis.scores.sensory >= 5 ? "High Priority" : "Moderate Priority",
      items: []
    };

    if (['Very distressed', 'Distressed'].includes(this.responses.noise)) {
      recommendations.items.push({
        title: "Sound Management",
        suggestions: [
          "Provide noise-canceling headphones or earplugs for loud environments",
          "Create a quiet, calm retreat space at home with soft furnishings",
          "Give advance warning before loud activities (vacuum, blender, etc.)",
          "Use white noise machines or calming music for sleep",
          "Consider sound-dampening materials in frequently used rooms"
        ]
      });
    }

    if (['Very sensitive', 'Sensitive'].includes(this.responses.lights)) {
      recommendations.items.push({
        title: "Visual Environment",
        suggestions: [
          "Install dimmer switches or use lamps with adjustable brightness",
          "Provide sunglasses for outdoor activities and bright indoor spaces",
          "Avoid fluorescent lighting when possible - use warm LED bulbs",
          "Use blackout curtains for sleep environment",
          "Reduce screen brightness on devices"
        ]
      });
    }

    if (['Very selective', 'Selective'].includes(this.responses.textures)) {
      recommendations.items.push({
        title: "Food & Nutrition Support",
        suggestions: [
          "Introduce new foods gradually alongside preferred items",
          "Respect texture preferences without forcing foods",
          "Offer foods in preferred temperatures (warm vs cold)",
          "Try food chaining technique: gradually modify accepted foods",
          "Consult occupational therapist for feeding therapy if needed",
          "Consider vitamin supplements if diet is very limited (after consulting doctor)"
        ]
      });
    }

    if (['Cannot tolerate', 'Very bothered'].includes(this.responses.clothing)) {
      recommendations.items.push({
        title: "Clothing Comfort",
        suggestions: [
          "Remove all clothing tags before wearing",
          "Choose seamless or flat-seam clothing options",
          "Use soft, breathable fabrics (100% cotton, bamboo, modal)",
          "Allow choice in clothing selection whenever possible",
          "Wash new clothes 2-3 times before wearing to soften",
          "Consider compression clothing if seeking pressure input"
        ]
      });
    }

    return recommendations.items.length > 0 ? recommendations : null;
  }

  generateSocialRecommendations() {
    if (this.analysis.scores.social < 3) return null;

    const recommendations = {
      category: "Social Communication Support",
      priority: this.analysis.scores.social >= 5 ? "High Priority" : "Moderate Priority",
      items: []
    };

    if (['Very uncomfortable', 'Uncomfortable'].includes(this.responses.eye_contact)) {
      recommendations.items.push({
        title: "Eye Contact Alternatives",
        suggestions: [
          "Accept looking at nose, mouth, or forehead as valid attention",
          "Don't force eye contact during conversations",
          "Use side-by-side activities for bonding (walking, driving, crafts)",
          "Understand that listening doesn't require eye contact",
          "Focus on the quality of interaction, not eye contact"
        ]
      });
    }

    recommendations.items.push({
      title: "Social Skills Practice",
      suggestions: [
        "Use social stories to teach greetings and common interactions",
        "Practice social scenarios in low-pressure environments",
        "Model appropriate greetings naturally without pressure",
        "Role-play challenging social situations at home",
        "Celebrate small social successes to build confidence",
        "Consider joining social skills groups with similar peers"
      ]
    });

    if (['Very difficult', 'Difficult'].includes(this.responses.nonverbal)) {
      recommendations.items.push({
        title: "Understanding Social Cues",
        suggestions: [
          "Teach emotion recognition using picture cards and emotion charts",
          "Explain facial expressions explicitly with examples",
          "Use concrete examples for abstract social concepts",
          "Practice identifying emotions in TV shows or books together",
          "Use apps or videos designed for emotion learning",
          "Break down complex social situations into clear steps"
        ]
      });
    }

    recommendations.items.push({
      title: "Building Social Confidence",
      suggestions: [
        "Start with one-on-one interactions before introducing groups",
        "Identify and nurture special interests as social connection points",
        "Allow adequate processing time after social situations",
        "Provide scripts for common social scenarios (ordering food, asking for help)",
        "Respect the need for social breaks and quiet time",
        "Find activities where social rules are clear (structured games, sports)"
      ]
    });

    return recommendations;
  }

  generateRoutineRecommendations() {
    if (this.analysis.scores.routine < 3) return null;

    const recommendations = {
      category: "Routine & Structure Support",
      priority: this.analysis.scores.routine >= 5 ? "High Priority" : "Moderate Priority",
      items: []
    };

    if (['Very distressed', 'Distressed'].includes(this.responses.routine_change)) {
      recommendations.items.push({
        title: "Managing Changes & Transitions",
        suggestions: [
          "Provide advance notice of schedule changes using visual calendars",
          "Use countdown timers for transitions (Time Timer apps work well)",
          "Create and maintain visual schedules for daily routines",
          "Give multiple warnings before transitions: '5 minutes', '2 minutes', '1 minute'",
          "Maintain consistent morning and bedtime routines",
          "Prepare for major changes (school start, vacations) weeks in advance"
        ]
      });
    }

    if (['Very frequent', 'Frequent'].includes(this.responses.repetitive)) {
      recommendations.items.push({
        title: "Understanding Repetitive Behaviors",
        suggestions: [
          "Accept harmless repetitive behaviors as self-regulation strategies",
          "Provide appropriate sensory outlets (fidget tools, stress balls, textured items)",
          "Identify triggers that increase repetitive behaviors (stress, overstimulation)",
          "Don't suppress behaviors unless harmful - redirect gently if needed",
          "Use repetitive behaviors as calming strategies before stressful events",
          "Channel repetitive interests into productive activities"
        ]
      });
    }

    if (['All-consuming', 'Very intense'].includes(this.responses.interests)) {
      recommendations.items.push({
        title: "Leveraging Intense Interests",
        suggestions: [
          "Use special interests as powerful learning motivators across subjects",
          "Incorporate interests into reading, writing, and math activities",
          "Connect with others who share the interest (clubs, online communities)",
          "Channel interests into potential career exploration paths",
          "Respect and celebrate the depth of knowledge and passion",
          "Use interests to teach social skills (sharing information, turn-taking)",
          "Create opportunities to present or teach about special interests"
        ]
      });
    }

    return recommendations;
  }

  generateCommunicationRecommendations() {
    if (this.analysis.scores.communication < 3) return null;

    const recommendations = {
      category: "Communication Development",
      priority: this.analysis.scores.communication >= 5 ? "High Priority" : "Moderate Priority",
      items: []
    };

    if (['Non-verbal', 'Limited words'].includes(this.responses.verbal)) {
      recommendations.items.push({
        title: "Alternative & Augmentative Communication (AAC)",
        suggestions: [
          "Explore AAC devices or apps (Proloquo2Go, TouchChat, Avaz)",
          "Implement Picture Exchange Communication System (PECS)",
          "Teach basic functional sign language for immediate needs",
          "Provide visual choice boards for daily activities",
          "Consult with speech-language pathologist for personalized plan",
          "Celebrate and encourage all communication attempts",
          "Use visual supports like NOW/NEXT boards"
        ]
      });
    }

    if (['Very difficult', 'Difficult'].includes(this.responses.emotions)) {
      recommendations.items.push({
        title: "Emotional Expression & Regulation",
        suggestions: [
          "Use emotion charts and visual scales (thermometer, zones of regulation)",
          "Teach feelings vocabulary explicitly with real-life examples",
          "Practice identifying emotions in stories, videos, and real situations",
          "Create a feelings journal using drawings or pictures",
          "Use regular 'emotion check-ins' at set times daily",
          "Model expressing your own emotions clearly and appropriately",
          "Teach coping strategies for different emotional states"
        ]
      });
    }

    if (['Takes everything literally', 'Usually literal'].includes(this.responses.literal)) {
      recommendations.items.push({
        title: "Understanding Figurative Language",
        suggestions: [
          "Avoid idioms, sarcasm, and figures of speech initially",
          "Explain metaphors and idioms when they come up naturally",
          "Use concrete, literal language for instructions and requests",
          "Teach common idioms explicitly with visual representations",
          "Be patient with questions about meaning - they're learning!",
          "Use humor that's more straightforward (slapstick vs sarcasm)",
          "Create an 'idiom dictionary' for commonly used phrases"
        ]
      });
    }

    return recommendations;
  }

  generateDevelopmentalActivities() {
    const activities = {
      category: "Interest-Based Skill Development",
      priority: "Ongoing Development",
      items: []
    };

    const ageGroup = this.responses.age;

    if (ageGroup === '2-4 years' || ageGroup === '5-7 years') {
      activities.items.push({
        title: "Early Learning Activities",
        suggestions: [
          "Sensory play: water tables, sand, playdough, slime",
          "Simple puzzles and matching games to build cognitive skills",
          "Music and movement activities (dancing, instruments)",
          "Art exploration: finger painting, coloring, cutting, pasting",
          "Building blocks and construction toys (Duplo, Mega Bloks)",
          "Story time with visual books and interactive elements"
        ]
      });
    } else if (ageGroup === '8-12 years') {
      activities.items.push({
        title: "Middle Childhood Activities",
        suggestions: [
          "STEM projects: science experiments, engineering challenges",
          "Art classes: drawing, painting, sculpture, digital art",
          "Music lessons on an instrument of interest",
          "Coding and robotics activities (Scratch, Lego Mindstorms)",
          "Strategy board games and logic puzzles",
          "Nature exploration: hiking, bird watching, collecting hobbies",
          "Sports with clear rules and individual focus"
        ]
      });
    } else {
      activities.items.push({
        title: "Teen & Adult Development",
        suggestions: [
          "Advanced hobby development and mastery",
          "Volunteer work in areas of interest to build skills",
          "Online courses in special interest areas",
          "Creative outlets: writing, digital art, music production, video editing",
          "Job skills training and internship programs",
          "Peer groups focused on shared interests",
          "Life skills practice: cooking, budgeting, time management"
        ]
      });
    }

    activities.items.push({
      title: "Physical Activities & Exercise",
      suggestions: [
        "Swimming - excellent full-body sensory activity",
        "Walking or hiking in nature",
        "Yoga or gentle stretching routines",
        "Martial arts - structured, predictable, confidence-building",
        "Individual sports with less social pressure (track, cycling)",
        "Dance or movement therapy",
        "Trampoline or bouncing activities for sensory input"
      ]
    });

    return activities;
  }

  generateLifestyleRecommendations() {
    return {
      category: "Daily Living & Wellness",
      priority: "Foundation",
      items: [
        {
          title: "Sleep & Rest",
          suggestions: [
            "Maintain consistent bedtime routine (same time, same order)",
            "Create calm, dark sleeping environment (blackout curtains, minimal decoration)",
            "Limit screens and stimulating activities 1 hour before bed",
            "Use weighted blankets if deep pressure is calming",
            "Consider melatonin supplementation (consult doctor first)",
            "Keep bedroom temperature cool (68-72°F ideal)"
          ]
        },
        {
          title: "Nutrition Awareness",
          suggestions: [
            "Be aware of potential food sensitivities (gluten, dairy, artificial colors)",
            "Maintain regular meal times to support predictability",
            "Ensure adequate hydration throughout the day",
            "Consider vitamin supplementation: B6, magnesium, omega-3 (doctor-approved)",
            "Don't force foods but gently encourage variety",
            "Involve in meal planning and preparation when possible"
          ]
        },
        {
          title: "Family & Caregiver Support",
          suggestions: [
            "Join parent support groups (online or local chapters)",
            "Practice self-care as caregiver - you can't pour from empty cup",
            "Educate siblings and extended family about needs and strengths",
            "Celebrate neurodiversity and unique abilities",
            "Connect with autism advocacy organizations (Autism Society, ASAN)",
            "Build a support team: doctors, therapists, educators, friends",
            "Don't be afraid to ask for help when needed"
          ]
        }
      ]
    };
  }

  generate() {
    const recommendations = [];

    const sensory = this.generateSensoryRecommendations();
    if (sensory) recommendations.push(sensory);

    const social = this.generateSocialRecommendations();
    if (social) recommendations.push(social);

    const routine = this.generateRoutineRecommendations();
    if (routine) recommendations.push(routine);

    const communication = this.generateCommunicationRecommendations();
    if (communication) recommendations.push(communication);

    recommendations.push(this.generateDevelopmentalActivities());
    recommendations.push(this.generateLifestyleRecommendations());

    return recommendations;
  }
}

function generateAccessToken() {
  return crypto.randomBytes(16).toString('hex');
}

// API Endpoints
// ===============================
// CORE ASSESSMENT SYSTEM (STABLE)
// ===============================

app.post('/api/analyze', async (req, res) => {
  try {
    const { responses, userName, userEmail } = req.body;

    if (!responses || Object.keys(responses).length === 0) {
      return res.status(400).json({ error: 'No responses provided' });
    }

    const analyzer = new SupportAnalyzer(responses);
    const analysis = analyzer.analyze();

    const generator = new RecommendationGenerator(analysis, responses);
    const recommendations = generator.generate();

    const accessToken = generateAccessToken();

    const assessmentData = {
      userName: userName || 'Anonymous',
      userEmail: userEmail || null,
      responses,
      analysis,
      recommendations,
      assessmentDate: new Date(),
      accessToken
    };

    if (useDatabase) {
      try {
        const assessment = new Assessment(assessmentData);
        await assessment.save();
        console.log('✅ Assessment saved to MongoDB');
      } catch (dbError) {
        console.error('MongoDB save error:', dbError.message);
        assessmentsMemory.push(assessmentData);
        console.log('✅ Assessment saved to memory (MongoDB unavailable)');
      }
    } else {
      assessmentsMemory.push(assessmentData);
      console.log('✅ Assessment saved to memory');
    }

    res.json({
      success: true,
      analysis,
      recommendations,
      strengths: analysis.strengths,
      accessToken,
      message: 'Assessment completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

app.get('/api/assessment/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    let assessment;
    if (useDatabase) {
      assessment = await Assessment.findOne({ accessToken: token });
    } else {
      assessment = assessmentsMemory.find(a => a.accessToken === token);
    }

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({
      success: true,
      assessment
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

app.get('/api/assessments', async (req, res) => {
  try {
    let assessments;
    if (useDatabase) {
      assessments = await Assessment.find().sort({ assessmentDate: -1 }).limit(50);
    } else {
      assessments = assessmentsMemory.slice(-50).reverse();
    }

    res.json({
      success: true,
      count: assessments.length,
      assessments
    });

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Autism Support System API is running',
    database: useDatabase ? 'MongoDB Connected' : 'In-Memory Storage',
    timestamp: new Date().toISOString()
  });
});
const path = require('path');

// Serve React frontend
app.use(express.static(path.join(__dirname, 'public')));

// React routing fallback (IMPORTANT: after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.listen(PORT, async () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Analysis endpoint: http://localhost:${PORT}/api/analyze`);
  
  // Wait for MongoDB connection to settle
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (useDatabase) {
    console.log(`💾 Database: MongoDB Connected ✅`);
    console.log(`📦 Database Name: autism-support`);
  } else {
    console.log(`💾 Database: In-Memory Storage (Temporary)`);
    console.log(`   Start MongoDB service: net start MongoDB`);
  }
});