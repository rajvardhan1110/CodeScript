const express = require("express");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const StudentResultRouter = express.Router();
const TestModel = require("../models/TestModel");
const QuestionModel = require("../models/QuestionModel");
const LiveResponseModel = require("../models/LiveResponseModel");
const TestResultModel = require("../models/TestResultModel");
const SubmissionHistoryModel = require("../models/SubmissionHistoryModel");

async function StudentResultHandler(req, res) {
    try {
        const userId = req.userId;
        const testId = req.body.testId;

        // 1. Get the test
        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ msg: "Test not found" });
        }

        // 2. Get user's live objective/MCQ responses
        const liveResponse = await LiveResponseModel.findOne({ testId, userId });
        if (!liveResponse) {
            return res.status(404).json({ msg: "No responses found" });
        }

        // 3. Evaluate objective questions and sum those marks
        let totalMarks = 0;
        const updatedResponses = [];
        for (const resObj of liveResponse.response) {
            const question = await QuestionModel.findById(resObj.questionId);
            if (!question) continue;
            const correctAnswerId = question.correctAnswer.toString();
            const selectedOptionId = resObj.optionId.toString();
            const isCorrect = selectedOptionId === correctAnswerId;

            const responseObj = {
                questionId: resObj.questionId,
                optionId: resObj.optionId,
                correctAnswer: question.correctAnswer,
                status: isCorrect ? 'correct' : 'wrong',
                marks: isCorrect ? question.marks : 0
            };

            if (isCorrect) {
                totalMarks += question.marks;
            }

            updatedResponses.push(responseObj);
        }

        // 4. Calculate coding marks ONLY for TestResultModel (do NOT update liveResponse.response)
        let codingMarks = 0;
        const codingProblemsCounted = new Set();
        const submissionHistory = await SubmissionHistoryModel.findOne({ userId });

        if (submissionHistory) {
            // For each coding submission in this test:
            for (const sub of submissionHistory.submissions) {
                if (!sub.testId || !sub.problemId || !sub.verdict) continue; // safety check

                if (
                    sub.testId.toString() === testId.toString() &&
                    sub.verdict === "All test cases passed"
                ) {
                    const probIdStr = sub.problemId.toString();
                    if (!codingProblemsCounted.has(probIdStr)) {
                        codingProblemsCounted.add(probIdStr);
                        if (typeof sub.marks === "number") {
                            codingMarks += sub.marks;
                        }
                    }
                }
            }

        }


        const finalMarks = totalMarks + codingMarks;

        // 5. Update only total marks in liveResponse (optional, not per-question/coding)
        liveResponse.totalMarks = finalMarks;
        liveResponse.response = updatedResponses;
        await liveResponse.save();

        // 6. Upsert the test result for this user and test, including coding marks
        let testResult = await TestResultModel.findOne({ testId });

        if (!testResult) {
            testResult = new TestResultModel({
                testId,
                response: [{
                    userId,
                    marks: totalMarks,      // objective marks
                    codingmarks: codingMarks // coding marks
                }]
            });
        } else {
            const existingIndex = testResult.response.findIndex(r => r.userId.toString() === userId.toString());
            if (existingIndex === -1) {
                testResult.response.push({ userId, marks: totalMarks, codingmarks: codingMarks });
            } else {
                testResult.response[existingIndex].marks = totalMarks;
                testResult.response[existingIndex].codingmarks = codingMarks;
            }
        }
        await testResult.save();

        // 7. Respond with both objective and coding marks, with details of only objective questions
        res.status(200).json({
            msg: "Result calculated successfully",
            totalMarks: finalMarks,
            objectiveMarks: totalMarks,
            codingMarks: codingMarks,
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
