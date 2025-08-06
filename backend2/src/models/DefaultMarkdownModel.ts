import mongoose, { Schema, Document } from "mongoose";

export interface IDefaultMarkdown extends Document {
  markdownS3Url: string;
  createdAt: Date;
}

const DefaultMarkdownSchema = new Schema<IDefaultMarkdown>({
  markdownS3Url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const DefaultMarkdownModel = mongoose.model<IDefaultMarkdown>(
  "DefaultMarkdown",
  DefaultMarkdownSchema
);
