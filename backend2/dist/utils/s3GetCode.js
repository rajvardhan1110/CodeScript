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
exports.getS3DataFromUrl = void 0;
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
const getS3DataFromUrl = (s3Url) => __awaiter(void 0, void 0, void 0, function* () {
    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    // Extract S3 key from full URL
    const prefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
    const key = s3Url.replace(prefix, "");
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    const response = yield s3config_1.s3Client.send(command);
    const body = response.Body;
    return yield streamToString(body);
});
exports.getS3DataFromUrl = getS3DataFromUrl;
