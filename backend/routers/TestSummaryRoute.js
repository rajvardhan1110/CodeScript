const express = require("express");
const mongoose = require("mongoose");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const TestModel = require("../models/TestModel");
const TestResultModel = require("../models/TestResultModel");
const QuestionModel = require("../models/QuestionModel");
const LiveResponseModel = require("../models/LiveResponseModel");

const TestSummaryRouter = express.Router();

async function TestSummaryHandler(req, res) {
    try {
        const userId = req.userId;
        const testId = req.query.testId;

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ success: false, msg: "Invalid testId" });
        }

        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ success: false, msg: "Test not found" });
        }

        const reviewAllowed = test.publishResult === true;

        const result = await TestResultModel.findOne({
            testId,
            response: { $elemMatch: { userId } }
        });

        const submitted = !!result;

        // CASE 1: Not submitted and review not allowed
        if (!submitted && !reviewAllowed) {
            return res.json({
                submitted: false,
                reviewAllowed: false,
                show: "notSubmittedNoReview",
                TotalMarks: test.totalMarks,
                testName : test.title,
            });
        }

        // CASE 2: Not submitted but review allowed
        if (!submitted && reviewAllowed) {
            const questions = await QuestionModel.find({ testId }).select("questionText options correctAnswer");
            return res.json({
                submitted: false,
                reviewAllowed: true,
                show: "reviewOnly",
                testName : test.title,
                TotalMarks : test.totalMarks,
                questions

            });
        }

        // CASE 3: Submitted but review not allowed
        if (submitted && !reviewAllowed) {
            return res.json({
                submitted: true,
                reviewAllowed: false,
                show: "submittedNoResult",
                TotalMarks: test.totalMarks,
                testName : test.title,
            });
        }

        // CASE 4: Submitted and review allowed
        const questions = await QuestionModel.find({ testId }).select("questionText options correctAnswer");
        const liveResponse = await LiveResponseModel.findOne({ testId, userId });

        return res.json({
            submitted: true,
            reviewAllowed: true,
            show: "fullReview",
            questions,
            resultData: {
                score: liveResponse.totalMarks,
                response: liveResponse.response,
                testName : test.title,
                TotalMarks : test.totalMarks,
            }
        });

    } catch (error) {
        console.error("Error in TestSummaryHandler:", error);
        return res.status(500).json({ success: false, msg: "Server error" });
    }
}

TestSummaryRouter.get("/", UserAuthMiddleware, TestSummaryHandler);

module.exports = {
    TestSummaryRouter
};
