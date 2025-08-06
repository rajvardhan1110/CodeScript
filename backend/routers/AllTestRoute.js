const express = require("express");
const TestModel = require("../models/TestModel");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const AllTestRouter = express.Router();


async function AllTestHandler(req, res) {
    try {
        const userId = req.userId;

        const tests = await TestModel.find(
            { examTakerPhase: "finalized" }, 
            '_id title description totalMarks testTime totalTime'
        );

        const formatted = tests.map(test => ({
            testId: test._id,
            title: test.title,
            description: test.description,
            totalMarks: test.totalMarks,
            date: test.testTime ? test.testTime : "upcoming",
            totalTime : test.totalTime ? test.totalTime : "-"
        }));

        res.json(formatted);

    } catch (e) {
        res.status(500).json({ 
            msg : "error in AllTestRouter",
            error: 'Something went wrong' 
        });
    }
}


AllTestRouter.get("/", UserAuthMiddleware, AllTestHandler);

module.exports = {
    AllTestRouter
}