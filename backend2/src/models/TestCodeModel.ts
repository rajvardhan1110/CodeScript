import mongoose, { Schema, Document } from "mongoose";

export interface ITestCode extends Document {
  testId: mongoose.Types.ObjectId;
  problems: mongoose.Types.ObjectId[];
}

const TestCodeSchema = new Schema<ITestCode>({
  testId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
});

export const TestCodeModel = mongoose.model<ITestCode>("TestCode", TestCodeSchema);
