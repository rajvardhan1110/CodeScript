const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const {z} = require("zod");
const bcrypt = require("bcrypt");
const {AdminModel} = require("../models/AdminModel");


const adminRouter = express.Router();

adminRouter.post("/signup",async function(req,res){
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

    const existingUser = await AdminModel.findOne({ email });
    if (existingUser) {
        
        return res.json({ msg: "User already exists" });
        
    }

    const mapPassword = await bcrypt.hash(password, 10);

    await AdminModel.create({
        email: email,
        password: mapPassword,
        name: name
    })

    res.json({
        msg: "successfully admin signed up"
    })
})

adminRouter.post("/signin",async function(req,res){
     const email= req.body.email;

    const admin = await AdminModel.findOne({
        email
    })

    if(!admin){
        res.json({
            msg : "invalid email"
        })

        return;
    }

    const password = req.body.password;

    const checkpassword = await bcrypt.compare(password,admin.password);

    if(!checkpassword){
        res.json({
            msg : "incorrect password"
        })

        return;
    }

    const token = await jwt.sign({
        userId : admin._id
    },JWT_SECRET);

    res.json({
        token : token
    })

})



module.exports = {
    adminRouter
};