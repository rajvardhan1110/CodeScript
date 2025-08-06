const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const {z} = require("zod");
const bcrypt = require("bcrypt");
const {UserModel} = require("../models/UserModel.js");


const userRouter = express.Router();

userRouter.post("/signup",async function(req,res){
    const zodformat = z.object({
        email: z.string().min(3).max(50).email(),
        password: z.string().min(3).max(50),
        name: z.string()
    })

    const checkformat = zodformat.safeParse(req.body);
    if(!checkformat.success){
        res.json({
            msg :"invalid format",
            error : checkformat.error
        })

        return;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {

        return res.json({ msg: "User already exists" });
        
    }


    const mapPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
        email: email,
        password: mapPassword,
        name: name
    })

    res.json({
        msg: "successfully user signed up"
    })
})

userRouter.post("/signin", async function (req, res) {


    
    const email = req.body.email;
    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(401).json({ msg: "Invalid email" });
    }

    const password = req.body.password;
    const checkpassword = await bcrypt.compare(password, user.password);

    if (!checkpassword) {
        return res.status(401).json({ msg: "Incorrect password" });
    }

    const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET
    );

    console.log("tg");
    res.json({ token });
    console.log("tp");    

    
});


module.exports = {
    userRouter
};