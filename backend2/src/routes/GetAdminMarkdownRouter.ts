import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { ProblemModel } from "../models/ProblemModel";
import { getS3DataFromUrl } from "../utils/s3GetCode";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";

const GetAdminMarkdownRouter = express.Router();

interface CustomRequest extends Request {
  examTakerId?: string;
}

export const GetAdminMarkdownHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { testId, problemId } = req.body;

    // Validate input types
    if (!testId || !problemId || !mongoose.Types.ObjectId.isValid(testId) || !mongoose.Types.ObjectId.isValid(problemId)) {
      return res
        .status(400)
        .json({ message: "Missing or invalid testId or problemId" });
    }

    const testObjectId = new mongoose.Types.ObjectId(testId);
    const problemObjectId = new mongoose.Types.ObjectId(problemId);

    // console.log(testObjectId,problemObjectId);

    // Find the matching problem
    const problem = await ProblemModel.findOne({
      _id: problemObjectId,
      testId: testObjectId,
    });

    if (!problem) {
      console.log("problem not found");
      return res.status(404).json({ message: "Problem not found" });
    }

    // console.log(problem.markdownUrl);

    // Fetch markdown content from S3 using the markdownUrl field
    const markdownContent = await getS3DataFromUrl(problem.markdownUrl);
    // console.log(markdownContent);

    // Respond with title and content
    return res.status(200).json({
      title: problem.title,
      markdownContent,
    });
  } catch (error: any) {
    console.error("❌ Error in GetAdminMarkdownHandler:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

GetAdminMarkdownRouter.post("/", AdminAuthMiddleware, GetAdminMarkdownHandler);

export default GetAdminMarkdownRouter;
