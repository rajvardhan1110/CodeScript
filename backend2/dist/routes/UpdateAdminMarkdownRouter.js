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
exports.UpdateAdminMarkdownHandler = void 0;
const express_1 = __importDefault(require("express"));
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const ProblemModel_1 = require("../models/ProblemModel");
const s3Utils_1 = require("../utils/s3Utils");
const mongoose_1 = __importDefault(require("mongoose"));
const UpdateAdminMarkdownRouter = express_1.default.Router();
const UpdateAdminMarkdownHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { testId, problemId, markdownContent } = req.body;
        // Input validation
        if (!testId ||
            !problemId ||
            !markdownContent ||
            typeof testId !== "string" ||
            typeof problemId !== "string" ||
            typeof markdownContent !== "string") {
            return res.status(400).json({ message: "Invalid input fields" });
        }
        // Check valid ObjectId format
        if (!mongoose_1.default.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid testId" });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ message: "Invalid problemId" });
        }
        // Convert to ObjectId
        const testIdObj = new mongoose_1.default.Types.ObjectId(testId);
        const problemIdObj = new mongoose_1.default.Types.ObjectId(problemId);
        // Find problem by _id and testId
        const problem = yield ProblemModel_1.ProblemModel.findOne({ _id: problemIdObj, testId: testIdObj });
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        // Extract S3 key from existing URL
        const existingUrl = problem.markdownUrl;
        const urlParts = existingUrl.split(".com/");
        const s3Key = urlParts[1]; // everything after .com/
        // Overwrite existing markdown at same S3 key
        yield (0, s3Utils_1.uploadStringToS3)(markdownContent, s3Key);
        return res.status(200).json({
            message: "Markdown updated successfully",
            markdownUrl: existingUrl,
        });
    }
    catch (error) {
        console.error("Error in UpdateAdminMarkdownHandler:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
exports.UpdateAdminMarkdownHandler = UpdateAdminMarkdownHandler;
UpdateAdminMarkdownRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.UpdateAdminMarkdownHandler);
exports.default = UpdateAdminMarkdownRouter;
