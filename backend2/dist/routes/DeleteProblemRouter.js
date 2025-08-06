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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const ProblemModel_1 = require("../models/ProblemModel");
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const deleteFromS3_1 = require("../utils/deleteFromS3");
const DeleteProblemRouter = express_1.default.Router();
DeleteProblemRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { problemId } = req.body;
        console.log(`[DELETE] Received delete request for problemId: ${problemId}`);
        if (!mongoose_1.default.Types.ObjectId.isValid(problemId)) {
            console.warn(`[DELETE] Invalid problemId format: ${problemId}`);
            return res.status(400).json({ msg: "Invalid Problem ID" });
        }
        const problem = yield ProblemModel_1.ProblemModel.findById(problemId);
        if (!problem) {
            console.warn(`[DELETE] Problem not found: ${problemId}`);
            return res.status(404).json({ msg: "Problem not found" });
        }
        console.log(`[DELETE] Found problem: ${problemId}. Proceeding to delete associated S3 files...`);
        const deletionPromises = [];
        if ((_a = problem.markdownUrl) === null || _a === void 0 ? void 0 : _a.startsWith("https://")) {
            console.log(`[DELETE] Deleting markdownUrl from S3: ${problem.markdownUrl}`);
            deletionPromises.push((0, deleteFromS3_1.deleteFromS3Url)(problem.markdownUrl));
        }
        if ((_b = problem.AdminCode) === null || _b === void 0 ? void 0 : _b.startsWith("https://")) {
            console.log(`[DELETE] Deleting AdminCode from S3: ${problem.AdminCode}`);
            deletionPromises.push((0, deleteFromS3_1.deleteFromS3Url)(problem.AdminCode));
        }
        for (const testCase of [...problem.sampleTestCases, ...problem.hiddenTestCases]) {
            if ((_c = testCase.input) === null || _c === void 0 ? void 0 : _c.startsWith("https://")) {
                console.log(`[DELETE] Deleting testCase input from S3: ${testCase.input}`);
                deletionPromises.push((0, deleteFromS3_1.deleteFromS3Url)(testCase.input));
            }
            if ((_d = testCase.output) === null || _d === void 0 ? void 0 : _d.startsWith("https://")) {
                console.log(`[DELETE] Deleting testCase output from S3: ${testCase.output}`);
                deletionPromises.push((0, deleteFromS3_1.deleteFromS3Url)(testCase.output));
            }
        }
        const results = yield Promise.allSettled(deletionPromises);
        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(`[DELETE] S3 deletion failed for item #${index + 1}:`, result.reason);
            }
            else {
                console.log(`[DELETE] S3 deletion successful for item #${index + 1}`);
            }
        });
        yield ProblemModel_1.ProblemModel.findByIdAndDelete(problemId);
        console.log(`[DELETE] Problem document deleted from MongoDB: ${problemId}`);
        return res.status(200).json({ msg: "Problem and all related S3 data deleted successfully" });
    }
    catch (error) {
        console.error("[DELETE] Internal server error during problem deletion:", error);
        return res.status(500).json({ msg: "Internal server error" });
    }
}));
exports.default = DeleteProblemRouter;
