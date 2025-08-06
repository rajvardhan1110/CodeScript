const express = require("express");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const LiveResponseModel = require("../models/LiveResponseModel");

const AttemptedQuestionsRouter = express.Router();

async function AttemptedQuestionsHandler(req, res) {
    try {
        const userId = req.userId;
        const { testId } = req.query;

        if (!testId) {
            return res.status(400).json({ msg: "testId is required" });
        }

        const liveResponse = await LiveResponseModel.findOne({ userId, testId });

        if (!liveResponse) {
            return res.status(200).json({ attempted: [] });
        }

        const attemptedQIDs = liveResponse.response.map(r => r.questionId.toString());

        res.status(200).json({ attempted: attemptedQIDs });

    } catch (err) {
        console.error("Error fetching attempted questions:", err);
        res.status(500).json({ msg: "Server error" });
    }
}

AttemptedQuestionsRouter.get("/", UserAuthMiddleware, AttemptedQuestionsHandler);

module.exports = {
    AttemptedQuestionsRouter
};
