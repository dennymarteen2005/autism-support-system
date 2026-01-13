const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  // User Information
  userName: {
    type: String,
    default: 'Anonymous'
  },
  userEmail: {
    type: String,
    default: null
  },
  
  // Questionnaire Responses
  responses: {
    type: Object,
    required: true
  },
  
  // Analysis Results
  analysis: {
    scores: {
      sensory: Number,
      social: Number,
      routine: Number,
      communication: Number
    },
    needsLevel: {
      type: String,
      enum: ['Low', 'Mild', 'Moderate', 'High']
    },
    ageGroup: String,
    role: String,
    strengths: [String]
  },
  
  // Recommendations
  recommendations: {
    type: Array,
    default: []
  },
  
  // Metadata
  assessmentDate: {
    type: Date,
    default: Date.now
  },
  
  // Unique identifier for anonymous access
  accessToken: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Index for faster queries
AssessmentSchema.index({ accessToken: 1 });
AssessmentSchema.index({ userEmail: 1 });
AssessmentSchema.index({ assessmentDate: -1 });

module.exports = mongoose.model('Assessment', AssessmentSchema);