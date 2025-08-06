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
exports.GetAdminTestcaseHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const ProblemModel_1 = require("../models/ProblemModel");
const s3GetCode_1 = require("../utils/s3GetCode");
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const GetAdminTestcaseRouter = express_1.default.Router();
const GetAdminTestcaseHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { problemId, testCaseId } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(problemId) || !mongoose_1.default.Types.ObjectId.isValid(testCaseId)) {
        return res.status(400).json({ msg: "Invalid problemId or testCaseId" });
    }
    try {
        const problem = yield ProblemModel_1.ProblemModel.findById(problemId)
            .select("sampleTestCases hiddenTestCases")
            .lean();
        if (!problem) {
            return res.status(404).json({ msg: "Problem not found" });
        }
        const allTestCases = [...problem.sampleTestCases, ...problem.hiddenTestCases];
        const testCase = allTestCases.find((tc) => tc._id.toString() === testCaseId);
        if (!testCase) {
            return res.status(404).json({ msg: "Test case not found in sample or hidden" });
        }
        const input = yield (0, s3GetCode_1.getS3DataFromUrl)(testCase.input);
        const output = yield (0, s3GetCode_1.getS3DataFromUrl)(testCase.output);
        return res.status(200).json({
            msg: "Fetched test case input and output successfully",
            input,
            output,
        });
    }
    catch (error) {
        console.error("Error in GetAdminTestcaseHandler:", error);
        return res.status(500).json({
            msg: "Failed to fetch test case content",
            error: error.message,
        });
    }
});
exports.GetAdminTestcaseHandler = GetAdminTestcaseHandler;
GetAdminTestcaseRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.GetAdminTestcaseHandler);
exports.default = GetAdminTestcaseRouter;
