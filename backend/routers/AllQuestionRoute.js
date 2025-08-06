const express = require('express');
const allQuestionRouter = express.Router();
const mongoose = require('mongoose');
const TestModel = require('../models/TestModel');
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");

async function allQuestionHandler(req, res) {
    try {
        const examTakerId = req.examTakerId;
        const testId = req.body.testId;

        if (!testId) {
            return res.status(400).json({ error: "testId is required in the request body." });
        }

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ error: "Invalid testId format." });
        }

        const test = await TestModel.findById(testId).select("questions");

        if (!test) {
            return res.status(404).json({ error: "Test not found." });
        }

        return res.status(200).json({
            success: true,
            questions: test.questions
        });

    } catch (error) {
        console.error("Error in allQuestionHandler:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}

allQuestionRouter.post('/', AdminAuthMiddleware, allQuestionHandler);

module.exports = {
    allQuestionRouter
};
