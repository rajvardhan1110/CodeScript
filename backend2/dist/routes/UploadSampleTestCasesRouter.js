"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadSampleTestCodeHandler = void 0;
const express_1 = __importDefault(require("express"));
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const s3GetCode_1 = require("../utils/s3GetCode");
const ProblemModel_1 = require("../models/ProblemModel");
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
const s3uploadAdminCode_1 = require("../utils/s3uploadAdminCode");
const UploadSampleTestCodeRouter = express_1.default.Router();
const encodeBase64 = (str) => buffer_1.Buffer.from(str, "utf-8").toString("base64");
const decodeBase64 = (str) => str ? buffer_1.Buffer.from(str, "base64").toString("utf-8") : "";
const UploadSampleTestCodeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { testCase, problemId } = req.body;
        console.log("➡️ Incoming request to UploadSampleTestCodeHandler");
        console.log("📥 Body Received:", req.body);
        if (!testCase || !problemId) {
            console.warn("⚠️ testCase or problemId missing in request");
            return res.status(400).json({ msg: "testCase and problemId are required" });
        }
        const problem = yield ProblemModel_1.ProblemModel.findById(problemId);
        if (!problem) {
            console.warn(`❗ Problem not found with id: ${problemId}`);
            return res.status(404).json({ msg: "Problem not found" });
        }
        const codeData = yield (0, s3GetCode_1.getS3DataFromUrl)(problem.AdminCode);
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
        const response = yield axios_1.default.post("http://judgezeroraj.patilraj.me:2358/submissions?base64_encoded=true&wait=true", {
            source_code: encodeBase64(codeData),
            stdin: encodeBase64(testCase.input),
            language_id,
            cpu_time_limit,
            memory_limit,
        }, {
            headers: { "Content-Type": "application/json" },
        });
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
        if (errorStatusIds.includes(statusId) ||
            result.stderr ||
            result.compile_output) {
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
            const id = new mongoose_1.default.Types.ObjectId();
            const testId = problem.testId;
            console.log("🧾 Successful Execution - Output:", outputDecoded);
            console.log("🆔 Generated TestCase ID:", id);
            const inputKey = `${testId}/${problemId}/input/${id}`;
            const outputKey = `${testId}/${problemId}/output/${id}`;
            console.log("🪣 S3 Upload Paths:", { inputKey, outputKey });
            const inputUrl = yield (0, s3uploadAdminCode_1.uploadStringToS3)(testCase.input, inputKey);
            const outputUrl = yield (0, s3uploadAdminCode_1.uploadStringToS3)(outputDecoded, outputKey);
            console.log("✅ Uploaded input to S3:", inputUrl);
            console.log("✅ Uploaded output to S3:", outputUrl);
            const newTestCase = {
                _id: id,
                input: inputUrl,
                output: outputUrl,
            };
            console.log("💾 Saving new sample test case to DB:", newTestCase);
            problem.sampleTestCases.push(newTestCase);
            yield problem.save();
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
    }
    catch (error) {
        console.error("❌ Error in UploadSampleTestCodeHandler:", error.message || error);
        return res.status(500).json({
            msg: "Internal Server Error with Judge0",
            error: ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message || "Unknown error",
        });
    }
});
exports.UploadSampleTestCodeHandler = UploadSampleTestCodeHandler;
UploadSampleTestCodeRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.UploadSampleTestCodeHandler);
exports.default = UploadSampleTestCodeRouter;
