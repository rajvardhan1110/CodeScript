import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { ProblemModel } from "../models/ProblemModel";
import { getS3DataFromUrl } from "../utils/s3GetCode";
import { UserAuthMiddleware } from "../Middleware/UserAuthMiddleware";

const GetSampleTestCaseRouter = express.Router();

interface CustomRequest extends Request {
  userId?: string;
}

export const GetSampleTestCase = async (req: CustomRequest, res: Response) => {
  try {
    const { problemId } = req.body;

    // ✅ Validate ObjectId
    if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ message: "Missing or invalid problemId" });
    }

    const problemObjectId = new mongoose.Types.ObjectId(problemId);

    // Find the problem
    const problem = await ProblemModel.findById(problemObjectId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const { sampleTestCases, testId, _id: probId } = problem;

    const results = await Promise.all(
      sampleTestCases.map(async (testCase) => {
        const inputKey = `${testId}/${probId}/input/${testCase._id}`;
        const outputKey = `${testId}/${probId}/output/${testCase._id}`;

        const inputUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${inputKey}`;
        const outputUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${outputKey}`;

        const [input, output] = await Promise.all([
          getS3DataFromUrl(inputUrl),
          getS3DataFromUrl(outputUrl),
        ]);

        return {
          _id: testCase._id,
          input,
          output,
        };
      })
    );

    return res.status(200).json({ sampleTestCases: results });
  } catch (error: any) {
    console.error("❌ Error in GetSampleTestCase:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

GetSampleTestCaseRouter.post("/", UserAuthMiddleware, GetSampleTestCase);

export default GetSampleTestCaseRouter;
