const express = require('express');
const { AdminAuthMiddleware } = require('../Middleware/AdminAuthMiddleware');
const FinaliseTestRouter = express.Router();
const TestModel = require('../models/TestModel')


async function FinaliseTestHandler(req, res) {
  try {
    const { testId } = req.body;

    if (!testId) {
      return res.status(400).json({ msg: "testId is required" });
    }

    const test = await TestModel.findById(testId);

    if (!test) {
      return res.status(404).json({ msg: "Test not found" });
    }

    const newPhase = test.examTakerPhase === 'draft' ? 'finalized' : 'draft';

    test.examTakerPhase = newPhase;
    await test.save();

    res.status(200).json({ msg: `Test ${newPhase === 'finalized' ? 'finalized' : 'set to draft'} successfully`, test });

  } catch (e) {
    console.error("Error updating examTakerPhase:", e);
    res.status(500).json({ msg: "Server error while updating examTakerPhase" });
  }
}



FinaliseTestRouter.patch("/",AdminAuthMiddleware,FinaliseTestHandler);


module.exports = {
    FinaliseTestRouter
};