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
exports.CheckTestCodeExistsHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const TestCodeModel_1 = require("../models/TestCodeModel");
const UserAuthMiddleware_1 = require("../Middleware/UserAuthMiddleware");
const CheckTestCodeExistsRouter = express_1.default.Router();
const CheckTestCodeExistsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { testId } = req.body;
        // ✅ Validate testId as ObjectId
        if (!testId || !mongoose_1.default.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Missing or invalid testId" });
        }
        const objectId = new mongoose_1.default.Types.ObjectId(testId);
        const existing = yield TestCodeModel_1.TestCodeModel.findOne({ testId: objectId });
        if (existing) {
            return res.status(200).json({
                exists: true,
                message: "TestCode with this testId already exists.",
                data: existing,
            });
        }
        else {
            return res.status(200).json({
                exists: false,
                message: "No TestCode found for this testId.",
            });
        }
    }
    catch (error) {
        console.error("❌ Error in CheckTestCodeExistsHandler:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
exports.CheckTestCodeExistsHandler = CheckTestCodeExistsHandler;
CheckTestCodeExistsRouter.post("/", UserAuthMiddleware_1.UserAuthMiddleware, exports.CheckTestCodeExistsHandler);
exports.default = CheckTestCodeExistsRouter;
