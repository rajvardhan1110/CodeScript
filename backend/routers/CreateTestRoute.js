const express = require("express");
const createTestRouter = express.Router();
const TestModel = require("../models/TestModel");
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");

const createTesthandler = async (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const examTakerId = req.examTakerId;

    console.log("Incoming test creation request");
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("examTakerId from middleware:", examTakerId);

    if (!title) {
        console.log("Missing title in request");
        return res.status(404).json({
            msg: "Fill the Test name"
        });
    }

    try {
        const test = await TestModel.create({
            examTakerId: examTakerId,
            title: title,
            description: description
        });

        console.log("Test created with ID:", test._id);

        return res.json({
            testid: test._id,
            msg: "test create successfully"
        });

    } catch (e) {
        console.error("Error in createTesthandler:", e);
        res.status(404).json({
            msg: "error in create test handler",
            error: e
        });
    }
};

createTestRouter.post("/", AdminAuthMiddleware, createTesthandler);

module.exports = {
    createTestRouter
};
