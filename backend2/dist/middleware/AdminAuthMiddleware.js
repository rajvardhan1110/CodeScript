"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const AdminModel_1 = require("../models/AdminModel");
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not set in environment variables");
}
const AdminAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.token;
    console.log("Checking token:", token);
    if (!token) {
        console.log("No token found in headers");
        res.status(401).json({ msg: "Token is required" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const exid = decoded.userId;
        console.log("Decoded userId:", exid);
        const existingAdmin = yield AdminModel_1.AdminModel.findById(exid);
        if (existingAdmin) {
            console.log("Admin verified");
            req.examTakerId = exid;
            next();
        }
        else {
            console.log("Admin not found");
            res.status(403).json({ msg: "You are not an exam taker" });
        }
    }
    catch (e) {
        console.log("JWT or DB error:", e);
        res.status(401).json({ msg: "Invalid token", error: e.message });
    }
});
exports.AdminAuthMiddleware = AdminAuthMiddleware;
