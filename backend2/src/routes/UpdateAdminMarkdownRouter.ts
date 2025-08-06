import express, { Request, Response } from "express";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";
import { ProblemModel } from "../models/ProblemModel";
import { uploadStringToS3 } from "../utils/s3Utils";
import mongoose from "mongoose";

const UpdateAdminMarkdownRouter = express.Router();

interface CustomRequest extends Request {
  examTakerId?: string;
}

export const UpdateAdminMarkdownHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { testId, problemId, markdownContent } = req.body;

    // Input validation
    if (
      !testId ||
      !problemId ||
      !markdownContent ||
      typeof testId !== "string" ||
      typeof problemId !== "string" ||
      typeof markdownContent !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input fields" });
    }

    // Check valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "Invalid testId" });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ message: "Invalid problemId" });
    }

    // Convert to ObjectId
    const testIdObj = new mongoose.Types.ObjectId(testId);
    const problemIdObj = new mongoose.Types.ObjectId(problemId);

    // Find problem by _id and testId
    const problem = await ProblemModel.findOne({ _id: problemIdObj, testId: testIdObj });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Extract S3 key from existing URL
    const existingUrl = problem.markdownUrl;
    const urlParts = existingUrl.split(".com/");
    const s3Key = urlParts[1]; // everything after .com/

    // Overwrite existing markdown at same S3 key
    await uploadStringToS3(markdownContent, s3Key);

    return res.status(200).json({
      message: "Markdown updated successfully",
      markdownUrl: existingUrl,
    });
  } catch (error: any) {
    console.error("Error in UpdateAdminMarkdownHandler:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

UpdateAdminMarkdownRouter.post("/", AdminAuthMiddleware, UpdateAdminMarkdownHandler);

export default UpdateAdminMarkdownRouter;
