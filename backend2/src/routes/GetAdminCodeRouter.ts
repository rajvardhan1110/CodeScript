import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { ProblemModel } from "../models/ProblemModel";
import { getS3DataFromUrl } from "../utils/s3GetCode";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";

const GetAdminCodeRouter = express.Router();

interface CustomRequest extends Request {
  examTakerId?: string;
}

export const GetAdminCodeHandler = async (req: CustomRequest, res: Response) => {
  const { problemId } = req.body;

  console.log("📥 Incoming request to /getAdminCode");
  console.log("🧾 Request body:", req.body);

  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    console.warn("⚠️ Invalid problem ID received:", problemId);
    return res.status(400).json({ msg: "Invalid problem ID" });
  }

  try {
    console.log("🔍 Fetching problem by ID...");
    const problem = await ProblemModel.findById(problemId)
      .select("AdminCode sampleTestCases hiddenTestCases language")
      .lean();

    if (!problem || !problem.AdminCode) {
      console.warn("❌ Problem not found or AdminCode is missing for ID:", problemId);
      return res.status(404).json({ msg: "Problem not found or AdminCode not set" });
    }

    console.log("📦 Problem found. Fetching AdminCode from S3...");
    const codeContent = await getS3DataFromUrl(problem.AdminCode);

    console.log("✅ Successfully fetched AdminCode from S3.");

    const sampleTestCaseIds = problem.sampleTestCases.map((test) => test._id);
    const hiddenTestCaseIds = problem.hiddenTestCases.map((test) => test._id);

    console.log("🧪 Sample Test Case IDs:", sampleTestCaseIds);
    console.log("🔒 Hidden Test Case IDs:", hiddenTestCaseIds);

    return res.status(200).json({
      msg: "Fetched admin code and test case IDs successfully",
      language_id: problem.language,
      content: codeContent,
      sampleTestCaseIds,
      hiddenTestCaseIds,
    });
  } catch (error: any) {
    console.error("❗ Error in GetAdminCodeHandler:", error);
    return res.status(500).json({
      msg: "Failed to fetch admin code or test cases",
      error: error.message,
    });
  }
};

GetAdminCodeRouter.post("/", AdminAuthMiddleware, GetAdminCodeHandler);

export default GetAdminCodeRouter;
