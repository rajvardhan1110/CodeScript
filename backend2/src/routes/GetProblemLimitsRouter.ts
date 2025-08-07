import express, { Request, Response } from "express";
import { ProblemModel } from "../models/ProblemModel";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";

const GetProblemLimitsRouter = express.Router();

GetProblemLimitsRouter.post("/", AdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { problemId } = req.body;

    if (!problemId) {
      return res.status(400).json({ msg: "problemId is required" });
    }

    const problem = await ProblemModel.findById(problemId).select("cpu_time_limit memory_limit mark");

    if (!problem) {
      return res.status(404).json({ msg: "Problem not found" });
    }

    res.status(200).json({
      cpu_time_limit: problem.cpu_time_limit,
      memory_limit: problem.memory_limit,
      mark: problem.mark,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
});

export default GetProblemLimitsRouter;
