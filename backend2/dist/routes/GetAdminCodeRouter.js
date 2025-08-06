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
exports.GetAdminCodeHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const ProblemModel_1 = require("../models/ProblemModel");
const s3GetCode_1 = require("../utils/s3GetCode");
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const GetAdminCodeRouter = express_1.default.Router();
const GetAdminCodeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { problemId } = req.body;
    console.log("📥 Incoming request to /getAdminCode");
    console.log("🧾 Request body:", req.body);
    if (!mongoose_1.default.Types.ObjectId.isValid(problemId)) {
        console.warn("⚠️ Invalid problem ID received:", problemId);
        return res.status(400).json({ msg: "Invalid problem ID" });
    }
    try {
        console.log("🔍 Fetching problem by ID...");
        const problem = yield ProblemModel_1.ProblemModel.findById(problemId)
            .select("AdminCode sampleTestCases hiddenTestCases language")
            .lean();
        if (!problem || !problem.AdminCode) {
            console.warn("❌ Problem not found or AdminCode is missing for ID:", problemId);
            return res.status(404).json({ msg: "Problem not found or AdminCode not set" });
        }
        console.log("📦 Problem found. Fetching AdminCode from S3...");
        const codeContent = yield (0, s3GetCode_1.getS3DataFromUrl)(problem.AdminCode);
        console.log("✅ Successfully fetched AdminCode from S3.");
        const sampleTestCaseIds = problem.sampleTestCases.map((test) => test._id);
        const hiddenTestCaseIds = problem.hiddenTestCases.map((test) => test._id);
        console.log("🧪 Sample Test Case IDs:", sampleTestCaseIds);
        console.log("🔒 Hidden Test Case IDs:", hiddenTestCaseIds);
        return res.status(200).json({
            msg: "Fetched admin code and test case IDs successfully",
            language_id: problem.language,
            content: codeContent,
            sampleTestCaseIds,
            hiddenTestCaseIds,
        });
    }
    catch (error) {
        console.error("❗ Error in GetAdminCodeHandler:", error);
        return res.status(500).json({
            msg: "Failed to fetch admin code or test cases",
            error: error.message,
        });
    }
});
exports.GetAdminCodeHandler = GetAdminCodeHandler;
GetAdminCodeRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.GetAdminCodeHandler);
exports.default = GetAdminCodeRouter;
