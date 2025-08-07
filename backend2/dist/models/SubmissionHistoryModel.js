"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionHistoryModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const submissionSchema = new mongoose_1.default.Schema({
    testId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Test",
        required: true,
    },
    problemId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
    },
    s3Url: {
        type: String,
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    verdict: {
        type: String,
        required: true,
    },
    marks: {
        type: Number,
        required: false,
    },
});
const SubmissionHistorySchema = new mongoose_1.default.Schema({
    userId: {
        type: String,
        ref: "User",
        required: true,
        unique: true,
    },
    submissions: [submissionSchema],
});
exports.SubmissionHistoryModel = mongoose_1.default.model("SubmissionHistory", SubmissionHistorySchema);
