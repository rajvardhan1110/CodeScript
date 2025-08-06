const express = require("express");
const mongoose = require("mongoose");
const { Parser } = require("json2csv");
const { UserModel } = require("../models/UserModel");
const TestModel = require("../models/TestModel");
const TestResultModel = require("../models/TestResultModel");
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");

const ExportResultRouter = express.Router();

async function ExportResultHandler(req, res) {
    try {
        const testId = req.query.testId;

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ msg: "Invalid test ID" });
        }

        const test = await TestModel.findById(testId);
        if (!test) return res.status(404).json({ msg: "Test not found" });

        const testStart = new Date(test.testTime);
        const testEnd = new Date(testStart.getTime() + test.totalTime * 60000);
        const now = new Date();

        if (now < testEnd) {
            return res.status(400).json({ msg: "Test is not yet over. Try again later." });
        }

        const testResult = await TestResultModel.findOne({ testId });
        if (!testResult || !testResult.response || testResult.response.length === 0) {
            return res.status(404).json({ msg: "No responses found for this test." });
        }

        const userIds = testResult.response.map(r => r.userId);
        const users = await UserModel.find({ _id: { $in: userIds } }).select("name email");

        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = {
                name: user.name || "Unknown",
                email: user.email || "Unknown"
            };
        });

        const csvData = testResult.response.map(resp => ({
            Name: userMap[resp.userId.toString()]?.name || "Unknown",
            Email: userMap[resp.userId.toString()]?.email || "Unknown",
            Marks: resp.marks ?? 0
        }));

        const fields = ["Name", "Email", "Marks"];
        const json2csv = new Parser({ fields });
        const csvBody = json2csv.parse(csvData);

        const testTitle = test.title || "Untitled Test";
        const testDate = new Date(test.testTime).toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        const totalMarks = test.totalMarks || ""; 

        const heading = `Test Name: ${testTitle}\nTest Date: ${testDate}\nTest Total Marks: ${totalMarks}\n\n`;
        const fullCSV = heading + csvBody;

        const fileName = `${testTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_results.csv`;

        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", "text/csv");
        return res.status(200).send(fullCSV);

    } catch (error) {
        console.error("Error in ExportResultHandler:", error);
        return res.status(500).json({ msg: "Server error" });
    }
}

ExportResultRouter.get("/", AdminAuthMiddleware, ExportResultHandler);

module.exports = {
    ExportResultRouter
};
