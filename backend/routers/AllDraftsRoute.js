const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TestModel = require('../models/TestModel');
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");
const allDraftsRouter = express.Router();

async function allDraftsHandler(req, res) {

    try {
        const examTakerId = req.examTakerId;
        const alltests = await TestModel.find({examTakerId});

        return res.status(200).json({
            msg : "done",
            alltests
        })


    } catch (e) {
        console.log("error in allDraftHandler");
        res.status(400).json({
            error : e
        })
    }

}

allDraftsRouter.get('/', AdminAuthMiddleware, allDraftsHandler);

module.exports = {
    allDraftsRouter
};