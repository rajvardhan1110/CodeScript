const express = require("express");
const { AdminModel } = require("../models/AdminModel");
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");

const AdminInfoRouter = express.Router();

async function AdminInfoHandler(req, res) {
    try {
        const adminId = req.examTakerId;

        const admin = await AdminModel.findById(adminId).select("name email");

        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        res.json({
            name: admin.name,
            email: admin.email
        });

    } catch (e) {
        res.status(500).json({
            msg: "Error in AdminInfoRouter",
            error: "Something went wrong"
        });
    }
}

AdminInfoRouter.get("/", AdminAuthMiddleware, AdminInfoHandler);

module.exports = {
    AdminInfoRouter
};
