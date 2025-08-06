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
exports.GetUserCodeHandler = void 0;
const express_1 = __importDefault(require("express"));
const UserAuthMiddleware_1 = require("../Middleware/UserAuthMiddleware");
const s3GetUserCode_1 = require("../utils/s3GetUserCode");
const GetUserCodeRouter = express_1.default.Router();
const GetUserCodeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { testId, problemId } = req.body;
        const userId = req.userId;
        if (!testId || !problemId || !userId) {
            return res.status(400).json({ msg: "testId, problemId, and token are required" });
        }
        const s3Key = `${testId}/${problemId}/${userId}`;
        try {
            const { code, language_id } = yield (0, s3GetUserCode_1.getUserCodeFromS3)(s3Key);
            return res.status(200).json({
                msg: "✅ Code fetched successfully",
                code,
                language_id,
            });
        }
        catch (err) {
            // If object not found, fallback
            if (err.name === "NoSuchKey" || ((_a = err.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode) === 404) {
                return res.status(200).json({
                    msg: "Code not found",
                    code: "",
                    language_id: 54,
                });
            }
            // Other errors
            console.error("❌ Unexpected error:", err.message || err);
            return res.status(500).json({ msg: "Internal Server Error" });
        }
    }
    catch (err) {
        console.error("❌ Handler crashed:", err.message || err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
});
exports.GetUserCodeHandler = GetUserCodeHandler;
GetUserCodeRouter.post("/", UserAuthMiddleware_1.UserAuthMiddleware, exports.GetUserCodeHandler);
exports.default = GetUserCodeRouter;
