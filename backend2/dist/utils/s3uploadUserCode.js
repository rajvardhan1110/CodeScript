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
exports.uploadUserCodeToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3config_1 = require("../s3config/s3config"); // Make sure this is correctly configured
const uploadUserCodeToS3 = (code, language_id, s3Key) => __awaiter(void 0, void 0, void 0, function* () {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
        throw new Error("S3_BUCKET_NAME not configured in environment");
    }
    const jsonData = JSON.stringify({ code, language_id });
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: jsonData,
        ContentType: "application/json",
    });
    yield s3config_1.s3Client.send(command);
    return `https://${bucketName}.s3.amazonaws.com/${s3Key}`;
});
exports.uploadUserCodeToS3 = uploadUserCodeToS3;
