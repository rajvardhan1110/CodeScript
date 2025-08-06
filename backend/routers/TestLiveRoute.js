const express = require("express");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const TestModel = require("../models/TestModel");
const TestLiveRouter = express.Router();

async function TestLiveHandler(req, res) {
    try {
        const userId = req.userId;
        const testId = req.query.testId;

        const test = await TestModel.findById(testId);

        if (!test) {
            return res.status(404).json({ msg: "Test is not available" });
        }

        // ❌ Check if user is not in the allowed students list
        const isStudentAllowed = test.students.some(
            (studentId) => studentId.toString() === userId
        );

        if (!isStudentAllowed) {
            return res.status(403).json({ msg: "You are not allowed to see this test" });
        }

        // ❌ If testTime or totalTime is missing, treat as unavailable
        if (!test.testTime || !test.totalTime) {
            return res.status(403).json({ msg: "Test cannot be opened" });
        }

        const currentTime = new Date();
        const startTime = new Date(test.testTime);
        const endTime = new Date(startTime.getTime() + test.totalTime * 60 * 1000); // in ms

        if (currentTime < startTime || currentTime > endTime) {
            return res.status(403).json({ msg: "Test cannot be opened" });
        }

        // ✅ Valid request — allow access
        res.json({ test });

    } catch (e) {
        console.error("Error in TestLiveHandler:", e);
        res.status(500).json({ msg: "Server error" });
    }
}

TestLiveRouter.get("/", UserAuthMiddleware, TestLiveHandler);

module.exports = {
    TestLiveRouter
};
