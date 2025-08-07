import express, { Request, Response } from "express";
import { ProblemModel } from "../models/ProblemModel";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";

const ProblemLimitsRouter = express.Router();

ProblemLimitsRouter.post("/", AdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { problemId, cpu_time_limit, memory_limit, mark } = req.body;

    if (!problemId || cpu_time_limit === undefined || memory_limit === undefined || mark === undefined) {
      return res.status(400).json({ msg: "problemId, cpu_time_limit, memory_limit, and mark are required" });
    }

    const updated = await ProblemModel.findByIdAndUpdate(
      problemId,
      {
        cpu_time_limit,
        memory_limit,
        mark,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Problem not found" });
    }

    res.status(200).json({
      msg: "Limits updated successfully",
      cpu_time_limit: updated.cpu_time_limit,
      memory_limit: updated.memory_limit,
      mark: updated.mark,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
});

export default ProblemLimitsRouter;
