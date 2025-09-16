import express, { Request, Response } from "express";
import { UserAuthMiddleware } from "../Middleware/UserAuthMiddleware";
import { ProblemModel } from "../models/ProblemModel";
import { getS3DataFromUrl } from "../utils/s3GetCode";
import axios from "axios";
import { Buffer } from "buffer";

const RunUserTestCasesRouter = express.Router();

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

export const RunUserTestCasesHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { code, language_id, problemId } = req.body;

    console.log("🔧 Incoming Run Request:", {
      userId: req.userId,
      language_id,
      problemId,
      codeSnippetPreview: code,
    });

    if (!code || !language_id || !problemId) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({
        msg: "code, language_id, and problemId are required",
      });
    }

    if (typeof problemId !== "string" || !problemId.trim()) {
      console.warn("⚠️ Invalid problemId");
      return res.status(400).json({ msg: "Invalid problemId" });
    }

    const problem = await ProblemModel.findById(problemId);
    if (!problem) {
      console.warn(`⚠️ Problem not found for ID: ${problemId}`);
      return res.status(404).json({ msg: "Problem not found" });
    }

    const testCases = problem.sampleTestCases || [];
    const cpu_time_limit = problem.cpu_time_limit || 2;
    const memory_limit = problem.memory_limit || 128000;

    console.log(`✅ Found ${testCases.length} sample test cases for problem: ${problem.title}`);

    const results: any[] = [];

    for (const testCase of testCases) {
      console.log(`🧪 Running Test Case ID: ${testCase._id}`);

      const input = await getS3DataFromUrl(testCase.input);
      const expectedOutput = await getS3DataFromUrl(testCase.output);

      console.log("📤 Sending to Judge0:", {
        cpu_time_limit,
        memory_limit,
        language_id,
        inputPreview: input.slice(0, 30),
        expectedOutputPreview: expectedOutput.slice(0, 30),
      });

      const response = await axios.post<Judge0Response>(
        "http://judgezeroraj.patilraj.me:2358/submissions?base64_encoded=true&wait=true",
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
      const statusId = result.status.id;

      const decodedStdout = decodeBase64(result.stdout)?.trim();
      const decodedStderr = decodeBase64(result.stderr)?.trim();
      const decodedCompileOutput = decodeBase64(result.compile_output)?.trim();

      console.log(`📥 Judge0 Response for Test Case ${testCase._id}:`, {
        status: result.status.description,
        statusId,
      });

      const fatalErrors = [5, 6, 7, 8, 9, 10, 11, 12]; // Compilation Error, Runtime Error, TLE, etc.
      if (fatalErrors.includes(statusId)) {
        console.error(`❌ Fatal Error for Test Case ${testCase._id}: ${result.status.description}`);
        return res.status(400).json({
          msg: "Test case execution failed",
          status: result.status.description,
          testCase: {
            testCaseId: testCase._id,
            input,
            expectedOutput,
            stdout: decodedStdout,
            stderr: decodedStderr,
            compile_output: decodedCompileOutput,
          },
        });
      }

      if (statusId === 3) {
        // Accepted
        results.push({
          testCaseId: testCase._id,
          input,
          expectedOutput,
          userOutput: decodedStdout,
          status: "Accepted",
        });
        console.log(`✅ Test Case ${testCase._id} Result: Accepted`);
      } else if (statusId === 4) {
        // Wrong Answer
        results.push({
          testCaseId: testCase._id,
          input,
          expectedOutput,
          userOutput: decodedStdout,
          stderr: decodedStderr,
          status: "Wrong Answer",
        });
        console.warn(`❌ Test Case ${testCase._id} Result: Wrong Answer`);
      }
    }

    console.log("🎯 All test cases executed (No CE/RE/TLE)");
    return res.status(200).json({
      msg: "All test cases executed (Accepted/Wrong Answer only)",
      verdicts: results,
    });
  } catch (error: any) {
    console.error("❌ Error in RunUserTestCasesHandler:", error.message || error);
    return res.status(500).json({
      msg: "Internal Server Error",
      error: error?.response?.data || error.message || "Unknown error",
    });
  }
};

RunUserTestCasesRouter.post("/", UserAuthMiddleware, RunUserTestCasesHandler);

export default RunUserTestCasesRouter;
