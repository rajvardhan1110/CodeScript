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
const GetProblemLimitsRouter = express_1.default.Router();
GetProblemLimitsRouter.post("/", AdminAuthMiddleware_1.AdminAuthMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { problemId } = req.body;
        if (!problemId) {
            return res.status(400).json({ msg: "problemId is required" });
        }
        const problem = yield ProblemModel_1.ProblemModel.findById(problemId).select("cpu_time_limit memory_limit mark");
        if (!problem) {
            return res.status(404).json({ msg: "Problem not found" });
        }
        res.status(200).json({
            cpu_time_limit: problem.cpu_time_limit,
            memory_limit: problem.memory_limit,
            mark: problem.mark,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
}));
exports.default = GetProblemLimitsRouter;
