import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import QuestionPanel from "../components/QuestionPanel";
import QuestionViewer from "../components/QuestionViewer";
import AddQuestion from "../components/AddQuestion";
import DeleteTestButton from "../components/DeleteTestButton";
import UpdateTestPage from "../components/UpdateTestPage";
import CodingQuestions from "../components/CodingQuestions"; // ✅ NEW IMPORT
import { toggleTestPhase } from "../api/finaliseTest";

import config from "../../apiconfig";
const API = config.BASE_URL;
const API2 = config.JudgeBackend_url;

export default function TestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [testInfoVisible, setTestInfoVisible] = useState(true);
    const [questionsVisible, setQuestionsVisible] = useState(false);
    const [updateVisible, setUpdateVisible] = useState(false);
    const [codingVisible, setCodingVisible] = useState(false);

    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [testTime, setTestTime] = useState("");
    const [totalTime, setTotalTime] = useState(0);
    const [testTimeRaw, setTestTimeRaw] = useState(null);
    const [totalMark, setTotalMark] = useState(0);
    const [phase, setPhase] = useState("");
    const [publishResult, setPublishResult] = useState(false);
    const [allQuestions, setAllQuestions] = useState([]);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState("");

    // === Coding section presence logic (NEW) ===
    const [codingSectionInfo, setCodingSectionInfo] = useState(null);
    const [codingSectionLoading, setCodingSectionLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchCodingSection = async () => {
            setCodingSectionLoading(true);
            setCodingSectionInfo(null);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.post(
                    `${API2}/admin-checkTestCode`,
                    { testId: id },
                    { headers: { token } }
                );
                if (res.data.exists) {
                    setCodingSectionInfo({
                        totalQuestions: res.data.totalQuestions,
                        totalMarks: res.data.totalMarks
                    });
                } else {
                    setCodingSectionInfo(null);
                }
            } catch (e) {
                setCodingSectionInfo(null); // silent fail
            }
            setCodingSectionLoading(false);
        };
        fetchCodingSection();
    }, [id]);
    // === END Coding section presence logic (NEW) ===

    useEffect(() => {
        const fetchTestData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Authentication token missing. Please log in.");
                    navigate("/");
                    return;
                }
                const questionsRes = await axios.post(`${API}/allquestions`, {
                    testId: id
                }, {
                    headers: { token }
                });
                setAllQuestions(questionsRes.data.questions || []);
                const infoRes = await axios.post(`${API}/adminTestInfo`, {
                    testId: id
                }, {
                    headers: { token }
                });
                const test = infoRes.data.test;
                setTitle(test.title || "");
                setDescription(test.description || "");
                setTestTime(test.testTime ? new Date(test.testTime).toLocaleString() : "Not Set");
                setTestTimeRaw(test.testTime ? new Date(test.testTime) : null);
                setTotalTime(test.totalTime || 0);
                setTotalMark(test.totalMarks || '-');
                setPhase(test.examTakerPhase);
                setPublishResult(test.publishResult);
                setError("");
            } catch (err) {
                console.error("Error fetching test data:", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem("token");
                    setError("Session expired. Please log in again.");
                    navigate("/");
                } else {
                    setError("Failed to load test data.");
                }
            }
        };
        fetchTestData();
    }, [id, navigate]);

    function backButton() {
        navigate("/admin/home", { replace: true });
    }

    function showTestInfo() {
        setTestInfoVisible(true);
        setQuestionsVisible(false);
        setUpdateVisible(false);
        setCodingVisible(false);
    }

    function showQuestions() {
        setTestInfoVisible(false);
        setQuestionsVisible(true);
        setUpdateVisible(false);
        setCodingVisible(false);
    }

    function showUpdate() {
        setUpdateVisible(true);
        setTestInfoVisible(false);
        setQuestionsVisible(false);
        setCodingVisible(false);
    }

    function showCodingQuestions() {
        setCodingVisible(true);
        setUpdateVisible(false);
        setTestInfoVisible(false);
        setQuestionsVisible(false);
    }

    function handleCardClick(questionId, index) {
        setSelectedQuestionId(questionId);
        setSelectedIndex(index);
    }

    async function handleTogglePhase() {
        try {
            const data = await toggleTestPhase(id);
            setPhase(data.test.examTakerPhase);
            alert(data.msg);
        } catch (err) {
            console.error("Error updating phase:", err);
            if (err.message === "Authentication token missing. Please log in.") {
                setError(err.message);
                navigate("/");
            } else {
                setError("Failed to update test phase.");
            }
        }
    }

    async function handleTogglePublishResult() {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token missing. Please log in.");
            const res = await axios.post(
                `${API}/togglePublishResult`,
                { testId: id },
                { headers: { token } }
            );
            alert(res.data.msg);
            setPublishResult(res.data.test.publishResult);
        } catch (err) {
            console.error("Error toggling result publish:", err);
            setError(err?.response?.data?.msg || "Failed to toggle result publish status.");
        }
    }

    async function handleDownload() {
        try {
            if (!id) {
                alert("Test ID is missing.");
                return;
            }
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API}/export-result?testId=${id}`, {
                responseType: "blob",
                headers: { token }
            });
            const blob = new Blob([response.data], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `test_${title}_results.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download error:", error);
            alert(
                error?.response?.data?.msg ||
                "Error downloading CSV. Make sure test has ended."
            );
        }
    };

    async function copyTestId() {
        try {
            await navigator.clipboard.writeText(id);
            setCopied("id");
            setTimeout(() => setCopied(""), 2000);
        } catch (e) {
            alert("Failed to copy Test ID");
        }
    }

    async function copyTestLink() {
        try {
            const link = `${API}/testInfo/${id}`;
            await navigator.clipboard.writeText(link);
            setCopied("link");
            setTimeout(() => setCopied(""), 2000);
        } catch (e) {
            alert("Failed to copy Test Link");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Test Details</h2>
                    <button
                        onClick={backButton}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div> 


                

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button onClick={showTestInfo} className={`px-4 py-2 font-medium ${testInfoVisible ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        Test Info
                    </button>
                    <button onClick={showQuestions} className={`px-4 py-2 font-medium ${questionsVisible ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        Questions ({allQuestions.length})
                    </button>
                    <button onClick={showUpdate} className={`px-4 py-2 font-medium ${updateVisible ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        Update Test
                    </button>
                    <button onClick={showCodingQuestions} className={`px-4 py-2 font-medium ${codingVisible ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        Coding Questions
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {codingSectionLoading ? null : codingSectionInfo && testInfoVisible && (
                    <div className="my-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-indigo-800 mb-2">Coding Section Details</h3>
                        <div className="flex flex-wrap gap-6">
                            <div className="text-indigo-700">
                                <span className="font-medium">Questions:</span>{" "}
                                <span className="font-bold">{codingSectionInfo.totalQuestions}</span>
                            </div>
                            <div className="text-indigo-700">
                                <span className="font-medium">Total Marks:</span>{" "}
                                <span className="font-bold">{codingSectionInfo.totalMarks}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Info Section */}
                {testInfoVisible && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Test Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><p className="text-sm text-gray-500">Title</p><p className="font-medium">{title}</p></div>
                                <div><p className="text-sm text-gray-500">Description</p><p className="font-medium">{description || "No description"}</p></div>
                                <div><p className="text-sm text-gray-500">Scheduled Time</p><p className="font-medium">{testTime}</p></div>
                                <div><p className="text-sm text-gray-500">Duration</p><p className="font-medium">{totalTime} minutes</p></div>
                                <div><p className="text-sm text-gray-500">Total MCQ Marks</p><p className="font-medium">{totalMark}</p></div>
                                <div><p className="text-sm text-gray-500">Status</p><p className={`font-medium capitalize ${phase === 'draft' ? 'text-yellow-600' : 'text-green-600'}`}>{phase}</p></div>
                                <div><p className="text-sm text-gray-500">Results Published</p><p className="font-medium">{publishResult ? (<span className="text-green-600">✅ Published</span>) : (<span className="text-red-600">❌ Not Published</span>)}</p></div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <DeleteTestButton testId={id} className="flex-1" />

                            <button
                                onClick={handleTogglePhase}
                                className={`px-4 py-2 ${phase === "draft" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-400 hover:bg-indigo-500"} text-white rounded-lg transition-colors shadow-sm`}
                            >
                                {phase === "draft" ? "Finalize Test" : "Convert to Draft"}
                            </button>
                            {testTimeRaw && new Date(testTimeRaw.getTime() + totalTime * 60000) <= new Date() && (
                                <button
                                    onClick={handleTogglePublishResult}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                                >
                                    {publishResult ? "Unpublish Results" : "Publish Results"}
                                </button>
                            )}
                            <button
                                onClick={handleDownload}
                                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <span>📥</span> Download Results (CSV)
                            </button>
                            <button
                                onClick={copyTestId}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                            >
                                {copied === "id" ? "Copied ID!" : "Copy Test ID"}
                            </button>
                            <button
                                onClick={copyTestLink}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                            >
                                {copied === "link" ? "Copied Link!" : "Copy Link"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Questions Section */}
                {questionsVisible && (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-0.9/3 ml-4">
                            <QuestionPanel
                                questions={allQuestions}
                                onSelect={handleCardClick}
                                selectedIndex={selectedIndex}
                                testId={id}
                            />
                        </div>
                        <div className="lg:w-2/3 mx-auto">
                            {selectedQuestionId === "add" ? (
                                <AddQuestion
                                    testId={id}
                                    onCancel={() => setSelectedQuestionId(null)}
                                    setAllQuestions={setAllQuestions}
                                    setSelectedQuestionId={setSelectedQuestionId}
                                />
                            ) : (
                                <QuestionViewer questionId={selectedQuestionId} testId={id} />
                            )}
                        </div>
                    </div>
                )}

                {/* Update Test Section */}
                {updateVisible && (
                    <UpdateTestPage
                        testId={id}
                        title={title}
                        description={description}
                        testTime={testTime}
                        totalTime={totalTime}
                    />
                )}

                {/* Coding Questions Section */}
                {codingVisible && (
                    <CodingQuestions testId={id} />
                )}
            </div>
        </div>
    );
}
