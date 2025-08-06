const express = require('express');
const { AdminAuthMiddleware } = require('../Middleware/AdminAuthMiddleware');
const DeleteTestRouter = express.Router();
const TestModel = require('../models/TestModel');
const QuestionModel = require('../models/QuestionModel'); 

async function DeleteTestHandler(req, res) {
    try {
        const { testId } = req.body;

        const deletedTest = await TestModel.findByIdAndDelete(testId);

        if (!deletedTest) {
            return res.status(404).json({ msg: "Test not found" });
        }

       
        await QuestionModel.deleteMany({ testId });

        res.json({ msg: "Test and associated questions deleted successfully", deletedTest });

    } catch (e) {
        console.error("Error in DeleteTestRouteHandler:", e);
        res.status(500).json({ msg: "Error deleting test", error: e.message });
    }
}

DeleteTestRouter.delete('/', AdminAuthMiddleware, DeleteTestHandler);

module.exports = {
    DeleteTestRouter
};
