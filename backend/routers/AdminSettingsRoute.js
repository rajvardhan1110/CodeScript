const express = require("express");
const { AdminModel } = require("../models/AdminModel");
const { AdminAuthMiddleware } = require("../Middleware/AdminAuthMiddleware");
const { z } = require("zod");
const bcrypt = require("bcrypt");

const AdminSettingsRouter = express.Router();

// ✅ Change Name
AdminSettingsRouter.patch("/change-name", AdminAuthMiddleware, async (req, res) => {
    const schema = z.object({
        name: z.string().min(1)
    });

    const validate = schema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ msg: "Invalid name format", error: validate.error });
    }

    try {
        await AdminModel.findByIdAndUpdate(req.examTakerId, { name: req.body.name });
        res.json({ msg: "Name updated successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Error updating name", error: err.message });
    }
});

// ✅ Change Email
AdminSettingsRouter.patch("/change-email", AdminAuthMiddleware, async (req, res) => {
    const schema = z.object({
        email: z.string().email()
    });

    const validate = schema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ msg: "Invalid email format", error: validate.error });
    }

    const existing = await AdminModel.findOne({ email: req.body.email });
    if (existing) {
        return res.status(400).json({ msg: "Email already in use" });
    }

    try {
        await AdminModel.findByIdAndUpdate(req.examTakerId, { email: req.body.email });
        res.json({ msg: "Email updated successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Error updating email", error: err.message });
    }
});

// ✅ Change Password
AdminSettingsRouter.patch("/change-password", AdminAuthMiddleware, async (req, res) => {
    const schema = z.object({
        oldPassword: z.string().min(3),
        newPassword: z.string().min(3)
    });

    const validate = schema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ msg: "Invalid password format", error: validate.error });
    }

    try {
        const admin = await AdminModel.findById(req.examTakerId);
        const isMatch = await bcrypt.compare(req.body.oldPassword, admin.password);

        if (!isMatch) {
            return res.status(401).json({ msg: "Old password is incorrect" });
        }

        const hashed = await bcrypt.hash(req.body.newPassword, 10);
        admin.password = hashed;
        await admin.save();

        res.json({ msg: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Error updating password", error: err.message });
    }
});

// ✅ Delete Account
AdminSettingsRouter.delete("/delete", AdminAuthMiddleware, async (req, res) => {
    const schema = z.object({
        password: z.string().min(3)
    });

    const validate = schema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ msg: "Invalid password format", error: validate.error });
    }

    try {
        const admin = await AdminModel.findById(req.examTakerId);
        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(req.body.password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Incorrect password" });
        }

        await AdminModel.findByIdAndDelete(req.examTakerId);
        res.json({ msg: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Error deleting account", error: err.message });
    }
});

module.exports = {
    AdminSettingsRouter
};
