import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { TestCodeModel } from "../models/TestCodeModel";
import { ProblemModel } from "../models/ProblemModel";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";

const AdminCheckTestCodeExistsRouter = express.Router();

interface CustomRequest extends Request {
  userId?: string;
}

export const AdminCheckTestCodeExistsHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { testId } = req.body;

    // Validate testId as ObjectId
    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: "Missing or invalid testId" });
    }

    const objectId = new mongoose.Types.ObjectId(testId);
    const existing = await TestCodeModel.findOne({ testId: objectId });

    if (existing) {
      // Fetch all problems whose _id is in the existing.problems array
      const problems = await ProblemModel.find({
        _id: { $in: existing.problems || [] }
      });

      const totalQuestions = problems.length;
      const totalMarks = problems.reduce(
        (sum, problem) => sum + (problem.mark ?? 0),
        0
      );

      return res.status(200).json({
        exists: true,
        message: "TestCode with this testId already exists.",
        data: existing,
        totalQuestions,
        totalMarks
      });
    } else {
      return res.status(200).json({
        exists: false,
        message: "No TestCode found for this testId.",
      });
    }
  } catch (error: any) {
    console.error("❌ Error in CheckTestCodeExistsHandler:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

AdminCheckTestCodeExistsRouter.post("/", AdminAuthMiddleware, AdminCheckTestCodeExistsHandler);

export default AdminCheckTestCodeExistsRouter;
