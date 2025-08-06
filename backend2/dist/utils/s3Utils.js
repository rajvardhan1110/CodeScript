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
exports.uploadStringToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3config_1 = require("../s3config/s3config");
const uploadStringToS3 = (content_1, key_1, ...args_1) => __awaiter(void 0, [content_1, key_1, ...args_1], void 0, function* (content, key, contentType = "text/markdown") {
    try {
        const bucketName = process.env.S3_BUCKET_NAME;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: content,
            ContentType: contentType,
        });
        yield s3config_1.s3Client.send(command);
        // Return the S3 object URL
        const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        return url;
    }
    catch (error) {
        console.error("Error uploading string to S3:", error);
        throw new Error("S3 upload failed");
    }
});
exports.uploadStringToS3 = uploadStringToS3;
