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
exports.GetBoilerplateCodeHandler = void 0;
const express_1 = __importDefault(require("express"));
const s3GetCode_1 = require("../utils/s3GetCode");
const GetBoilerplateCodeRouter = express_1.default.Router();
// Mapping of Judge0 language IDs to S3 keys
const boilerplateKeyMap = {
    50: "boilerplatecode/50", // C
    54: "boilerplatecode/54", // C++
    62: "boilerplatecode/62", // Java
    63: "boilerplatecode/63", // JavaScript
    74: "boilerplatecode/74", // TypeScript
    60: "boilerplatecode/60", // Go
    71: "boilerplatecode/71", // Python
};
const GetBoilerplateCodeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { languageId } = req.body;
        console.log("📥 Received request to fetch boilerplate code for languageId:", languageId);
        if (!languageId || typeof languageId !== "number") {
            console.warn("⚠️ Invalid or missing languageId in request body:", req.body);
            return res.status(400).json({ message: "Missing or invalid languageId" });
        }
        const key = boilerplateKeyMap[languageId];
        if (!key) {
            console.warn("⚠️ Unsupported languageId:", languageId);
            return res.status(400).json({ message: "Unsupported languageId" });
        }
        const bucketName = process.env.S3_BUCKET_NAME;
        const region = process.env.AWS_REGION;
        const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
        console.log("🔗 Constructed S3 URL:", s3Url);
        const code = yield (0, s3GetCode_1.getS3DataFromUrl)(s3Url);
        console.log(`✅ Successfully fetched boilerplate code for languageId ${languageId}. Length: ${code.length} chars`);
        return res.status(200).json({
            languageId,
            boilerplateCode: code,
        });
    }
    catch (error) {
        console.error("❌ Error in GetBoilerplateCodeHandler:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
exports.GetBoilerplateCodeHandler = GetBoilerplateCodeHandler;
GetBoilerplateCodeRouter.post("/", exports.GetBoilerplateCodeHandler);
exports.default = GetBoilerplateCodeRouter;
