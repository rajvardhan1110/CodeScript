const testSchema = require("../models/TestModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

async function checkTest(req,res,next){
    const testId = req.body.testId;

    const existTest = await testSchema.findById(testId);
    

    if(!existTest){
        return res.status(404).json({ error: 'Test ID not found' });
    }else{
        console.log("test is exist");
        next();
    }
}

module.exports = {
    checkTest,
};