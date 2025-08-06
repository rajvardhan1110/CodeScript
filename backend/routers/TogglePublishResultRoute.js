const express = require("express");
const TogglePublishResultRouter = express.Router();
const TestModel = require("../models/TestModel");
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");

async function TogglePublishResultHandler(req, res) {
    try {
        const { testId } = req.body;

        const test = await TestModel.findById(testId);
        if (!test) {
            return res.status(404).json({ msg: "Test not found" });
        }

        if (!test.testTime || !test.totalTime) {
            return res.status(400).json({ msg: "Test time or duration not set." });
        }

        const testStart = new Date(test.testTime);
        const testEnd = new Date(testStart.getTime() + test.totalTime * 60000);

        if (new Date() < testEnd) {
            return res.status(400).json({ msg: "Test is not yet over. Cannot publish results now." });
        }

        test.publishResult = !test.publishResult;
        await test.save();

        res.json({
            msg: `Result ${test.publishResult ? "published" : "unpublished"} successfully`,
            test
        });

    } catch (e) {
        console.error("Error in TogglePublishResultHandler:", e);
        res.status(500).json({ msg: "Internal server error" });
    }
}

TogglePublishResultRouter.post("/", AdminAuthMiddleware, TogglePublishResultHandler);

module.exports = {
    TogglePublishResultRouter
};
