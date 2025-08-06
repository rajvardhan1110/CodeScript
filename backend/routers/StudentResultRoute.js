const express = require("express");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const StudentResultRouter = express.Router();
const TestModel = require("../models/TestModel");
const QuestionModel = require("../models/QuestionModel");
const LiveResponseModel = require("../models/LiveResponseModel");
const TestResultModel = require("../models/TestResultModel")

async function StudentResultHandler(req, res) {
    try {
        const userId = req.userId;
        const testId = req.body.testId;

        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ msg: "Test not found" });
        }

        const liveResponse = await LiveResponseModel.findOne({ testId, userId });
        if (!liveResponse) {
            return res.status(404).json({ msg: "No responses found" });
        }

        let totalMarks = 0;
        const updatedResponses = [];

        for (const res of liveResponse.response) {
            const question = await QuestionModel.findById(res.questionId);
            if (!question) continue;

            const correctAnswerId = question.correctAnswer.toString();
            const selectedOptionId = res.optionId.toString();

            const isCorrect = selectedOptionId === correctAnswerId;
            const responseObj = {
                questionId: res.questionId,
                optionId: res.optionId,
                correctAnswer: question.correctAnswer,
                status: isCorrect ? 'correct' : 'wrong',
                marks: isCorrect ? question.marks : 0
            };

            if (isCorrect) {
                totalMarks += question.marks;
            }

            updatedResponses.push(responseObj);
        }

        liveResponse.totalMarks = totalMarks;
        liveResponse.response = updatedResponses;
        await liveResponse.save();

      

        let testResult = await TestResultModel.findOne({ testId });

        if (!testResult) {
            
            testResult = new TestResultModel({
                testId,
                response: [{
                    userId,
                    marks: totalMarks
                }]
            });
        } else {
           
            const existingIndex = testResult.response.findIndex(r => r.userId.toString() === userId.toString());

            if (existingIndex === -1) {
                
                testResult.response.push({ userId, marks: totalMarks });
            } else {
                
                testResult.response[existingIndex].marks = totalMarks;
            }
        }

        await testResult.save();


        res.status(200).json({
            msg: "Result calculated successfully",
            totalMarks,
            responses: updatedResponses
        });

    } catch (e) {
        console.error("Error in StudentResultHandler:", e);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

StudentResultRouter.post("/", UserAuthMiddleware, StudentResultHandler);
module.exports = {
    StudentResultRouter
};
