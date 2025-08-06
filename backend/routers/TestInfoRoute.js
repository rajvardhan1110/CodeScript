const express = require("express");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const TestModel = require("../models/TestModel");
const TestInfoRouter = express.Router();

async function TestInfoHandler(req, res) {
    try {
        const userId = req.userId;
        const testId = req.query.testId;

        const test = await TestModel.findById(testId);

        if (!test) {
            return res.status(404).json({ msg: "Test is not available" });
        }

        if (!test.testTime) {
            return res.json({ 
                msg: "upcoming",
                phase: "upcoming",
                title : test.title,
                description : test.description,
                totalMarks : (test.totalMarks || 0),
                isRegistered: test.students.some(studentId => studentId.equals(userId))
             });
        }

        const now = new Date();
        const testTime = new Date(test.testTime);
        const totalTime = test.totalTime;
        const endTime = new Date(testTime.getTime() + totalTime * 60000);


        if (now < testTime) {

            const alreadyRegistered = test.students.some(studentId => studentId.equals(userId));

            if (alreadyRegistered) {
                return res.status(200).json({
                    msg: "Student is already registered",
                    phase: "upcoming",
                    testTime,
                    totalTime,
                    isRegistered: true,
                    title : test.title,
                    description : test.description,
                    totalMarks : test.totalMarks

                });
            } else {
                return res.status(200).json({
                    msg: "Student is not registered",
                    phase: "upcoming",
                    testTime : testTime,
                    totalTime : totalTime,
                    isRegistered: false,
                    title : test.title,
                    description : test.description,
                    totalMarks : test.totalMarks
                });
            }

        } else if (now >= testTime && now <= endTime) {

            const alreadyRegistered = test.students.some(studentId => studentId.equals(userId));

            if (alreadyRegistered) {
                res.json({
                    test,
                    phase: "running",
                    isRegistered: true
                })
            } else {
                return res.status(200).json({
                    msg: "Student is not registered",
                    phase: "running",
                    isRegistered: false
                });
            }

        } else {
            return res.json({ msg: "over" });
        }

    } catch (e) {
        console.error("Error in TestInfoHandler:", e);
        res.status(500).json({ msg: "Server error" });
    }
}

TestInfoRouter.get("/", UserAuthMiddleware, TestInfoHandler);

module.exports = {
    TestInfoRouter
};
