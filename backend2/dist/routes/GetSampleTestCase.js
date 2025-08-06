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
exports.GetSampleTestCase = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const ProblemModel_1 = require("../models/ProblemModel");
const s3GetCode_1 = require("../utils/s3GetCode");
const UserAuthMiddleware_1 = require("../Middleware/UserAuthMiddleware");
const GetSampleTestCaseRouter = express_1.default.Router();
const GetSampleTestCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { problemId } = req.body;
        // ✅ Validate ObjectId
        if (!problemId || !mongoose_1.default.Types.ObjectId.isValid(problemId)) {
            return res.status(400).json({ message: "Missing or invalid problemId" });
        }
        const problemObjectId = new mongoose_1.default.Types.ObjectId(problemId);
        // Find the problem
        const problem = yield ProblemModel_1.ProblemModel.findById(problemObjectId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        const { sampleTestCases, testId, _id: probId } = problem;
        const results = yield Promise.all(sampleTestCases.map((testCase) => __awaiter(void 0, void 0, void 0, function* () {
            const inputKey = `${testId}/${probId}/input/${testCase._id}`;
            const outputKey = `${testId}/${probId}/output/${testCase._id}`;
            const inputUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${inputKey}`;
            const outputUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${outputKey}`;
            const [input, output] = yield Promise.all([
                (0, s3GetCode_1.getS3DataFromUrl)(inputUrl),
                (0, s3GetCode_1.getS3DataFromUrl)(outputUrl),
            ]);
            return {
                _id: testCase._id,
                input,
                output,
            };
        })));
        return res.status(200).json({ sampleTestCases: results });
    }
    catch (error) {
        console.error("❌ Error in GetSampleTestCase:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
exports.GetSampleTestCase = GetSampleTestCase;
GetSampleTestCaseRouter.post("/", UserAuthMiddleware_1.UserAuthMiddleware, exports.GetSampleTestCase);
exports.default = GetSampleTestCaseRouter;
