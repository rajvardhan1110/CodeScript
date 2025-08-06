const express = require("express");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const mongoose = require("mongoose");
const TestResult = require("../models/TestResultModel");

const TestSubmissionCheckRouter = express.Router();

async function CheckSubmissionHandler(req, res) {
    try {
        const userId = req.userId; // From UserAuthMiddleware
        const testId = req.query.testId;

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ success: false, msg: "Invalid testId" });
        }

        const result = await TestResult.findOne({
            testId,
            response: { $elemMatch: { userId: new mongoose.Types.ObjectId(userId) } }
        });

        if (result) {
            return res.json({ submitted: true });
        } else {
            return res.json({ submitted: false });
        }
    } catch (error) {
        console.error("Error in CheckSubmissionHandler:", error);
        return res.status(500).json({ submitted: false, msg: "Server error" });
    }
}

TestSubmissionCheckRouter.get("/", UserAuthMiddleware, CheckSubmissionHandler);

module.exports = {
    TestSubmissionCheckRouter
};
