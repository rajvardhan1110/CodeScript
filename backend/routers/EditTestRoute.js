const express = require('express');
const { AdminAuthMiddleware } = require('../Middleware/AdminAuthMiddleware');
const EditTestRouter = express.Router();
const TestModel = require('../models/TestModel')


async function EditTestHandler(req, res) {
  try {
    const { testId, title, description, testTime, totalTime } = req.body;

    const test = await TestModel.findById(testId);

    if (!test) {
      return res.status(404).json({ msg: "Test not found" });
    }

    if (title) test.title = title;
    if (description) test.description = description;
    if (testTime) test.testTime = new Date(testTime); 
    if (totalTime) test.totalTime = totalTime;

    await test.save();

    res.json({ msg: "Test updated successfully", test });
  } catch (e) {
    console.error("Error in EditTestRouteHandler:", e);
    res.status(500).json({
      msg: "Error in EditTestRouteHandler",
      error: e.message,
    });
  }
}


EditTestRouter.patch("/",AdminAuthMiddleware,EditTestHandler);


module.exports = {
    EditTestRouter
};