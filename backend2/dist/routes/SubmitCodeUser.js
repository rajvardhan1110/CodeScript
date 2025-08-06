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
exports.SubmitCodeUserHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const UserAuthMiddleware_1 = require("../Middleware/UserAuthMiddleware");
const ProblemModel_1 = require("../models/ProblemModel");
const SubmissionHistoryModel_1 = require("../models/SubmissionHistoryModel");
const s3GetCode_1 = require("../utils/s3GetCode");
const uploadSubmissionToS3_1 = require("../utils/uploadSubmissionToS3");
const axios_1 = __importDefault(require("axios"));
const buffer_1 = require("buffer");
const SubmitCodeUserRouter = express_1.default.Router();
const encodeBase64 = (str) => buffer_1.Buffer.from(str, "utf-8").toString("base64");
const decodeBase64 = (str) => str ? buffer_1.Buffer.from(str, "base64").toString("utf-8") : "";
const SubmitCodeUserHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const submittedAt = new Date();
    try {
        const { code, language_id, problemId, testId } = req.body;
        console.log("📥 Incoming submission:", {
            codeSnippet: code === null || code === void 0 ? void 0 : code.slice(0, 50),
            language_id,
            problemId,
            testId,
        });
        if (!code || !language_id || !problemId || !testId) {
            return res.status(400).json({ msg: "code, language_id, problemId, and testId are required" });
        }
        // ✅ Validate ObjectId types
        if (!mongoose_1.default.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ msg: "Invalid problemId" });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ msg: "Invalid testId" });
        }
        const problem = yield ProblemModel_1.ProblemModel.findById(problemId);
        if (!problem) {
            return res.status(404).json({ msg: "Problem not found" });
        }
        // ✅ Convert testId to ObjectId for DB use only
        const testIdObjectId = new mongoose_1.default.Types.ObjectId(testId);
        const { sampleTestCases, hiddenTestCases, cpu_time_limit, memory_limit } = problem;
        const runTestCase = (input, expectedOutput) => __awaiter(void 0, void 0, void 0, function* () {
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
            }
            else if (result.status.id === timeLimitErrorId) {
                return {
                    error: true,
                    type: "Time Limit Exceeded",
                    status: result.status.description,
                };
            }
            else if (runtimeErrorIds.includes(result.status.id)) {
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
        });
        const sampleResults = [];
        let allSamplesPassed = true;
        for (let i = 0; i < sampleTestCases.length; i++) {
            const testCase = sampleTestCases[i];
            const input = yield (0, s3GetCode_1.getS3DataFromUrl)(testCase.input);
            const output = yield (0, s3GetCode_1.getS3DataFromUrl)(testCase.output);
            const result = yield runTestCase(input, output);
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
                const s3Url = yield (0, uploadSubmissionToS3_1.uploadSubmissionToS3)(req.userId, testId, problemId, code, {
                    sampleResults,
                    verdict: result.type,
                });
                yield SubmissionHistoryModel_1.SubmissionHistoryModel.findOneAndUpdate({ userId: req.userId }, {
                    $push: {
                        submissions: {
                            testId: testIdObjectId,
                            problemId: new mongoose_1.default.Types.ObjectId(problemId),
                            s3Url,
                            submittedAt,
                        },
                    },
                }, { upsert: true, new: true });
                return res.status(200).json({
                    msg: result.type,
                    verdicts: sampleResults,
                    allPassed: false,
                });
            }
            if (!result.passed) {
                allSamplesPassed = false;
            }
        }
        if (!allSamplesPassed) {
            const s3Url = yield (0, uploadSubmissionToS3_1.uploadSubmissionToS3)(req.userId, testId, problemId, code, {
                sampleResults,
                verdict: "Sample test case(s) failed",
            });
            yield SubmissionHistoryModel_1.SubmissionHistoryModel.findOneAndUpdate({ userId: req.userId }, {
                $push: {
                    submissions: {
                        testId: testIdObjectId,
                        problemId: new mongoose_1.default.Types.ObjectId(problemId),
                        s3Url,
                        submittedAt,
                    },
                },
            }, { upsert: true, new: true });
            return res.status(200).json({
                msg: "Sample test case(s) failed",
                verdicts: sampleResults,
                allPassed: false,
            });
        }
        for (let i = 0; i < hiddenTestCases.length; i++) {
            const testCase = hiddenTestCases[i];
            const input = yield (0, s3GetCode_1.getS3DataFromUrl)(testCase.input);
            const output = yield (0, s3GetCode_1.getS3DataFromUrl)(testCase.output);
            const result = yield runTestCase(input, output);
            if (result.error) {
                const s3Url = yield (0, uploadSubmissionToS3_1.uploadSubmissionToS3)(req.userId, testId, problemId, code, result);
                yield SubmissionHistoryModel_1.SubmissionHistoryModel.findOneAndUpdate({ userId: req.userId }, {
                    $push: {
                        submissions: {
                            testId: testIdObjectId,
                            problemId: new mongoose_1.default.Types.ObjectId(problemId),
                            s3Url,
                            submittedAt,
                        },
                    },
                }, { upsert: true, new: true });
                return res.status(400).json(Object.assign({ msg: result.type }, result));
            }
            if (!result.passed) {
                const s3Url = yield (0, uploadSubmissionToS3_1.uploadSubmissionToS3)(req.userId, testId, problemId, code, {
                    hiddenFailedCase: i + 1,
                    verdict: "Wrong answer on hidden test case",
                });
                yield SubmissionHistoryModel_1.SubmissionHistoryModel.findOneAndUpdate({ userId: req.userId }, {
                    $push: {
                        submissions: {
                            testId: testIdObjectId,
                            problemId: new mongoose_1.default.Types.ObjectId(problemId),
                            s3Url,
                            submittedAt,
                        },
                    },
                }, { upsert: true, new: true });
                return res.status(200).json({
                    msg: `Wrong answer on hidden test case ${i + 1}`,
                });
            }
        }
        const s3Url = yield (0, uploadSubmissionToS3_1.uploadSubmissionToS3)(req.userId, testId, problemId, code, {
            verdict: "All test cases passed",
        });
        yield SubmissionHistoryModel_1.SubmissionHistoryModel.findOneAndUpdate({ userId: req.userId }, {
            $push: {
                submissions: {
                    testId: testIdObjectId,
                    problemId: new mongoose_1.default.Types.ObjectId(problemId),
                    s3Url,
                    submittedAt,
                },
            },
        }, { upsert: true, new: true });
        return res.status(200).json({
            msg: "All test cases passed",
        });
    }
    catch (error) {
        console.error("❌ Error in SubmitCodeUser:", error.message || error);
        return res.status(500).json({
            msg: "Internal Server Error",
            error: ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message || "Unknown error",
        });
    }
});
exports.SubmitCodeUserHandler = SubmitCodeUserHandler;
SubmitCodeUserRouter.post("/", UserAuthMiddleware_1.UserAuthMiddleware, exports.SubmitCodeUserHandler);
exports.default = SubmitCodeUserRouter;
