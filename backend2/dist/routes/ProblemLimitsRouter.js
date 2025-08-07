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
const express_1 = __importDefault(require("express"));
const ProblemModel_1 = require("../models/ProblemModel");
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const ProblemLimitsRouter = express_1.default.Router();
ProblemLimitsRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { problemId, cpu_time_limit, memory_limit, mark } = req.body;
        if (!problemId || cpu_time_limit === undefined || memory_limit === undefined || mark === undefined) {
            return res.status(400).json({ msg: "problemId, cpu_time_limit, memory_limit, and mark are required" });
        }
        const updated = yield ProblemModel_1.ProblemModel.findByIdAndUpdate(problemId, {
            cpu_time_limit,
            memory_limit,
            mark,
        }, { new: true });
        if (!updated) {
            return res.status(404).json({ msg: "Problem not found" });
        }
        res.status(200).json({
            msg: "Limits updated successfully",
            cpu_time_limit: updated.cpu_time_limit,
            memory_limit: updated.memory_limit,
            mark: updated.mark,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
}));
exports.default = ProblemLimitsRouter;
