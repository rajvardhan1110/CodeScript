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
exports.GetUserMarkdownHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const ProblemModel_1 = require("../models/ProblemModel");
const s3GetCode_1 = require("../utils/s3GetCode");
const UserAuthMiddleware_1 = require("../Middleware/UserAuthMiddleware");
const GetUserMarkdownRouter = express_1.default.Router();
const GetUserMarkdownHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { testId, problemId } = req.body;
        const userId = req.userId;
        // console.log("📥 Incoming request to /userMarkdown");
        // console.log("🧑 User ID:", userId);
        // console.log("🧪 Test ID:", testId);
        // console.log("❓ Problem ID:", problemId);
        // ✅ Validate presence and type
        if (!testId || !problemId) {
            // console.warn("⚠️ Missing testId or problemId in request");
            return res.status(400).json({ message: "Missing testId or problemId" });
        }
        // ✅ Ensure both are valid MongoDB ObjectIds
        if (!mongoose_1.default.Types.ObjectId.isValid(testId)) {
            // console.warn("⚠️ Invalid testId format:", testId);
            return res.status(400).json({ message: "Invalid testId format" });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(problemId)) {
            // console.warn("⚠️ Invalid problemId format:", problemId);
            return res.status(400).json({ message: "Invalid problemId format" });
        }
        // ✅ Fetch the problem from DB
        // console.log("🔍 Searching for problem in DB...");
        const problem = yield ProblemModel_1.ProblemModel.findOne({
            _id: problemId,
            testId: new mongoose_1.default.Types.ObjectId(testId),
        });
        if (!problem) {
            // console.warn("❌ Problem not found for given testId and problemId");
            return res.status(404).json({ message: "Problem not found" });
        }
        console.log("✅ Problem found:", problem.title);
        // ✅ Fetch markdown content from S3
        // console.log("📡 Fetching markdown content from S3...");
        const markdownContent = yield (0, s3GetCode_1.getS3DataFromUrl)(problem.markdownUrl);
        console.log("✅ Successfully fetched markdown from S3");
        return res.status(200).json({
            title: problem.title,
            markdownContent,
        });
    }
    catch (error) {
        console.error("❌ Error in GetUserMarkdownHandler:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
});
exports.GetUserMarkdownHandler = GetUserMarkdownHandler;
GetUserMarkdownRouter.post("/", UserAuthMiddleware_1.UserAuthMiddleware, exports.GetUserMarkdownHandler);
exports.default = GetUserMarkdownRouter;
