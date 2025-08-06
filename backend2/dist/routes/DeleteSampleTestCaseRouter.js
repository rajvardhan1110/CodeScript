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
exports.DeleteSampleTestCaseHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const ProblemModel_1 = require("../models/ProblemModel");
const DeleteSampleTestCaseRouter = express_1.default.Router();
const DeleteSampleTestCaseHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { testId, problemId, testCaseId } = req.body;
        if (!testId || !problemId || !testCaseId) {
            return res.status(400).json({
                msg: "testId, problemId, and testCaseId are required",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(problemId) || !mongoose_1.default.Types.ObjectId.isValid(testCaseId)) {
            return res.status(400).json({ msg: "Invalid ObjectId provided" });
        }
        const problem = yield ProblemModel_1.ProblemModel.findById(problemId);
        if (!problem) {
            return res.status(404).json({ msg: "Problem not found" });
        }
        console.log(problem.testId);
        console.log(testId);
        const incomingTestId = new mongoose_1.default.Types.ObjectId(testId);
        if (!problem.testId.equals(incomingTestId)) {
            return res.status(403).json({ msg: "Test ID mismatch with problem" });
        }
        // Filter out the test case by ID
        const initialLength = problem.sampleTestCases.length;
        problem.sampleTestCases = problem.sampleTestCases.filter((tc) => !tc._id.equals(new mongoose_1.default.Types.ObjectId(testCaseId)));
        if (problem.sampleTestCases.length === initialLength) {
            return res.status(404).json({ msg: "Test case not found in problem" });
        }
        yield problem.save();
        return res.status(200).json({
            msg: "Sample test case deleted successfully",
            remainingTestCases: problem.sampleTestCases,
        });
    }
    catch (error) {
        console.error("❌ Error in DeleteSampleTestCaseHandler:", error.message || error);
        return res.status(500).json({
            msg: "Internal Server Error",
            error: error.message || "Unknown error",
        });
    }
});
exports.DeleteSampleTestCaseHandler = DeleteSampleTestCaseHandler;
DeleteSampleTestCaseRouter.delete("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.DeleteSampleTestCaseHandler);
exports.default = DeleteSampleTestCaseRouter;
