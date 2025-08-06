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
exports.GetUserTestProblemsHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const TestCodeModel_1 = require("../models/TestCodeModel");
const UserAuthMiddleware_1 = require("../Middleware/UserAuthMiddleware");
const GetUserTestProblemsRouter = express_1.default.Router();
const GetUserTestProblemsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { testId } = req.body;
    console.log(testId);
    // ✅ Validate testId as ObjectId
    if (!testId || !mongoose_1.default.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ msg: "Invalid or missing testId" });
    }
    try {
        const test = yield TestCodeModel_1.TestCodeModel.findOne({ testId: new mongoose_1.default.Types.ObjectId(testId) }).populate({
            path: "problems",
            select: "_id title",
        });
        if (!test) {
            return res.status(404).json({ msg: "Test not found" });
        }
        const problems = test.problems.map((problem) => ({
            _id: problem._id,
            title: problem.title,
        }));
        return res.status(200).json({
            msg: "Fetched test problems successfully",
            problems,
        });
    }
    catch (error) {
        console.error("❌ Error in GetUserTestProblemsHandler:", error);
        return res.status(500).json({
            msg: "Failed to fetch test problems",
            error: error.message,
        });
    }
});
exports.GetUserTestProblemsHandler = GetUserTestProblemsHandler;
GetUserTestProblemsRouter.post("/", UserAuthMiddleware_1.UserAuthMiddleware, exports.GetUserTestProblemsHandler);
exports.default = GetUserTestProblemsRouter;
