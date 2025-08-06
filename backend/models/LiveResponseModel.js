const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const LiveResponseModel = new Schema({
  testId: {
    type: ObjectId,
    ref: 'Test'
  },
  userId: {
    type: ObjectId,
    ref: 'User'
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  response: [
    {
      questionId: {
        type: ObjectId,
        ref: 'Question'
      },
      optionId: {
        type: ObjectId,
        ref: 'Option'
      },
      correctAnswer: {
        type: ObjectId,
        ref: 'Option'
      },
      status: {
        type: String,
        enum: ['correct', 'wrong']
      },
      marks: {
        type: Number
      }
    }
  ]
});

module.exports = mongoose.model('LiveResponse', LiveResponseModel);
