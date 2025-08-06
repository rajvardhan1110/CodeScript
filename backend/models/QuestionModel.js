const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;


const optionSchema = new Schema({
  _id: {
    type: ObjectId,
    default: () => new ObjectId()
  },
  text: {
    type: String,
    required: true
  }
}, { _id: false }); 


const QuestionModel = new Schema({
  examTakerId: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  testId: {
    type: ObjectId,
    required: true,
    ref: 'Test'
  },
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [optionSchema],
    required: true
  },
  correctAnswer: {
    type: ObjectId,
    required: true,
    validate: {
      validator: function (val) {
        return this.options.some(opt => opt._id.equals(val));
      },
      message: 'Correct answer ID must be from options'
    }
  },
  marks: {
    type: Number,
    required: true,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', QuestionModel);
