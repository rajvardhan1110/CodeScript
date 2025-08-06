import mongoose, { Schema, Document } from "mongoose";

// Define a separate interface for each test case
export interface ITestCase {
  _id: mongoose.Types.ObjectId;
  input: string;
  output: string;
}

// Define the main problem interface
export interface IProblem extends Document {
  title: string;
  testId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  markdownUrl: string;
  AdminCode: string;
  language: number;
  createdAt: Date;
  sampleTestCases: ITestCase[];
  hiddenTestCases: ITestCase[];
  cpu_time_limit: number;
  memory_limit: number;
}

// Define a schema for test cases with unique _id
const TestCaseSchema = new Schema<ITestCase>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    input: { type: String, required: true },
    output: { type: String, required: true },
  },
  { _id: false } // disable automatic _id wrapping to allow explicit _id
);

// Define the main schema
const ProblemSchema = new Schema<IProblem>({
  title: { type: String, required: true },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Test", // optionally reference the test model
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  markdownUrl: { type: String, default: "" },
  AdminCode: { type: String, default: "" },
  language: { type: Number, default: 54 },
  createdAt: { type: Date, default: Date.now },

  sampleTestCases: {
    type: [TestCaseSchema],
    default: [],
  },

  hiddenTestCases: {
    type: [TestCaseSchema],
    default: [],
  },

  cpu_time_limit: { type: Number, default: 2 },
  memory_limit: { type: Number, default: 128000 },
});

export const ProblemModel = mongoose.model<IProblem>(
  "Problem",
  ProblemSchema
);
