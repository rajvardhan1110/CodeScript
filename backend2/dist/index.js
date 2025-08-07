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
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const CreateTestCodeRouter_1 = __importDefault(require("./routes/CreateTestCodeRouter"));
const UploadAdminCodeRouter_1 = __importDefault(require("./routes/UploadAdminCodeRouter"));
const UploadSampleTestCasesRouter_1 = __importDefault(require("./routes/UploadSampleTestCasesRouter"));
const DeleteSampleTestCaseRouter_1 = __importDefault(require("./routes/DeleteSampleTestCaseRouter"));
const UploadHiddenTestCasesRouter_1 = __importDefault(require("./routes/UploadHiddenTestCasesRouter"));
const DeleteHiddenTestCaseRouter_1 = __importDefault(require("./routes/DeleteHiddenTestCaseRouter"));
const GetDefaultMarkdownRouter_1 = __importDefault(require("./routes/GetDefaultMarkdownRouter"));
const GetAdminMarkdownRouter_1 = __importDefault(require("./routes/GetAdminMarkdownRouter"));
const UpdateAdminMarkdownRouter_1 = __importDefault(require("./routes/UpdateAdminMarkdownRouter"));
const GetAdminCodeRouter_1 = __importDefault(require("./routes/GetAdminCodeRouter"));
const GetAdminTestcaseRouter_1 = __importDefault(require("./routes/GetAdminTestcaseRouter"));
const GetAdminTestProblemsRouter_1 = __importDefault(require("./routes/GetAdminTestProblemsRouter"));
const GetUserTestProblemsRouter_1 = __importDefault(require("./routes/GetUserTestProblemsRouter"));
const GetUserMarkdownRouter_1 = __importDefault(require("./routes/GetUserMarkdownRouter"));
// import UploadBoilerplatesRouter from "./routes/UploadBoilerplatesRouter";
const GetBoilerplateCodeRouter_1 = __importDefault(require("./routes/GetBoilerplateCodeRouter"));
const GetSampleTestCase_1 = __importDefault(require("./routes/GetSampleTestCase"));
const RunUserTestCases_1 = __importDefault(require("./routes/RunUserTestCases"));
const SubmitCodeUser_1 = __importDefault(require("./routes/SubmitCodeUser"));
const GetSubmissionHistoryRouter_1 = __importDefault(require("./routes/GetSubmissionHistoryRouter"));
const DeleteProblemRouter_1 = __importDefault(require("./routes/DeleteProblemRouter"));
const CheckTestCodeRouter_1 = __importDefault(require("./routes/CheckTestCodeRouter"));
const UploadUserCodeRouter_1 = __importDefault(require("./routes/UploadUserCodeRouter"));
const GetUserCodeRouter_1 = __importDefault(require("./routes/GetUserCodeRouter"));
const ProblemLimitsRouter_1 = __importDefault(require("./routes/ProblemLimitsRouter"));
const GetProblemLimitsRouter_1 = __importDefault(require("./routes/GetProblemLimitsRouter"));
const AdminCheckTestCodeExistsRouter_1 = __importDefault(require("./routes/AdminCheckTestCodeExistsRouter"));
// import CreateDefaultMarkdownRouter from "./routes/CreateDefaultMarkdownRouter";
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 3000;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!process.env.MONGODB_URL) {
                throw new Error("MONGODB_URL not defined in .env");
            }
            yield mongoose_1.default.connect(process.env.MONGODB_URL);
            console.log("✅ Connected to MongoDB");
            app.listen(PORT, () => {
                console.log(`🚀 Server running on http://localhost:${PORT}`);
            });
        }
        catch (err) {
            console.error("❌ Error starting server:", err.message);
            process.exit(1);
        }
    });
}
start();
app.use("/checkTestCode", CheckTestCodeRouter_1.default);
app.use("/admin-checkTestCode", AdminCheckTestCodeExistsRouter_1.default);
app.use("/createTestCode", CreateTestCodeRouter_1.default);
app.use("/uploadAdminCode", UploadAdminCodeRouter_1.default);
app.use("/uploadSampleTest", UploadSampleTestCasesRouter_1.default);
app.use("/deleteSampleTest", DeleteSampleTestCaseRouter_1.default);
app.use("/uploadHiddenTest", UploadHiddenTestCasesRouter_1.default);
app.use("/deleteHiddenTest", DeleteHiddenTestCaseRouter_1.default);
// app.use("/createMarkdown",CreateDefaultMarkdownRouter);
app.use("/getDefaultMarkdown", GetDefaultMarkdownRouter_1.default);
app.use("/adminMarkdown", GetAdminMarkdownRouter_1.default);
app.use("/userMarkdown", GetUserMarkdownRouter_1.default);
app.use("/updateAdminMarkdown", UpdateAdminMarkdownRouter_1.default);
app.use("/getAdminCode", GetAdminCodeRouter_1.default);
app.use("/getAdminTestCase", GetAdminTestcaseRouter_1.default);
app.use("/admin/test-problems", GetAdminTestProblemsRouter_1.default);
app.use("/user/test-problems", GetUserTestProblemsRouter_1.default);
// app.use("/upload-boilerplates",UploadBoilerplatesRouter);
app.use("/get-boilerplates", GetBoilerplateCodeRouter_1.default);
app.use("/getSampleTestCase", GetSampleTestCase_1.default);
app.use("/runUserTestCase", RunUserTestCases_1.default);
app.use("/submitCodeUser", SubmitCodeUser_1.default);
app.use("/history", GetSubmissionHistoryRouter_1.default);
app.use("/admin/delete-problem", DeleteProblemRouter_1.default);
app.use("/uploadUserCode", UploadUserCodeRouter_1.default);
app.use("/getUserCode", GetUserCodeRouter_1.default);
app.use("/upload-limits", ProblemLimitsRouter_1.default);
app.use("/get-limits", GetProblemLimitsRouter_1.default);
