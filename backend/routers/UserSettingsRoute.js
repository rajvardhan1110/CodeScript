const express = require("express");
const { UserModel } = require("../models/UserModel");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");
const { z } = require("zod");
const bcrypt = require("bcrypt");

const UserSettingsRouter = express.Router();

// ✅ Change Name
UserSettingsRouter.patch("/change-name", UserAuthMiddleware, async (req, res) => {
    const schema = z.object({
        name: z.string().min(1)
    });

    const validate = schema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ msg: "Invalid name format", error: validate.error });
    }

    try {
        await UserModel.findByIdAndUpdate(req.userId, { name: req.body.name });
        res.json({ msg: "Name updated successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Error updating name", error: err.message });
    }
});

// ✅ Change Email
UserSettingsRouter.patch("/change-email", UserAuthMiddleware, async (req, res) => {
    const schema = z.object({
        email: z.string().email()
    });

    const validate = schema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ msg: "Invalid email format", error: validate.error });
    }

    const existing = await UserModel.findOne({ email: req.body.email });
    if (existing) {
        return res.status(400).json({ msg: "Email already in use" });
    }

    try {
        await UserModel.findByIdAndUpdate(req.userId, { email: req.body.email });
        res.json({ msg: "Email updated successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Error updating email", error: err.message });
    }
});

// ✅ Change Password
UserSettingsRouter.patch("/change-password", UserAuthMiddleware, async (req, res) => {
    const schema = z.object({
        oldPassword: z.string().min(3),
        newPassword: z.string().min(3)
    });

    const validate = schema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ msg: "Invalid password format", error: validate.error });
    }

    try {
        const user = await UserModel.findById(req.userId);
        const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ msg: "Old password is incorrect" });
        }

        const hashed = await bcrypt.hash(req.body.newPassword, 10);
        user.password = hashed;
        await user.save();

        res.json({ msg: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Error updating password", error: err.message });
    }
});

// ✅ Delete Account
UserSettingsRouter.delete("/delete", UserAuthMiddleware, async (req, res) => {
    const schema = z.object({
        password: z.string().min(3)
    });

    const validate = schema.safeParse(req.body);
    if (!validate.success) {
        return res.status(400).json({ msg: "Invalid password format", error: validate.error });
    }

    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Incorrect password" });
        }

        await UserModel.findByIdAndDelete(req.userId);
        res.json({ msg: "Account deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Error deleting account", error: err.message });
    }
});

module.exports = {
    UserSettingsRouter
};
