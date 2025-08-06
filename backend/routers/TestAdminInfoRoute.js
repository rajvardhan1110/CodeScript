const express = require('express');
const TestAdmiInfoRouter = express.Router();
const TestModel = require('../models/TestModel');
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");


async function TestAdminInfoHandler(req, res) {
  try {
    const examTakerId = req.examTakerId; 
    const testId = req.body.testId;

    if (!testId) {
      return res.status(400).json({ error: "Missing testId in request body" });
    }

   
    const test = await TestModel.findOne({
      _id: testId,
      examTakerId: examTakerId
    }) 

    if (!test) {
      return res.status(404).json({ error: "Test not found or unauthorized access" });
    }

    return res.status(200).json({ test });

  } catch (e) {
    console.error("Error in TestAdminInfoHandler:", e);
    return res.status(500).json({
      error: "Internal Server Error",
      message: e.message,
    });
  }
}


TestAdmiInfoRouter.post('/', AdminAuthMiddleware, TestAdminInfoHandler);

module.exports = {
  TestAdmiInfoRouter
};
