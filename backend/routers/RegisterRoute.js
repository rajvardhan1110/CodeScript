const express = require("express");
const RegisterRouter = express.Router();
const TestModel = require("../models/TestModel");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");

async function RegisterHandler(req, res) {
    try {
        const userId = req.userId;
        const testId = req.body.testId;

        const test = await TestModel.findById(testId);

        if (!test) {
            return res.status(404).json({ msg: "Test is not available" });
        }

        const alreadyRegistered = test.students.some(studentId => studentId.equals(userId));

        if (alreadyRegistered) {
            return res.status(200).json({ msg: "Student is already registered" });
        }

        test.students.push(userId);
        await test.save();

        res.status(200).json({ msg: "Registered successfully" });

    } catch (e) {
        console.error(e);
        console.log("error in the RegisterRouter");
        res.status(500).json({ msg: "Internal server error" });
    }
}


RegisterRouter.post("/",UserAuthMiddleware,RegisterHandler);

module.exports = {
    RegisterRouter
}