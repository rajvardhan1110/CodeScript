const express = require('express');
const AdminModel = require('../models/AdminModel');
const QuestionModel = require('../models/QuestionModel');
const TestModel = require('../models/TestModel');
const { AdminAuthMiddleware } = require('../Middleware/AdminAuthMiddleware');
const DeleteQuestionRouter = express.Router();

async function DeleteQuestionHandler(req, res) {
    try {
        const { testId, questionId } = req.body;

        // Step 1: Fetch the question first to get its marks
        const questionToDelete = await QuestionModel.findById(questionId);
        if (!questionToDelete) {
            return res.status(404).json({ msg: "Question not found" });
        }

        const questionMarks = questionToDelete.marks || 0;

        // Step 2: Delete the question
        const deletedQuestion = await QuestionModel.findByIdAndDelete(questionId);

        // Step 3: Update the test - remove question and subtract marks
        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ msg: "Test not found" });
        }

        // Remove question ID from test.questions
        test.questions = test.questions.filter(qId => qId.toString() !== questionId);

        // Subtract the marks of the deleted question from totalMarks
        test.totalMarks = Math.max((test.totalMarks || 0) - questionMarks, 0); // Avoid negative marks

        await test.save();

        res.json({
            msg: "Question deleted and test updated successfully",
            deletedQuestion,
            updatedTest: test
        });

    } catch (e) {
        console.error("Error in DeleteQuestionRouteHandler:", e);
        res.status(500).json({
            msg: "Error deleting question",
            error: e.message
        });
    }
}


DeleteQuestionRouter.post('/', AdminAuthMiddleware, DeleteQuestionHandler);

module.exports = {
    DeleteQuestionRouter
};
