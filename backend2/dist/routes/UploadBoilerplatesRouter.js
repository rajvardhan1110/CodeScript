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
const s3uploadAdminCode_1 = require("../utils/s3uploadAdminCode"); // adjust the path if needed
const UploadBoilerplatesRouter = express_1.default.Router();
const boilerplates = {
    50: "#include <stdio.h>\n\nint main() {\n    // your code goes here\n    return 0;\n}",
    54: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}",
    62: "public class Main {\n    public static void main(String[] args) {\n        // your code goes here\n    }\n}",
    63: "// your code goes here",
    74: "const main = (): void => {\n    // your code goes here\n};\n\nmain();",
    60: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // your code goes here\n}",
    71: "# your code goes here"
};
UploadBoilerplatesRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = [];
        for (const [languageId, code] of Object.entries(boilerplates)) {
            const key = `boilerplatecode/${languageId}`;
            const url = yield (0, s3uploadAdminCode_1.uploadStringToS3)(code, key);
            results.push({ languageId: parseInt(languageId), url });
        }
        return res.status(200).json({
            message: "Boilerplates uploaded successfully",
            data: results,
        });
    }
    catch (error) {
        console.error("Error uploading boilerplates:", error);
        return res.status(500).json({ message: "Failed to upload boilerplates" });
    }
}));
exports.default = UploadBoilerplatesRouter;
