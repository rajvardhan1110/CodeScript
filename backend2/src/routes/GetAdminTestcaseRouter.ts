import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { ProblemModel } from "../models/ProblemModel";
import { getS3DataFromUrl } from "../utils/s3GetCode";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";

const GetAdminTestcaseRouter = express.Router();

interface CustomRequest extends Request {
  examTakerId?: string;
}

export const GetAdminTestcaseHandler = async (req: CustomRequest, res: Response) => {
  const { problemId, testCaseId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(problemId) || !mongoose.Types.ObjectId.isValid(testCaseId)) {
    return res.status(400).json({ msg: "Invalid problemId or testCaseId" });
  }

  try {
    const problem = await ProblemModel.findById(problemId)
      .select("sampleTestCases hiddenTestCases")
      .lean();

    if (!problem) {
      return res.status(404).json({ msg: "Problem not found" });
    }

    const allTestCases = [...problem.sampleTestCases, ...problem.hiddenTestCases];

    const testCase = allTestCases.find(
      (tc: any) => tc._id.toString() === testCaseId
    );

    if (!testCase) {
      return res.status(404).json({ msg: "Test case not found in sample or hidden" });
    }

    const input = await getS3DataFromUrl(testCase.input);
    const output = await getS3DataFromUrl(testCase.output);

    return res.status(200).json({
      msg: "Fetched test case input and output successfully",
      input,
      output,
    });
  } catch (error: any) {
    console.error("Error in GetAdminTestcaseHandler:", error);
    return res.status(500).json({
      msg: "Failed to fetch test case content",
      error: error.message,
    });
  }
};

GetAdminTestcaseRouter.post(
  "/",
  AdminAuthMiddleware,
  GetAdminTestcaseHandler
);

export default GetAdminTestcaseRouter;
