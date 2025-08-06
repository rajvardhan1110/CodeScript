const express = require("express");
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");
const GetQuestionRouter = express.Router();
const QuestionModel = require("../models/QuestionModel");

async function GetQuestionHandler(req, res) {
    try {
        const { questionId } = req.body;

        if (!questionId) {
            return res.status(400).json({ msg: "questionId is required" });
        }

        const question = await QuestionModel.findById(questionId).select("questionText testId options marks");

        if (!question) {
            return res.status(404).json({ msg: "Question not found" });
        }
        console.log("inside fetch question admin");

        res.status(200).json({
            questionText: question.questionText,
            testId: question.testId,
            options: question.options,
            marks: question.marks
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Server error" });
    }
}

GetQuestionRouter.post("/", AdminAuthMiddleware, GetQuestionHandler);

module.exports = {
    GetQuestionRouter
};
