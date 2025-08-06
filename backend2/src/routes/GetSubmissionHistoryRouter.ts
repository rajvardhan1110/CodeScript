import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { UserAuthMiddleware } from "../Middleware/UserAuthMiddleware";
import { SubmissionHistoryModel } from "../models/SubmissionHistoryModel";
import { getS3DataFromUrl } from "../utils/s3GetCode";

const GetSubmissionHistoryRouter = express.Router();

interface CustomRequest extends Request {
  userId?: string;
}

// ✅ Handler: Get all submissions for a problem/test (fetch verdict from S3)
export const GetSubmissionListHandler = async (req: CustomRequest, res: Response) => {
  const { testId, problemId } = req.body;
  const userId = req.userId;

  if (
    !testId || !mongoose.Types.ObjectId.isValid(testId) ||
    !problemId || !mongoose.Types.ObjectId.isValid(problemId)
  ) {
    return res.status(400).json({ msg: "Invalid or missing testId/problemId" });
  }

  try {
    const record = await SubmissionHistoryModel.findOne({ userId });
    if (!record) return res.status(200).json([]);

    const filtered = await Promise.all(
      record.submissions
        .filter((sub) =>
          sub.testId && sub.problemId &&
          sub.testId.toString() === testId &&
          sub.problemId.toString() === problemId
        )
        .map(async (sub) => {
          try {
            const s3Data = await getS3DataFromUrl(sub.s3Url);
            const { result } = JSON.parse(s3Data);
            return {
              _id: sub._id,
              verdict: result?.verdict || "Unknown",
              timestamp: sub.submittedAt,
            };
          } catch (err) {
            return {
              _id: sub._id,
              verdict: "Error fetching result",
              timestamp: sub.submittedAt,
            };
          }
        })
    );

    return res.status(200).json(filtered);
  } catch (error: any) {
    console.error("❌ Error in GetSubmissionListHandler:", error);
    return res.status(500).json({ msg: "Failed to fetch submission list", error: error.message });
  }
};

// ✅ Handler: Get a specific submission with code and result (verdict from S3)
export const GetSingleSubmissionHandler = async (req: CustomRequest, res: Response) => {
  const { testId, problemId, submissionId } = req.body;
  const userId = req.userId;

  if (
    !testId || !mongoose.Types.ObjectId.isValid(testId) ||
    !problemId || !mongoose.Types.ObjectId.isValid(problemId) ||
    !submissionId || !mongoose.Types.ObjectId.isValid(submissionId)
  ) {
    return res.status(400).json({ msg: "Invalid or missing testId/problemId/submissionId" });
  }

  try {
    const record = await SubmissionHistoryModel.findOne({ userId });
    if (!record) return res.status(404).json({ msg: "Submission not found" });

    const submission = record.submissions.find(
      (sub) =>
        sub._id.toString() === submissionId &&
        sub.testId?.toString() === testId &&
        sub.problemId?.toString() === problemId
    );

    if (!submission) return res.status(404).json({ msg: "Submission not found" });

    const s3Data = await getS3DataFromUrl(submission.s3Url);
    const { code, result } = JSON.parse(s3Data);

    return res.status(200).json({
      _id: submission._id,
      verdict: result?.verdict || "Unknown",
      timestamp: submission.submittedAt,
      code,
      result,
    });
  } catch (error: any) {
    console.error("❌ Error in GetSingleSubmissionHandler:", error);
    return res.status(500).json({ msg: "Failed to fetch submission", error: error.message });
  }
};

GetSubmissionHistoryRouter.post("/list", UserAuthMiddleware, GetSubmissionListHandler);
GetSubmissionHistoryRouter.post("/one", UserAuthMiddleware, GetSingleSubmissionHandler);

export default GetSubmissionHistoryRouter;
