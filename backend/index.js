const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const {z} = require("zod");
const bcrypt = require("bcrypt");
// const {UserModel} = require("./db/user.js");
// const {AdminModel} = require("./db/admin.js");
const cors = require("cors");
const {userRouter} = require("./routers/UserAuthRoute.js");
const {adminRouter} = require("./routers/AdminAuthRoute.js");
const {createTestRouter} = require("./routers/CreateTestRoute.js");
const { createQuestionRouter } = require("./routers/CreateQuestionRoute.js");
const {allDraftsRouter} = require("./routers/AllDraftsRoute.js");
const {EditTestRouter} = require("./routers/EditTestRoute.js");
const {DeleteTestRouter} = require("./routers/DeleteTestRoute.js");
const {DeleteQuestionRouter} = require("./routers/DeleteQuestionRoute.js");
const { GetQuestionRouter } = require("./routers/GetQuestionRoute.js");
const {AllTestRouter} = require("./routers/AllTestRoute.js");
const { UnregisterRouter } = require("./routers/UnregisterRoute.js");
const { RegisterRouter } = require("./routers/RegisterRoute.js");
const { TestInfoRouter } = require("./routers/TestInfoRoute.js");
const { StudentResponseRouter } = require("./routers/StudentResponseRoute.js");
const {StudentResultRouter} = require("./routers/StudentResultRoute.js");
const {allQuestionRouter} = require("./routers/AllQuestionRoute.js");
const {TestAdmiInfoRouter} = require("./routers/TestAdminInfoRoute.js");
const { FinaliseTestRouter } = require("./routers/FinaliseTestRoute.js");
const { TestLiveRouter } = require("./routers/TestLiveRoute.js");
const { LiveQuestionRouter } = require("./routers/LiveQuestionRoute.js");
const {AttemptedQuestionsRouter} = require("./routers/AttemptedQuestionsRoute.js")
const { TestSubmissionCheckRouter } = require("./routers/TestSubmissionCheckRoute.js");
const {TogglePublishResultRouter} = require("./routers/TogglePublishResultRoute.js");
const { TestSummaryRouter } = require("./routers/TestSummaryRoute.js");
const { ExportResultRouter } = require("./routers/ExportResultRoute.js");
const {UserSettingsRouter} = require("./routers/UserSettingsRoute.js");
const { UserInfoRouter } = require("./routers/UserInfoRoute.js");
const { AdminInfoRouter } = require("./routers/AdminInfoRoute.js");
const { AdminSettingsRouter } = require("./routers/AdminSettingsRoute.js");

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

async function start(){
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("connect to database");
    console.log(process.env.MONGODB_URL)
}

start();

app.use("/user",userRouter);
app.use("/admin",adminRouter);
app.use("/createTest",createTestRouter);
app.use("/createQuestion",createQuestionRouter);
app.use("/draft",allDraftsRouter);
app.use("/editTest",EditTestRouter);
app.use("/deleteTest",DeleteTestRouter);
app.use("/deleteQuestion",DeleteQuestionRouter);
app.use("/getQuestion",GetQuestionRouter);
app.use("/allTests",AllTestRouter);
app.use("/register",RegisterRouter);
app.use("/unregister",UnregisterRouter);
app.use("/testInfo",TestInfoRouter);
app.use("/studentResponse",StudentResponseRouter);
app.use("/studentResult",StudentResultRouter);
app.use("/allQuestions",allQuestionRouter);
app.use("/adminTestInfo",TestAdmiInfoRouter);
app.use("/finalTest",FinaliseTestRouter);
app.use("/testLive",TestLiveRouter);
app.use("/liveQuestion",LiveQuestionRouter);
app.use("/question/attempted", AttemptedQuestionsRouter);
app.use("/test-submission-check", TestSubmissionCheckRouter);
app.use("/togglePublishResult", TogglePublishResultRouter);
app.use("/summary",TestSummaryRouter);
app.use("/export-result", ExportResultRouter);
app.use("/user", UserSettingsRouter);
app.use("/userinfo",UserInfoRouter);
app.use("/admininfo",AdminInfoRouter);
app.use("/admin", AdminSettingsRouter);

app.listen(3000);