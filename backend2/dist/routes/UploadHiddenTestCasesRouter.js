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
exports.UploadHiddenTestCodeHandler = void 0;
const express_1 = __importDefault(require("express"));
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const s3GetCode_1 = require("../utils/s3GetCode");
const ProblemModel_1 = require("../models/ProblemModel");
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
const s3uploadAdminCode_1 = require("../utils/s3uploadAdminCode");
const UploadHiddenTestCodeRouter = express_1.default.Router();
// Helpers
const encodeBase64 = (str) => buffer_1.Buffer.from(str, "utf-8").toString("base64");
const decodeBase64 = (str) => str ? buffer_1.Buffer.from(str, "base64").toString("utf-8") : "";
const UploadHiddenTestCodeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { testCase, problemId } = req.body;
        if (!testCase || !problemId) {
            return res.status(400).json({ msg: "testCase and problemId are required" });
        }
        const problem = yield ProblemModel_1.ProblemModel.findById(problemId);
        if (!problem) {
            return res.status(404).json({ msg: "Problem not found" });
        }
        const codeData = yield (0, s3GetCode_1.getS3DataFromUrl)(problem.AdminCode);
        if (!codeData) {
            return res.status(500).json({ msg: "Failed to fetch code from S3" });
        }
        const language_id = problem.language;
        const cpu_time_limit = problem.cpu_time_limit || 2;
        const memory_limit = problem.memory_limit || 128000;
        const response = yield axios_1.default.post("http://judge.dhanrajj.me:2358/submissions?base64_encoded=true&wait=true", {
            source_code: encodeBase64(codeData),
            stdin: encodeBase64(testCase.input),
            language_id,
            cpu_time_limit,
            memory_limit,
        }, {
            headers: { "Content-Type": "application/json" },
        });
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
        if (errorStatusIds.includes(statusId) ||
            result.stderr ||
            result.compile_output) {
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
            // Build S3 keys
            const inputKey = `${testId}/${problemId}/input/${id}`;
            const outputKey = `${testId}/${problemId}/output/${id}`;
            // Upload both to S3
            const inputUrl = yield (0, s3uploadAdminCode_1.uploadStringToS3)(testCase.input, inputKey);
            const outputUrl = yield (0, s3uploadAdminCode_1.uploadStringToS3)(outputDecoded, outputKey);
            // Save URLs in MongoDB
            const newTestCase = {
                _id: id,
                input: inputUrl,
                output: outputUrl,
            };
            console.log(newTestCase);
            problem.hiddenTestCases.push(newTestCase);
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
        return res.status(400).json({
            msg: "Unhandled Judge0 response status",
            status: result.status,
        });
    }
    catch (error) {
        console.error("❌ Error in UploadHiddenTestCodeHandler:", error.message || error);
        return res.status(500).json({
            msg: "Internal Server Error with Judge0",
            error: ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message || "Unknown error",
        });
    }
});
exports.UploadHiddenTestCodeHandler = UploadHiddenTestCodeHandler;
UploadHiddenTestCodeRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.UploadHiddenTestCodeHandler);
exports.default = UploadHiddenTestCodeRouter;
