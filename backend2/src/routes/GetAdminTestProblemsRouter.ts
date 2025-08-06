import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { TestCodeModel } from "../models/TestCodeModel";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";

const GetAdminTestProblemsRouter = express.Router();

interface CustomRequest extends Request {
  examTakerId?: string;
}

export const GetAdminTestProblemsHandler = async (req: CustomRequest, res: Response) => {
  const { testId } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ msg: "Invalid or missing testId" });
  }

  try {
    const testObjectId = new mongoose.Types.ObjectId(testId);

    const test = await TestCodeModel.findOne({ testId: testObjectId }).populate({
      path: "problems",
      select: "_id title",
    });

    if (!test) {
      return res.status(404).json({ msg: "Test not found" });
    }

    const problems = test.problems.map((problem: any) => ({
      _id: problem._id,
      title: problem.title,
    }));

    return res.status(200).json({
      msg: "Fetched test problems successfully",
      problems,
    });
  } catch (error: any) {
    console.error("Error in GetTestProblemsHandler:", error);
    return res.status(500).json({
      msg: "Failed to fetch test problems",
      error: error.message,
    });
  }
};

GetAdminTestProblemsRouter.post("/", AdminAuthMiddleware, GetAdminTestProblemsHandler);

export default GetAdminTestProblemsRouter;
