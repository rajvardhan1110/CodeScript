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
exports.uploadSubmissionToS3 = void 0;
// utils/uploadSubmissionToS3.ts
const s3config_1 = require("../s3config/s3config");
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const uploadSubmissionToS3 = (userId, testId, problemId, code, result) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `submissions/${userId}/${testId}/${problemId}/${(0, uuid_1.v4)()}.json`;
    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const content = JSON.stringify({
        userId,
        testId,
        problemId,
        code,
        result,
        timestamp: new Date().toISOString(),
    });
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: content,
        ContentType: "application/json",
    });
    yield s3config_1.s3Client.send(command);
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
});
exports.uploadSubmissionToS3 = uploadSubmissionToS3;
