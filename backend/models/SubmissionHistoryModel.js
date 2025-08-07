const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  s3Url: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  verdict: {
    type: String,
    required: true,
  },
  marks: {
    type: Number,
    required: false,
  },
});

const SubmissionHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
    unique: true,
  },
  submissions: [submissionSchema],
});

const SubmissionHistoryModel = mongoose.model(
  "SubmissionHistory",
  SubmissionHistorySchema
);

module.exports = SubmissionHistoryModel;
