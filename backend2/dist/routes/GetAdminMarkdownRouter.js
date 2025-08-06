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
exports.GetAdminMarkdownHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const ProblemModel_1 = require("../models/ProblemModel");
const s3GetCode_1 = require("../utils/s3GetCode");
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const GetAdminMarkdownRouter = express_1.default.Router();
const GetAdminMarkdownHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { testId, problemId } = req.body;
        // Validate input types
        if (!testId || !problemId || !mongoose_1.default.Types.ObjectId.isValid(testId) || !mongoose_1.default.Types.ObjectId.isValid(problemId)) {
            return res
                .status(400)
                .json({ message: "Missing or invalid testId or problemId" });
        }
        const testObjectId = new mongoose_1.default.Types.ObjectId(testId);
        const problemObjectId = new mongoose_1.default.Types.ObjectId(problemId);
        // console.log(testObjectId,problemObjectId);
        // Find the matching problem
        const problem = yield ProblemModel_1.ProblemModel.findOne({
            _id: problemObjectId,
            testId: testObjectId,
        });
        if (!problem) {
            console.log("problem not found");
            return res.status(404).json({ message: "Problem not found" });
        }
        // console.log(problem.markdownUrl);
        // Fetch markdown content from S3 using the markdownUrl field
        const markdownContent = yield (0, s3GetCode_1.getS3DataFromUrl)(problem.markdownUrl);
        // console.log(markdownContent);
        // Respond with title and content
        return res.status(200).json({
            title: problem.title,
            markdownContent,
        });
    }
    catch (error) {
        console.error("❌ Error in GetAdminMarkdownHandler:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
exports.GetAdminMarkdownHandler = GetAdminMarkdownHandler;
GetAdminMarkdownRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.GetAdminMarkdownHandler);
exports.default = GetAdminMarkdownRouter;
