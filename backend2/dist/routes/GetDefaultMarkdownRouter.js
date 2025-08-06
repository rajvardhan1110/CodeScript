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
exports.GetDefaultMarkdownHandler = void 0;
const express_1 = __importDefault(require("express"));
const AdminAuthMiddleware_1 = require("../Middleware/AdminAuthMiddleware");
const DefaultMarkdownModel_1 = require("../models/DefaultMarkdownModel");
const s3GetCode_1 = require("../utils/s3GetCode");
const GetDefaultMarkdownRouter = express_1.default.Router();
const GetDefaultMarkdownHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Step 1: Find the most recent markdown entry
        const latestMarkdown = yield DefaultMarkdownModel_1.DefaultMarkdownModel.findOne().sort({ createdAt: -1 });
        if (!latestMarkdown) {
            return res.status(404).json({ msg: "No markdown found in the database." });
        }
        // Step 2: Extract S3 URL and fetch content
        const s3Url = latestMarkdown.markdownS3Url;
        const markdownContent = yield (0, s3GetCode_1.getS3DataFromUrl)(s3Url);
        // Step 3: Send markdown content
        return res.status(200).json({
            msg: "Fetched latest markdown successfully",
            content: markdownContent,
            s3Url
        });
    }
    catch (error) {
        console.error("Error in getDefaultMarkdownHandler:", error);
        return res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
});
exports.GetDefaultMarkdownHandler = GetDefaultMarkdownHandler;
GetDefaultMarkdownRouter.get("/", AdminAuthMiddleware_1.AdminAuthMiddleware, exports.GetDefaultMarkdownHandler);
exports.default = GetDefaultMarkdownRouter;
