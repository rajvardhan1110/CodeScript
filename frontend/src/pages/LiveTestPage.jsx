// LiveTestPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Question from "../components/Question";
import QuestionNavigator from "../components/QuestionNavigator";
import Timer from "../components/Timer";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function LiveTestPage() {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [testData, setTestData] = useState(null);
    const [attemptedQIDs, setAttemptedQIDs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchTestAndAttempts() {
            try {
                const token = localStorage.getItem("usertoken");
                const headers = { headers: { token } };

                // Fetch test data
                const testRes = await axios.get(`${API}/testLive?testId=${testId}`, headers);

                setQuestions(testRes.data.test.questions);
                setTestData(testRes.data.test);

                // Fetch attempted question IDs
                const attemptRes = await axios.get(`${API}/question/attempted?testId=${testId}`, headers);
                setAttemptedQIDs(attemptRes.data.attempted || []);
            } catch (err) {
                console.error("Error loading test:", err);

                if (
                    err.response &&
                    (err.response.status === 403 ||
                        err.response.status === 404 ||
                        err.response.data?.msg === "Test is not available" ||
                        err.response.data?.msg === "Test cannot be opened" ||
                        err.response.data?.msg === "You are not allowed to see this test")
                ) {
                    navigate("/user/home", { replace: true });
                } else {
                    setError("Failed to load test or attempts.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchTestAndAttempts();
    }, [testId]);




    function handleChangeQuestion(index) {
        setCurrentQIndex(index);
    }

    function markAttempted(qid) {
        setAttemptedQIDs(prev => (prev.includes(qid) ? prev : [...prev, qid]));
    }

    async function submitTest() {
        try {
            const token = localStorage.getItem("usertoken");
            await axios.post(
                `${API}/studentResult`,
                { testId },
                { headers: { token } }
            );
            navigate(`/testInfo/${testId}/summary`, { replace: true });
        } catch (err) {
            console.error("Failed to submit test", err);
            alert("Error submitting test. Please try again.");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-700">Loading test...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                    <div className="text-red-500 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
            <div className="max-w-7xl mx-auto p-4">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header with timer */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">{testData?.title || "Test"}</h2>
                        <Timer
                            testTime={testData?.testTime}
                            totalTime={testData?.totalTime}
                            onTimeUp={submitTest}
                        />
                    </div>

                    {/* Main content */}
                    <div className="flex flex-col md:flex-row">
                        {/* Left panel - Question navigator */}
                        <div className="w-full md:w-1/4 p-4 border-r border-gray-200 bg-gray-50">
                            <QuestionNavigator
                                questions={questions}
                                current={currentQIndex}
                                onJump={handleChangeQuestion}
                                attemptedQIDs={attemptedQIDs}
                                onSubmit={submitTest}
                            />
                        </div>

                        {/* Right panel - Question */}
                        <div className="w-full md:w-3/4 p-6">
                            {questions.length > 0 && currentQIndex >= 0 && currentQIndex < questions.length && (
                                <Question
                                    questionId={questions[currentQIndex]}
                                    testId={testId}
                                    markAttempted={markAttempted}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}