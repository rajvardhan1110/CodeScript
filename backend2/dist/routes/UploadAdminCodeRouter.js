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
exports.UploadAdminCodeHandler = void 0;
const express_1 = __importDefault(require("express"));
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const s3uploadAdminCode_1 = require("../utils/s3uploadAdminCode");
const ProblemModel_1 = require("../models/ProblemModel");
const UploadAdminCodeRouter = express_1.default.Router();
const UploadAdminCodeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, language_id, testId, problemId } = req.body;
        const adminId = req.examTakerId;
        // Validate required fields
        if (!code || !language_id || !testId || !problemId || !adminId) {
            return res.status(400).json({ msg: "code, language_id, testId, problemId, and admin token are required" });
        }
        const s3Key = `${testId}/${problemId}/AdminCode`;
        let adminCodeUrl;
        // Step 1: Upload to S3
        try {
            adminCodeUrl = yield (0, s3uploadAdminCode_1.uploadStringToS3)(code, s3Key, "text/plain");
        }
        catch (uploadErr) {
            console.error("❌ S3 upload failed:", uploadErr.message || uploadErr);
            return res.status(500).json({ msg: "Failed to upload admin code to S3" });
        }
        // Step 2: Save URL in ProblemModel
        const updatedProblem = yield ProblemModel_1.ProblemModel.findByIdAndUpdate(problemId, { AdminCode: adminCodeUrl,
            language: language_id
        }, { new: true });
        console.log(updatedProblem);
        if (!updatedProblem) {
            return res.status(404).json({ msg: "Problem not found to update" });
        }
        return res.status(200).json({
            msg: "✅ Admin code uploaded and saved successfully",
            adminCodeUrl,
        });
    }
    catch (error) {
        console.error("❌ Error in UploadAdminCodeHandler:", error.message || error);
        return res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
});
exports.UploadAdminCodeHandler = UploadAdminCodeHandler;
UploadAdminCodeRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.UploadAdminCodeHandler);
exports.default = UploadAdminCodeRouter;
