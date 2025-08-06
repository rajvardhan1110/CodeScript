const express = require("express");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const StudentResponseRouter = express.Router();
const LiveResponseModel = require("../models/LiveResponseModel");

async function StudentResponseHandler(req, res) {
  try {
    const userId = req.userId;
    const { testId, questionId, optionId } = req.body;

    if (!testId || !questionId || !optionId) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    let doc = await LiveResponseModel.findOne({ testId, userId });

    if (!doc) {
      
      doc = new LiveResponseModel({
        testId,
        userId,
        response: [{ questionId, optionId }]
      });
    } else {
     
      const existingResponse = doc.response.find(r =>
        r.questionId.toString() === questionId.toString()
      );

      if (existingResponse) {
       
        existingResponse.optionId = optionId;
      } else {
        
        doc.response.push({ questionId, optionId });
      }
    }

    await doc.save();
    return res.status(200).json({ msg: "Response saved", data: doc });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

StudentResponseRouter.post("/", UserAuthMiddleware, StudentResponseHandler);

module.exports = {
    StudentResponseRouter
};
