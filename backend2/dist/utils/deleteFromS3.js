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
exports.deleteFromS3Url = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3config_1 = require("../s3config/s3config");
const deleteFromS3Url = (s3Url) => __awaiter(void 0, void 0, void 0, function* () {
    const bucketName = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const prefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
    const key = s3Url.replace(prefix, "");
    if (!key || key === s3Url) {
        throw new Error("Invalid S3 URL or key not extracted");
    }
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    yield s3config_1.s3Client.send(command);
});
exports.deleteFromS3Url = deleteFromS3Url;
