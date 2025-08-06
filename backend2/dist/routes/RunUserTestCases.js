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
exports.RunUserTestCasesHandler = void 0;
const express_1 = __importDefault(require("express"));
const UserAuthMiddleware_1 = require("../Middleware/UserAuthMiddleware");
const ProblemModel_1 = require("../models/ProblemModel");
const s3GetCode_1 = require("../utils/s3GetCode");
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
const RunUserTestCasesRouter = express_1.default.Router();
const encodeBase64 = (str) => buffer_1.Buffer.from(str, "utf-8").toString("base64");
const decodeBase64 = (str) => str ? buffer_1.Buffer.from(str, "base64").toString("utf-8") : "";
const RunUserTestCasesHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
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
        const problem = yield ProblemModel_1.ProblemModel.findById(problemId);
        if (!problem) {
            console.warn(`⚠️ Problem not found for ID: ${problemId}`);
            return res.status(404).json({ msg: "Problem not found" });
        }
        const testCases = problem.sampleTestCases || [];
        const cpu_time_limit = problem.cpu_time_limit || 2;
        const memory_limit = problem.memory_limit || 128000;
        console.log(`✅ Found ${testCases.length} sample test cases for problem: ${problem.title}`);
        const results = [];
        for (const testCase of testCases) {
            console.log(`🧪 Running Test Case ID: ${testCase._id}`);
            const input = yield (0, s3GetCode_1.getS3DataFromUrl)(testCase.input);
            const expectedOutput = yield (0, s3GetCode_1.getS3DataFromUrl)(testCase.output);
            console.log("📤 Sending to Judge0:", {
                cpu_time_limit,
                memory_limit,
                language_id,
                inputPreview: input.slice(0, 30),
                expectedOutputPreview: expectedOutput.slice(0, 30),
            });
            const response = yield axios_1.default.post("http://judge.dhanrajj.me:2358/submissions?base64_encoded=true&wait=true", {
                source_code: encodeBase64(code),
                stdin: encodeBase64(input),
                expected_output: encodeBase64(expectedOutput),
                language_id,
                cpu_time_limit,
                memory_limit,
            }, {
                headers: { "Content-Type": "application/json" },
            });
            const result = response.data;
            const statusId = result.status.id;
            const decodedStdout = (_a = decodeBase64(result.stdout)) === null || _a === void 0 ? void 0 : _a.trim();
            const decodedStderr = (_b = decodeBase64(result.stderr)) === null || _b === void 0 ? void 0 : _b.trim();
            const decodedCompileOutput = (_c = decodeBase64(result.compile_output)) === null || _c === void 0 ? void 0 : _c.trim();
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
            }
            else if (statusId === 4) {
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
    }
    catch (error) {
        console.error("❌ Error in RunUserTestCasesHandler:", error.message || error);
        return res.status(500).json({
            msg: "Internal Server Error",
            error: ((_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.data) || error.message || "Unknown error",
        });
    }
});
exports.RunUserTestCasesHandler = RunUserTestCasesHandler;
RunUserTestCasesRouter.post("/", UserAuthMiddleware_1.UserAuthMiddleware, exports.RunUserTestCasesHandler);
exports.default = RunUserTestCasesRouter;
