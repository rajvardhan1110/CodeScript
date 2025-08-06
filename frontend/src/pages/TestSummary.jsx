import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function TestSummaryPage() {
    const { testId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [summaryData, setSummaryData] = useState(null);

    useEffect(() => {
        async function fetchSummary() {
            const token = localStorage.getItem("usertoken");
            if (!token) {
                setError("User not authenticated. Please login again.");
                setLoading(false);
                return;
            }

            if (!testId || testId.length !== 24) {
                setError("Invalid test ID.");
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${API}/summary?testId=${testId}`, {
                    headers: { token },
                });

                if (res.data && res.data.show) {
                    setSummaryData(res.data);
                } else {
                    setError("Invalid summary response from server.");
                }
            } catch (err) {
                console.error("Summary fetch error:", err);
                if (err.response?.data?.msg) {
                    setError(`Error: ${err.response.data.msg}`);
                } else {
                    setError("Server error. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchSummary();
    }, [testId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md max-w-md mx-auto">
                {error}
            </div>
        );
    }

    if (!summaryData) {
        return (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md max-w-md mx-auto">
                Summary data not available.
            </div>
        );
    }

    const { show, questions = [], resultData } = summaryData;

    function getOptionClasses(option, question) {
        const qid = question._id;

        if (show === "reviewOnly") {
            if (option._id === question.correctAnswer) {
                return "bg-green-100 border border-green-200";
            }
            return "bg-gray-50";
        }

        if (show === "fullReview") {
            const resp = resultData?.response?.find(r => r.questionId === qid);
            const isSelected = resp?.optionId === option._id;
            const isCorrect = question.correctAnswer === option._id;

            if (isSelected && isCorrect) {
                return "bg-green-100 border border-green-200";
            } else if (isSelected && !isCorrect) {
                return "bg-red-100 border border-red-200";
            } else if (!isSelected && isCorrect) {
                return "bg-green-50 border border-green-100";
            }
        }

        return "bg-gray-50";
    }

    function renderQuestions() {
        if (!questions || questions.length === 0) {
            return <p className="text-gray-600">No questions found.</p>;
        }

        return questions.map((q, idx) => (
            <div key={q._id} className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow-sm">
                <h4 className="text-lg font-medium text-gray-800 mb-3">
                    <span className="font-bold">Q{idx + 1}.</span> {q.questionText}
                </h4>
                <div className="space-y-2">
                    {q.options.map((opt) => (
                        <div 
                            key={opt._id} 
                            className={`p-3 rounded-md ${getOptionClasses(opt, q)}`}
                        >
                            {opt.text}
                            {opt._id === q.correctAnswer && (
                                <span className="ml-2 text-green-600 text-sm flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Correct Answer
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        ));
    }

    function renderContent() {
        const title = summaryData?.testName || resultData?.testName;
        const marks = summaryData?.TotalMarks || resultData?.TotalMarks;

        return (
            <div className="space-y-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-indigo-600">📘</span> {title}
                    </h2>
                    {marks !== undefined && (
                        <h4 className="text-gray-700 mt-1">
                            <span className="font-medium">Total Marks:</span> {marks}
                        </h4>
                    )}
                </div>

                {(() => {
                    switch (show) {
                        case "notSubmittedNoReview":
                            return (
                                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg">
                                    <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
                                        <span>❌</span> Test not submitted
                                    </h2>
                                    <p className="text-yellow-700 mt-2">
                                        The test time is over. You can no longer attempt or view this test.
                                    </p>
                                </div>
                            );

                        case "reviewOnly":
                            return (
                                <div className="space-y-6">
                                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                                        <h2 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                                            <span>⚠️</span> Test not submitted
                                        </h2>
                                        <p className="text-amber-700 mt-2">
                                            You didn't submit the test, but review is allowed.
                                        </p>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Test Questions</h3>
                                    {renderQuestions()}
                                </div>
                            );

                        case "submittedNoResult":
                            return (
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                                    <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                                        <span>✅</span> Test submitted
                                    </h2>
                                    <p className="text-blue-700 mt-2">
                                        The result is not published yet. Please check back later.
                                    </p>
                                </div>
                            );

                        case "fullReview":
                            return (
                                <div className="space-y-6">
                                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                                        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
                                            <span>✅</span> Test submitted and reviewed
                                        </h2>
                                        <h3 className="text-lg font-medium text-green-700 mt-2">
                                            Your Total Score: <span className="font-bold">{resultData?.score ?? 0}</span>
                                            {resultData?.TotalMarks ? (
                                                <span className="text-gray-600"> / {resultData.TotalMarks}</span>
                                            ) : ""}
                                        </h3>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Your Responses</h3>
                                    {renderQuestions()}
                                </div>
                            );

                        default:
                            return (
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <p className="text-gray-700">Unknown summary case.</p>
                                </div>
                            );
                    }
                })()}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-indigo-600">📝</span> Test Summary
            </h1>
            {renderContent()}
        </div>
    );
}