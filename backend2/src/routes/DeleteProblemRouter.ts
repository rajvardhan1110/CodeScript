import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { ProblemModel } from "../models/ProblemModel";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";
import { deleteFromS3Url } from "../utils/deleteFromS3";

const DeleteProblemRouter = express.Router();

interface CustomRequest extends Request {
  examTakerId?: string;
}

DeleteProblemRouter.post(
  "/",
  AdminAuthMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const { problemId } = req.body;

      console.log(`[DELETE] Received delete request for problemId: ${problemId}`);

      if (!mongoose.Types.ObjectId.isValid(problemId)) {
        console.warn(`[DELETE] Invalid problemId format: ${problemId}`);
        return res.status(400).json({ msg: "Invalid Problem ID" });
      }

      const problem = await ProblemModel.findById(problemId);
      if (!problem) {
        console.warn(`[DELETE] Problem not found: ${problemId}`);
        return res.status(404).json({ msg: "Problem not found" });
      }

      console.log(`[DELETE] Found problem: ${problemId}. Proceeding to delete associated S3 files...`);

      const deletionPromises: Promise<void>[] = [];

      if (problem.markdownUrl?.startsWith("https://")) {
        console.log(`[DELETE] Deleting markdownUrl from S3: ${problem.markdownUrl}`);
        deletionPromises.push(deleteFromS3Url(problem.markdownUrl));
      }

      if (problem.AdminCode?.startsWith("https://")) {
        console.log(`[DELETE] Deleting AdminCode from S3: ${problem.AdminCode}`);
        deletionPromises.push(deleteFromS3Url(problem.AdminCode));
      }

      for (const testCase of [...problem.sampleTestCases, ...problem.hiddenTestCases]) {
        if (testCase.input?.startsWith("https://")) {
          console.log(`[DELETE] Deleting testCase input from S3: ${testCase.input}`);
          deletionPromises.push(deleteFromS3Url(testCase.input));
        }
        if (testCase.output?.startsWith("https://")) {
          console.log(`[DELETE] Deleting testCase output from S3: ${testCase.output}`);
          deletionPromises.push(deleteFromS3Url(testCase.output));
        }
      }

      const results = await Promise.allSettled(deletionPromises);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`[DELETE] S3 deletion failed for item #${index + 1}:`, result.reason);
        } else {
          console.log(`[DELETE] S3 deletion successful for item #${index + 1}`);
        }
      });

      await ProblemModel.findByIdAndDelete(problemId);
      console.log(`[DELETE] Problem document deleted from MongoDB: ${problemId}`);

      return res.status(200).json({ msg: "Problem and all related S3 data deleted successfully" });
    } catch (error) {
      console.error("[DELETE] Internal server error during problem deletion:", error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  }
);

export default DeleteProblemRouter;
