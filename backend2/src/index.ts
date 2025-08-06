import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import CreateTestCodeRouter from "./routes/CreateTestCodeRouter";
import UploadAdminCodeRouter from "./routes/UploadAdminCodeRouter";
import UploadSampleTestCodeRouter from "./routes/UploadSampleTestCasesRouter";
import DeleteSampleTestCaseRouter from "./routes/DeleteSampleTestCaseRouter";
import UploadHiddenTestCodeRouter from "./routes/UploadHiddenTestCasesRouter";
import DeleteHiddenTestCaseRouter from "./routes/DeleteHiddenTestCaseRouter";
import GetDefaultMarkdownRouter from "./routes/GetDefaultMarkdownRouter";
import GetAdminMarkdownRouter from "./routes/GetAdminMarkdownRouter";
import UpdateAdminMarkdownRouter from "./routes/UpdateAdminMarkdownRouter";
import GetAdminCodeRouter from "./routes/GetAdminCodeRouter";
import GetAdminTestcaseRouter from "./routes/GetAdminTestcaseRouter";
import GetAdminTestProblemsRouter from "./routes/GetAdminTestProblemsRouter";
import GetUserTestProblemsRouter from "./routes/GetUserTestProblemsRouter";
import GetUserMarkdownRouter from "./routes/GetUserMarkdownRouter";
// import UploadBoilerplatesRouter from "./routes/UploadBoilerplatesRouter";
import GetBoilerplateCodeRouter from "./routes/GetBoilerplateCodeRouter";
import GetSampleTestCaseRouter from "./routes/GetSampleTestCase";
import RunUserTestCasesRouter from "./routes/RunUserTestCases";
import SubmitCodeUserRouter from "./routes/SubmitCodeUser";
import GetSubmissionHistoryRouter from "./routes/GetSubmissionHistoryRouter";
import DeleteProblemRouter from "./routes/DeleteProblemRouter";
import CheckTestCodeExistsRouter from "./routes/CheckTestCodeRouter";
import UploadUserCodeRouter from "./routes/UploadUserCodeRouter";
import GetUserCodeRouter from "./routes/GetUserCodeRouter";
// import CreateDefaultMarkdownRouter from "./routes/CreateDefaultMarkdownRouter";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

async function start(): Promise<void> {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL not defined in .env");
        }

        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err: any) {
        console.error("❌ Error starting server:", err.message);
        process.exit(1);
    }
}

start();


app.use("/checkTestCode",CheckTestCodeExistsRouter)
app.use("/createTestCode", CreateTestCodeRouter);
app.use("/uploadAdminCode",UploadAdminCodeRouter);
app.use("/uploadSampleTest",UploadSampleTestCodeRouter);
app.use("/deleteSampleTest",DeleteSampleTestCaseRouter);
app.use("/uploadHiddenTest",UploadHiddenTestCodeRouter);
app.use("/deleteHiddenTest",DeleteHiddenTestCaseRouter);
// app.use("/createMarkdown",CreateDefaultMarkdownRouter);
app.use("/getDefaultMarkdown",GetDefaultMarkdownRouter);
app.use("/adminMarkdown",GetAdminMarkdownRouter);
app.use("/userMarkdown",GetUserMarkdownRouter);
app.use("/updateAdminMarkdown",UpdateAdminMarkdownRouter);
app.use("/getAdminCode",GetAdminCodeRouter);
app.use("/getAdminTestCase",GetAdminTestcaseRouter);
app.use("/admin/test-problems", GetAdminTestProblemsRouter);
app.use("/user/test-problems", GetUserTestProblemsRouter);
// app.use("/upload-boilerplates",UploadBoilerplatesRouter);
app.use("/get-boilerplates",GetBoilerplateCodeRouter);
app.use("/getSampleTestCase",GetSampleTestCaseRouter);
app.use("/runUserTestCase",RunUserTestCasesRouter);
app.use("/submitCodeUser",SubmitCodeUserRouter);
app.use("/history",GetSubmissionHistoryRouter);
app.use("/admin/delete-problem",DeleteProblemRouter);
app.use("/uploadUserCode",UploadUserCodeRouter);
app.use("/getUserCode",GetUserCodeRouter);