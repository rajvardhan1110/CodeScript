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
exports.GetSingleSubmissionHandler = exports.GetSubmissionListHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const UserAuthMiddleware_1 = require("../Middleware/UserAuthMiddleware");
const SubmissionHistoryModel_1 = require("../models/SubmissionHistoryModel");
const s3GetCode_1 = require("../utils/s3GetCode");
const GetSubmissionHistoryRouter = express_1.default.Router();
// ✅ Handler: Get all submissions for a problem/test (fetch verdict from S3)
const GetSubmissionListHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { testId, problemId } = req.body;
    const userId = req.userId;
    if (!testId || !mongoose_1.default.Types.ObjectId.isValid(testId) ||
        !problemId || !mongoose_1.default.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({ msg: "Invalid or missing testId/problemId" });
    }
    try {
        const record = yield SubmissionHistoryModel_1.SubmissionHistoryModel.findOne({ userId });
        if (!record)
            return res.status(200).json([]);
        const filtered = yield Promise.all(record.submissions
            .filter((sub) => sub.testId && sub.problemId &&
            sub.testId.toString() === testId &&
            sub.problemId.toString() === problemId)
            .map((sub) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const s3Data = yield (0, s3GetCode_1.getS3DataFromUrl)(sub.s3Url);
                const { result } = JSON.parse(s3Data);
                return {
                    _id: sub._id,
                    verdict: (result === null || result === void 0 ? void 0 : result.verdict) || "Unknown",
                    timestamp: sub.submittedAt,
                };
            }
            catch (err) {
                return {
                    _id: sub._id,
                    verdict: "Error fetching result",
                    timestamp: sub.submittedAt,
                };
            }
        })));
        return res.status(200).json(filtered);
    }
    catch (error) {
        console.error("❌ Error in GetSubmissionListHandler:", error);
        return res.status(500).json({ msg: "Failed to fetch submission list", error: error.message });
    }
});
exports.GetSubmissionListHandler = GetSubmissionListHandler;
// ✅ Handler: Get a specific submission with code and result (verdict from S3)
const GetSingleSubmissionHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { testId, problemId, submissionId } = req.body;
    const userId = req.userId;
    if (!testId || !mongoose_1.default.Types.ObjectId.isValid(testId) ||
        !problemId || !mongoose_1.default.Types.ObjectId.isValid(problemId) ||
        !submissionId || !mongoose_1.default.Types.ObjectId.isValid(submissionId)) {
        return res.status(400).json({ msg: "Invalid or missing testId/problemId/submissionId" });
    }
    try {
        const record = yield SubmissionHistoryModel_1.SubmissionHistoryModel.findOne({ userId });
        if (!record)
            return res.status(404).json({ msg: "Submission not found" });
        const submission = record.submissions.find((sub) => {
            var _a, _b;
            return sub._id.toString() === submissionId &&
                ((_a = sub.testId) === null || _a === void 0 ? void 0 : _a.toString()) === testId &&
                ((_b = sub.problemId) === null || _b === void 0 ? void 0 : _b.toString()) === problemId;
        });
        if (!submission)
            return res.status(404).json({ msg: "Submission not found" });
        const s3Data = yield (0, s3GetCode_1.getS3DataFromUrl)(submission.s3Url);
        const { code, result } = JSON.parse(s3Data);
        return res.status(200).json({
            _id: submission._id,
            verdict: (result === null || result === void 0 ? void 0 : result.verdict) || "Unknown",
            timestamp: submission.submittedAt,
            code,
            result,
        });
    }
    catch (error) {
        console.error("❌ Error in GetSingleSubmissionHandler:", error);
        return res.status(500).json({ msg: "Failed to fetch submission", error: error.message });
    }
});
exports.GetSingleSubmissionHandler = GetSingleSubmissionHandler;
GetSubmissionHistoryRouter.post("/list", UserAuthMiddleware_1.UserAuthMiddleware, exports.GetSubmissionListHandler);
GetSubmissionHistoryRouter.post("/one", UserAuthMiddleware_1.UserAuthMiddleware, exports.GetSingleSubmissionHandler);
exports.default = GetSubmissionHistoryRouter;
