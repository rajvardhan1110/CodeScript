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
const s3Utils_1 = require("../utils/s3Utils");
const DefaultMarkdownModel_1 = require("../models/DefaultMarkdownModel");
const CreateDefaultMarkdownRouter = express_1.default.Router();
CreateDefaultMarkdownRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const markdownContent = `# [Problem Title]

## Description
<!-- Write a clear and concise description of the problem. -->

## Input
<!-- Explain the input format line by line. Mention types, order, and special conditions. -->

## Output
<!-- Explain what the program should output and in what format. -->

## Examples

### Example 1  
Input  
<!-- Example input here -->  
4 5

Output  
<!-- Expected output here -->  
9

### Example 2  
Input  
<!-- Example input here -->  
-2 3

Output  
<!-- Expected output here -->  
1

## Constraints
<!-- Mention all constraints like ranges, lengths, and limits. For example:
1 <= N <= 10^5  
-10^9 <= A, B <= 10^9  
-->

## Solving Explanation

### For Example 1:
<!-- Step-by-step logic behind Example 1. What’s happening with the input? Why is the output 9? -->

### For Example 2:
<!-- Step-by-step logic behind Example 2. How does -2 + 3 = 1? -->
`;
    const s3Key = "default_markdown.md";
    try {
        // Upload markdown string to S3
        const s3Url = yield (0, s3Utils_1.uploadStringToS3)(markdownContent, s3Key, "text/markdown");
        // Save the S3 URL to MongoDB
        const savedDoc = yield DefaultMarkdownModel_1.DefaultMarkdownModel.create({ markdownS3Url: s3Url });
        return res.status(201).json({
            message: "Default markdown uploaded and saved successfully",
            markdownRecord: savedDoc
        });
    }
    catch (error) {
        console.error("Error uploading markdown or saving to DB:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = CreateDefaultMarkdownRouter;
