import express, { Request, Response } from "express";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";
import { getS3DataFromUrl } from "../utils/s3GetCode";
import { ProblemModel } from "../models/ProblemModel";
import mongoose from "mongoose";
import axios from "axios";
import { Buffer } from "buffer";
import { uploadStringToS3 } from "../utils/s3uploadAdminCode"; 
const UploadHiddenTestCodeRouter = express.Router();

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

// Helpers
const encodeBase64 = (str: string): string =>
    Buffer.from(str, "utf-8").toString("base64");

const decodeBase64 = (str: string | null): string =>
    str ? Buffer.from(str, "base64").toString("utf-8") : "";

export const UploadHiddenTestCodeHandler = async (
    req: CustomRequest,
    res: Response
) => {
    try {
        const { testCase, problemId } = req.body;

        if (!testCase || !problemId) {
            return res.status(400).json({ msg: "testCase and problemId are required" });
        }

        const problem = await ProblemModel.findById(problemId);
        if (!problem) {
            return res.status(404).json({ msg: "Problem not found" });
        }

        const codeData = await getS3DataFromUrl(problem.AdminCode);
        if (!codeData) {
            return res.status(500).json({ msg: "Failed to fetch code from S3" });
        }

        const language_id = problem.language;
        const cpu_time_limit = problem.cpu_time_limit || 2;
        const memory_limit = problem.memory_limit || 128000;

        const response = await axios.post<Judge0Response>(
            "http://judgezeroraj.patilraj.me:2358/submissions?base64_encoded=true&wait=true",
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

        if (!result || !result.status) {
            return res.status(500).json({
                msg: "Invalid response from Judge0",
                rawResponse: result,
            });
        }

        const statusId = result.status.id;
        const statusDesc = result.status.description;

        if (statusId === 6) {
            return res.status(400).json({
                msg: "Compilation Error",
                details: decodeBase64(result.compile_output),
                status: statusDesc,
            });
        }

        const errorStatusIds = [4, 5, 7, 8, 9, 10, 11, 12];
        if (
            errorStatusIds.includes(statusId) ||
            result.stderr ||
            result.compile_output
        ) {
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

            // Build S3 keys
            const inputKey = `${testId}/${problemId}/input/${id}`;
            const outputKey = `${testId}/${problemId}/output/${id}`;

            // Upload both to S3
            const inputUrl = await uploadStringToS3(testCase.input, inputKey);
            const outputUrl = await uploadStringToS3(outputDecoded, outputKey);

            // Save URLs in MongoDB
            const newTestCase = {
                _id: id,
                input: inputUrl,
                output: outputUrl,
            };

            console.log(newTestCase)

            problem.hiddenTestCases.push(newTestCase);
            await problem.save();

            return res.status(200).json({
                msg: "Test case executed and saved successfully",
                _id: id,
                inputUrl: inputUrl,
                outputUrl: outputUrl,
                input : testCase,
                output : outputDecoded
            });
        }

        return res.status(400).json({
            msg: "Unhandled Judge0 response status",
            status: result.status,
        });

    } catch (error: any) {
        console.error("❌ Error in UploadHiddenTestCodeHandler:", error.message || error);
        return res.status(500).json({
            msg: "Internal Server Error with Judge0",
            error: error?.response?.data || error.message || "Unknown error",
        });
    }
};

UploadHiddenTestCodeRouter.post("/", AdminAuthMiddleware, UploadHiddenTestCodeHandler);
export default UploadHiddenTestCodeRouter;
