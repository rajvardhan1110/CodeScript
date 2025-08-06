import express, { Request, Response } from "express";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";
import { getS3DataFromUrl } from "../utils/s3GetCode";
import { ProblemModel } from "../models/ProblemModel";
import mongoose from "mongoose";
import axios from "axios";
import { Buffer } from "buffer";
import { uploadStringToS3 } from "../utils/s3uploadAdminCode"; 

const UploadSampleTestCodeRouter = express.Router();

interface CustomRequest extends Request {
    examTakerId?: string;
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

export const UploadSampleTestCodeHandler = async (
    req: CustomRequest,
    res: Response
) => {
    try {
        const { testCase, problemId } = req.body;
        console.log("➡️ Incoming request to UploadSampleTestCodeHandler");
        console.log("📥 Body Received:", req.body);

        if (!testCase || !problemId) {
            console.warn("⚠️ testCase or problemId missing in request");
            return res.status(400).json({ msg: "testCase and problemId are required" });
        }

        const problem = await ProblemModel.findById(problemId);
        if (!problem) {
            console.warn(`❗ Problem not found with id: ${problemId}`);
            return res.status(404).json({ msg: "Problem not found" });
        }

        const codeData = await getS3DataFromUrl(problem.AdminCode);
        if (!codeData) {
            console.error("❌ Failed to fetch code from S3 URL:", problem.AdminCode);
            return res.status(500).json({ msg: "Failed to fetch code from S3" });
        }

        console.log("✅ Fetched admin code from S3");

        const language_id = problem.language;
        const cpu_time_limit = problem.cpu_time_limit || 2;
        const memory_limit = problem.memory_limit || 128000;

        console.log("🧠 Preparing Judge0 request with:");
        console.log("📝 Source Code:", codeData);
        console.log("▶️ Input:", testCase.input);
        console.log("🧠 language_id:", language_id);
        console.log("⏱ cpu_time_limit:", cpu_time_limit);
        console.log("💾 memory_limit:", memory_limit);

        const response = await axios.post<Judge0Response>(
            "http://judge.dhanrajj.me:2358/submissions?base64_encoded=true&wait=true",
            {
                source_code: encodeBase64(codeData),
                stdin: encodeBase64(testCase.input),
                language_id,
                cpu_time_limit,
                memory_limit,
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        const result = response.data;

        console.log("🧾 Judge0 Response:", result);

        if (!result || !result.status) {
            console.error("❌ Invalid Judge0 response");
            return res.status(500).json({
                msg: "Invalid response from Judge0",
                rawResponse: result,
            });
        }

        const statusId = result.status.id;
        const statusDesc = result.status.description;

        console.log(`📌 Judge0 status: ${statusId} - ${statusDesc}`);

        if (statusId === 6) {
            console.warn("🛑 Compilation Error:", decodeBase64(result.compile_output));
            return res.status(400).json({
                msg: "Compilation Error",
                stderr: decodeBase64(result.compile_output),
                status: statusDesc,
            });
        }

        const errorStatusIds = [4, 5, 7, 8, 9, 10, 11, 12];
        if (
            errorStatusIds.includes(statusId) ||
            result.stderr ||
            result.compile_output
        ) {
            console.warn("🛑 Execution Error or Runtime Issue");
            return res.status(400).json({
                msg: "Execution Error",
                status: statusDesc,
                stderr: decodeBase64(result.stderr),
                compile_output: decodeBase64(result.compile_output),
            });
        }

        if (statusId === 3) {
            const outputDecoded = decodeBase64(result.stdout);
            const id = new mongoose.Types.ObjectId();
            const testId = problem.testId;

            console.log("🧾 Successful Execution - Output:", outputDecoded);
            console.log("🆔 Generated TestCase ID:", id);

            const inputKey = `${testId}/${problemId}/input/${id}`;
            const outputKey = `${testId}/${problemId}/output/${id}`;

            console.log("🪣 S3 Upload Paths:", { inputKey, outputKey });

            const inputUrl = await uploadStringToS3(testCase.input, inputKey);
            const outputUrl = await uploadStringToS3(outputDecoded, outputKey);

            console.log("✅ Uploaded input to S3:", inputUrl);
            console.log("✅ Uploaded output to S3:", outputUrl);

            const newTestCase = {
                _id: id,
                input: inputUrl,
                output: outputUrl,
            };

            console.log("💾 Saving new sample test case to DB:", newTestCase);

            problem.sampleTestCases.push(newTestCase);
            await problem.save();

            return res.status(200).json({
                msg: "Test case executed and saved successfully",
                _id: id,
                inputUrl: inputUrl,
                outputUrl: outputUrl,
                input: testCase,
                output: outputDecoded
            });
        }

        console.error("❗ Unhandled Judge0 status:", result.status);
        return res.status(400).json({
            msg: "Unhandled Judge0 response status",
            status: result.status,
        });

    } catch (error: any) {
        console.error("❌ Error in UploadSampleTestCodeHandler:", error.message || error);
        return res.status(500).json({
            msg: "Internal Server Error with Judge0",
            error: error?.response?.data || error.message || "Unknown error",
        });
    }
};

UploadSampleTestCodeRouter.post("/", AdminAuthMiddleware, UploadSampleTestCodeHandler);
export default UploadSampleTestCodeRouter;
