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
exports.CreateTestCodeHandler = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const s3Utils_1 = require("../utils/s3Utils");
const ProblemModel_1 = require("../models/ProblemModel");
const TestCodeModel_1 = require("../models/TestCodeModel");
const CreateTestCodeRouter = express_1.default.Router();
const CreateTestCodeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { testId, title, markdown } = req.body;
        const adminId = req.examTakerId;
        console.log(title);
        console.log(markdown);
        if (!testId || !title || !markdown || !adminId || !mongoose_1.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ msg: "Please, Fill All the Details" });
        }
        const testObjectId = new mongoose_1.Types.ObjectId(testId);
        // Step 1: Upload markdown to S3
        const s3Key = `${testId}/${new mongoose_1.Types.ObjectId().toString()}/md`;
        let markdownUrl;
        try {
            markdownUrl = yield (0, s3Utils_1.uploadStringToS3)(markdown, s3Key, "text/markdown");
        }
        catch (uploadErr) {
            console.error("S3 upload failed:", uploadErr);
            return res.status(500).json({ msg: "Failed to upload markdown to S3" });
        }
        // Step 2: Create and save problem
        const newProblem = new ProblemModel_1.ProblemModel({
            title,
            markdownUrl,
            testId: testObjectId,
            createdBy: adminId,
        });
        const problem = yield newProblem.save();
        // Step 3: Add problem to TestCodeModel
        const existingTest = yield TestCodeModel_1.TestCodeModel.findOne({ testId: testObjectId });
        if (existingTest) {
            existingTest.problems.push(problem._id);
            yield existingTest.save();
        }
        else {
            const newTest = new TestCodeModel_1.TestCodeModel({
                testId: testObjectId,
                problems: [problem._id],
            });
            yield newTest.save();
        }
        return res.status(201).json({
            msg: "Markdown uploaded and test problem entry created successfully",
            markdownUrl,
            problemId: problem._id,
        });
    }
    catch (error) {
        console.error("Error in createTestCodeHandler:", error);
        return res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
});
exports.CreateTestCodeHandler = CreateTestCodeHandler;
CreateTestCodeRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.CreateTestCodeHandler);
exports.default = CreateTestCodeRouter;
