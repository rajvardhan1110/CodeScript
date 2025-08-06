const express = require("express");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const QuestionModel = require("../models/QuestionModel");
const LiveResponseModel = require("../models/LiveResponseModel");

const LiveQuestionRouter = express.Router();

async function LiveQuestionHandler(req, res) {
    try {
        const userId = req.userId;
        const { questionId, testId } = req.body;

        if (!questionId || !testId) {
            return res.status(400).json({ msg: "questionId and testId are required" });
        }

        const question = await QuestionModel.findById(questionId);

        if (!question || question.testId.toString() !== testId) {
            return res.status(404).json({ msg: "Question not found for this test" });
        }

        const liveResponse = await LiveResponseModel.findOne({ userId, testId });
        let selectedOption = null;

        if (liveResponse) {
            const match = liveResponse.response.find(
                r => r.questionId.toString() === questionId
            );
            if (match) selectedOption = match.optionId;
        }

        res.status(200).json({
            question: {
                _id: question._id,
                questionText: question.questionText,
                options: question.options.map(opt => ({
                    _id: opt._id,
                    text: opt.text
                }))
            },
            userAnswer: selectedOption
        });

    } catch (err) {
        console.error("Error fetching question:", err);
        res.status(500).json({ msg: "Server error" });
    }
}

LiveQuestionRouter.post("/", UserAuthMiddleware, LiveQuestionHandler);

module.exports = {
    LiveQuestionRouter
};
