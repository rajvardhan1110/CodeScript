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
exports.UploadUserCodeHandler = void 0;
const express_1 = __importDefault(require("express"));
const s3uploadAdminCode_1 = require("../utils/s3uploadAdminCode");
const UserAuthMiddleware_1 = require("../Middleware/UserAuthMiddleware");
const UploadUserCodeRouter = express_1.default.Router();
const UploadUserCodeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, testId, problemId, language_id } = req.body;
        const userId = req.userId;
        console.log("📝 Incoming request to upload user code");
        console.log("Request Body:", { code, testId, problemId, language_id });
        console.log("User ID from token:", userId);
        if (!code || !testId || !problemId || !language_id || !userId) {
            console.warn("⚠️ Missing required fields");
            return res.status(400).json({
                msg: "code, testId, problemId, language_id, and user token are required"
            });
        }
        const s3Key = `${testId}/${problemId}/${userId}`;
        const fileContent = JSON.stringify({ code, language_id });
        console.log("📦 Preparing to upload to S3 with key:", s3Key);
        let userCodeUrl;
        try {
            userCodeUrl = yield (0, s3uploadAdminCode_1.uploadStringToS3)(fileContent, s3Key, "application/json");
            console.log("✅ Successfully uploaded user code to S3:", userCodeUrl);
        }
        catch (err) {
            console.error("❌ S3 upload failed:", err.message || err);
            return res.status(500).json({ msg: "Failed to upload user code to S3" });
        }
        return res.status(200).json({
            msg: "✅ User code and language_id uploaded successfully",
            userCodeUrl,
        });
    }
    catch (error) {
        console.error("❌ Error in UploadUserCodeHandler:", error.message || error);
        return res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
});
exports.UploadUserCodeHandler = UploadUserCodeHandler;
UploadUserCodeRouter.post("/", UserAuthMiddleware_1.UserAuthMiddleware, exports.UploadUserCodeHandler);
exports.default = UploadUserCodeRouter;
