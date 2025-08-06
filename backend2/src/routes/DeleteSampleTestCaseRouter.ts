import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";
import { ProblemModel } from "../models/ProblemModel";

const DeleteSampleTestCaseRouter = express.Router();

interface CustomRequest extends Request {
  examTakerId?: string;
}

export const DeleteSampleTestCaseHandler = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { testId, problemId, testCaseId } = req.body;

    if (!testId || !problemId || !testCaseId) {
      return res.status(400).json({
        msg: "testId, problemId, and testCaseId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId) || !mongoose.Types.ObjectId.isValid(testCaseId)) {
      return res.status(400).json({ msg: "Invalid ObjectId provided" });
    }

    const problem = await ProblemModel.findById(problemId);
    if (!problem) {
      return res.status(404).json({ msg: "Problem not found" });
    }

    console.log(problem.testId);
    console.log(testId);

    const incomingTestId = new mongoose.Types.ObjectId(testId);

    if (!problem.testId.equals(incomingTestId)) {
      return res.status(403).json({ msg: "Test ID mismatch with problem" });
    }

    // Filter out the test case by ID
    const initialLength = problem.sampleTestCases.length;
    problem.sampleTestCases = problem.sampleTestCases.filter(
      (tc) => !tc._id.equals(new mongoose.Types.ObjectId(testCaseId))
    );

    if (problem.sampleTestCases.length === initialLength) {
      return res.status(404).json({ msg: "Test case not found in problem" });
    }

    await problem.save();

    return res.status(200).json({
      msg: "Sample test case deleted successfully",
      remainingTestCases: problem.sampleTestCases,
    });
  } catch (error: any) {
    console.error("❌ Error in DeleteSampleTestCaseHandler:", error.message || error);
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error.message || "Unknown error",
    });
  }
};

DeleteSampleTestCaseRouter.delete(
  "/",
  AdminAuthMiddleware,
  DeleteSampleTestCaseHandler
);

export default DeleteSampleTestCaseRouter;
