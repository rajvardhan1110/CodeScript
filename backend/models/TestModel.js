const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const TestModel = new Schema({
  examTakerId: {
    type: ObjectId,

    ref: 'User'
  },
  title: {
    type: String,
  },
  description: String,
  questions: [{
    type: ObjectId,
    ref: 'Question'
  }],
  students: [{
    type: ObjectId,
    ref: 'Student'
  }],
  totalMarks: {
    type: Number,
  },
  testTime: Date, // test start time (can be null initially)
  totalTime: Number, // in minutes
  phase: {
    type: String,
    enum: ['upcoming', 'running', 'completed'],
    default: 'upcoming'
  },
  examTakerPhase: {
    type: String,
    enum: ['draft', 'finalized'],
    default: 'draft'
  },
   publishResult: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', TestModel);
