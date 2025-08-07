import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { UserAuthMiddleware } from "../Middleware/UserAuthMiddleware";
import { ProblemModel } from "../models/ProblemModel";
import { SubmissionHistoryModel } from "../models/SubmissionHistoryModel";
import { getS3DataFromUrl } from "../utils/s3GetCode";
import { uploadSubmissionToS3 } from "../utils/uploadSubmissionToS3";
import axios from "axios";
import { Buffer } from "buffer";


const SubmitCodeUserRouter = express.Router();

interface CustomRequest extends Request {
  userId?: string;
}

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
}

const encodeBase64 = (str: string): string =>
  Buffer.from(str, "utf-8").toString("base64");

const decodeBase64 = (str: string | null): string =>
  str ? Buffer.from(str, "base64").toString("utf-8") : "";

export const SubmitCodeUserHandler = async (req: CustomRequest, res: Response) => {
  const submittedAt = new Date();

  try {
    const { code, language_id, problemId, testId } = req.body;

    if (!code || !language_id || !problemId || !testId) {
      return res.status(400).json({ msg: "code, language_id, problemId, and testId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ msg: "Invalid problemId" });
    }

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ msg: "Invalid testId" });
    }

    const problem = await ProblemModel.findById(problemId);
    if (!problem) {
      return res.status(404).json({ msg: "Problem not found" });
    }

    const testIdObjectId = new mongoose.Types.ObjectId(testId);
    const { sampleTestCases, hiddenTestCases, cpu_time_limit, memory_limit } = problem;

    const runTestCase = async (input: string, expectedOutput: string) => {
      const response = await axios.post<Judge0Response>(
        "http://judge.dhanrajj.me:2358/submissions?base64_encoded=true&wait=true",
        {
          source_code: encodeBase64(code),
          stdin: encodeBase64(input),
          expected_output: encodeBase64(expectedOutput),
          language_id,
          cpu_time_limit,
          memory_limit,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = response.data;
      const runtimeErrorIds = [7, 8, 9, 10, 11, 12];
      const timeLimitErrorId = 5;
      const compilationErrorId = 6;

      if (result.status.id === compilationErrorId) {
        return {
          error: true,
          type: "Compilation Error",
          status: result.status.description,
          compile_output: decodeBase64(result.compile_output),
        };
      } else if (result.status.id === timeLimitErrorId) {
        return {
          error: true,
          type: "Time Limit Exceeded",
          status: result.status.description,
        };
      } else if (runtimeErrorIds.includes(result.status.id)) {
        return {
          error: true,
          type: "Runtime Error",
          status: result.status.description,
          stderr: decodeBase64(result.stderr),
        };
      }

      const passed = result.status.id === 3;

      return {
        error: false,
        passed,
        userOutput: decodeBase64(result.stdout),
        expectedOutput: expectedOutput,
      };
    };

    const sampleResults = [];
    let allSamplesPassed = true;

    //  Sample Test Cases 
    for (let i = 0; i < sampleTestCases.length; i++) {
      const testCase = sampleTestCases[i];
      const input = await getS3DataFromUrl(testCase.input);
      const output = await getS3DataFromUrl(testCase.output);
      const result = await runTestCase(input, output);

      const verdict = result.error
        ? result.type
        : result.passed
          ? "Accepted"
          : "Wrong Answer";

      sampleResults.push({
        testCaseId: testCase._id,
        input,
        expectedOutput: result.expectedOutput,
        userOutput: result.userOutput || null,
        verdict,
        errorDetails: result.error ? result : null,
      });

      if (result.error) {
        // Save verdict same as in S3!
        const s3Verdict = verdict; // result.type;
        const s3Url = await uploadSubmissionToS3(req.userId!, testId, problemId, code, {
          sampleResults,
          verdict: s3Verdict,
        });

        await SubmissionHistoryModel.findOneAndUpdate(
          { userId: req.userId },
          {
            $push: {
              submissions: {
                testId: testIdObjectId,
                problemId: new mongoose.Types.ObjectId(problemId),
                s3Url,
                submittedAt,
                verdict: s3Verdict,
              },
            },
          },
          { upsert: true, new: true }
        );

        return res.status(200).json({
          msg: s3Verdict,
          verdicts: sampleResults,
          allPassed: false,
        });
      }

      if (!result.passed) {
        allSamplesPassed = false;
      }
    }

    //  Samples failed 
    if (!allSamplesPassed) {
      const s3Verdict = "Sample test case(s) failed";
      const s3Url = await uploadSubmissionToS3(req.userId!, testId, problemId, code, {
        sampleResults,
        verdict: s3Verdict,
      });

      await SubmissionHistoryModel.findOneAndUpdate(
        { userId: req.userId },
        {
          $push: {
            submissions: {
              testId: testIdObjectId,
              problemId: new mongoose.Types.ObjectId(problemId),
              s3Url,
              submittedAt,
              verdict: s3Verdict,
            },
          },
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        msg: s3Verdict,
        verdicts: sampleResults,
        allPassed: false,
      });
    }

    //  Hidden Test Cases 
    for (let i = 0; i < hiddenTestCases.length; i++) {
      const testCase = hiddenTestCases[i];
      const input = await getS3DataFromUrl(testCase.input);
      const output = await getS3DataFromUrl(testCase.output);
      const result = await runTestCase(input, output);

      if (result.error) {
        const s3Verdict = result.type;
        const s3Url = await uploadSubmissionToS3(req.userId!, testId, problemId, code, {
          verdict: s3Verdict,
        });

        await SubmissionHistoryModel.findOneAndUpdate(
          { userId: req.userId },
          {
            $push: {
              submissions: {
                testId: testIdObjectId,
                problemId: new mongoose.Types.ObjectId(problemId),
                s3Url,
                submittedAt,
                verdict: s3Verdict,
              },
            },
          },
          { upsert: true, new: true }
        );

        return res.status(400).json({ msg: s3Verdict, ...result });
      }

      if (!result.passed) {
        const s3Verdict = `Wrong answer on hidden test case ${i + 1}`;
        const s3Url = await uploadSubmissionToS3(req.userId!, testId, problemId, code, {
          hiddenFailedCase: i + 1,
          verdict: s3Verdict,
        });

        await SubmissionHistoryModel.findOneAndUpdate(
          { userId: req.userId },
          {
            $push: {
              submissions: {
                testId: testIdObjectId,
                problemId: new mongoose.Types.ObjectId(problemId),
                s3Url,
                submittedAt,
                verdict: s3Verdict,
              },
            },
          },
          { upsert: true, new: true }
        );

        return res.status(200).json({
          msg: s3Verdict,
        });
      }
    }

    //  All Test Cases Passed 
    const s3Verdict = "All test cases passed";
    const s3Url = await uploadSubmissionToS3(req.userId!, testId, problemId, code, {
      verdict: s3Verdict,
    });

    //  Add the mark from the problem 
    const submissionObj: any = {
      testId: testIdObjectId,
      problemId: new mongoose.Types.ObjectId(problemId),
      s3Url,
      submittedAt,
      verdict: s3Verdict,
    };

    if (problem.mark !== undefined) {
      submissionObj.marks = problem.mark;
    }

    await SubmissionHistoryModel.findOneAndUpdate(
      { userId: req.userId },
      {
        $push: {
          submissions: submissionObj,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      msg: s3Verdict,
    });

  } catch (error: any) {
    console.error("❌ Error in SubmitCodeUser:", error.message || error);
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error?.response?.data || error.message || "Unknown error",
    });
  }
};

SubmitCodeUserRouter.post("/", UserAuthMiddleware, SubmitCodeUserHandler);

export default SubmitCodeUserRouter;
