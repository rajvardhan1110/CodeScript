const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");
const { checkTest } = require("../Middleware/checkTest");
const QuestionModel = require("../models/QuestionModel");
const TestModel = require("../models/TestModel");
const createQuestionRouter = express.Router();

async function createQuestionHandler(req, res) {

    try {
        const examTakerId = req.examTakerId;

        const testId = req.body.testId;
        const questionText = req.body.questionText;
        const options = req.body.options;
        const correctAnswerText = req.body.correctAnswerText;
        const marks = req.body.marks;

        if (!testId || !questionText || !options || !correctAnswerText) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const mappedOptions = options.map(opt => ({
            _id: new mongoose.Types.ObjectId(),
            text: opt.text
        }));

        const correctOpt = mappedOptions.find(opt => opt.text === correctAnswerText);
        if (!correctOpt) {
            return res.status(400).json({ error: 'Correct answer text not found in options' });
        }



        const question = await QuestionModel.create({
            examTakerId,
            testId,
            questionText,
            options: mappedOptions,
            correctAnswer: correctOpt._id,
            marks
        });

        const test = await TestModel.findById(testId);

        const questionMarks = Number(marks) || 1;
        const oldMarks = test.totalMarks || 0;

        const newTotalMarks = oldMarks + questionMarks;

        test.questions = test.questions || [];
        test.questions.push(question._id);

        test.totalMarks = newTotalMarks;
        await test.save();

        res.status(201).json({
            msg: "question add successfully",
            question
        });

    } catch (e) {
        console.log("error in createQuestion route");
        res.status(500).json({ error: e.message });
    }


}

createQuestionRouter.post("/", AdminAuthMiddleware, checkTest, createQuestionHandler);

module.exports = {
    createQuestionRouter
};