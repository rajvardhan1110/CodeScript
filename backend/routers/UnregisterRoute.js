const express = require("express");
const UnregisterRouter = express.Router();
const TestModel = require("../models/TestModel");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");

async function UnregisterHandler(req, res) {
    try {
        const userId = req.userId;
        const testId = req.body.testId;

        const test = await TestModel.findById(testId);

        if (!test) {
            return res.status(404).json({ msg: "Test is not available" });
        }

        
        await TestModel.findByIdAndUpdate(testId, {
            $pull: { students: userId }
        });

        res.json({ msg: "Unregistered successfully" });

    } catch (e) {
        console.error(e);
        console.log("error in the RegisterRouter");
        res.status(500).json({ msg: "Internal server error" });
    }
}


UnregisterRouter.post("/",UserAuthMiddleware,UnregisterHandler);

module.exports = {
    UnregisterRouter
}