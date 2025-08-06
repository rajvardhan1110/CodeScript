import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { ProblemModel } from "../models/ProblemModel";
import { getS3DataFromUrl } from "../utils/s3GetCode";
import { UserAuthMiddleware } from "../Middleware/UserAuthMiddleware";

const GetUserMarkdownRouter = express.Router();

interface CustomRequest extends Request {
  userId?: string;
}

export const GetUserMarkdownHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { testId, problemId } = req.body;
    const userId = req.userId;

    // console.log("📥 Incoming request to /userMarkdown");
    // console.log("🧑 User ID:", userId);
    // console.log("🧪 Test ID:", testId);
    // console.log("❓ Problem ID:", problemId);

    // ✅ Validate presence and type
    if (!testId || !problemId) {
      // console.warn("⚠️ Missing testId or problemId in request");
      return res.status(400).json({ message: "Missing testId or problemId" });
    }

    // ✅ Ensure both are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      // console.warn("⚠️ Invalid testId format:", testId);
      return res.status(400).json({ message: "Invalid testId format" });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      // console.warn("⚠️ Invalid problemId format:", problemId);
      return res.status(400).json({ message: "Invalid problemId format" });
    }

    // ✅ Fetch the problem from DB
    // console.log("🔍 Searching for problem in DB...");
    const problem = await ProblemModel.findOne({
      _id: problemId,
      testId: new mongoose.Types.ObjectId(testId),
    });

    if (!problem) {
      // console.warn("❌ Problem not found for given testId and problemId");
      return res.status(404).json({ message: "Problem not found" });
    }

    console.log("✅ Problem found:", problem.title);

    // ✅ Fetch markdown content from S3
    // console.log("📡 Fetching markdown content from S3...");
    const markdownContent = await getS3DataFromUrl(problem.markdownUrl);

    console.log("✅ Successfully fetched markdown from S3");


    return res.status(200).json({
      title: problem.title,
      markdownContent,
    });
  } catch (error: any) {
    console.error("❌ Error in GetUserMarkdownHandler:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

GetUserMarkdownRouter.post("/", UserAuthMiddleware, GetUserMarkdownHandler);

export default GetUserMarkdownRouter;
