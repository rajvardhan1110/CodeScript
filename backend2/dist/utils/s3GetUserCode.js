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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCodeFromS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3config_1 = require("../s3config/s3config");
const streamToString = (stream) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });
});
const getUserCodeFromS3 = (s3Key) => __awaiter(void 0, void 0, void 0, function* () {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
        throw new Error("S3_BUCKET_NAME not configured in environment");
    }
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
    });
    try {
        const response = yield s3config_1.s3Client.send(command);
        if (!response.Body) {
            throw new Error("No content found in S3 object");
        }
        const bodyString = yield streamToString(response.Body);
        const data = JSON.parse(bodyString);
        if (!data.code || typeof data.language_id !== "number") {
            throw new Error("Invalid format in S3 object");
        }
        return data;
    }
    catch (err) {
        console.error("❌ Failed to fetch user code from S3:", err.message || err);
        throw err;
    }
});
exports.getUserCodeFromS3 = getUserCodeFromS3;
