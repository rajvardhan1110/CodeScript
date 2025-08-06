import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import MarkdownUpdate from "../components/MarkdownUpdate";
import SetQuestion from "../components/SetQuestion";



const UpdateProblem = () => {
    const { testId, problemId } = useParams();
    const navigate = useNavigate();
    const [view, setView] = useState("markdown");

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Authentication token missing. Please login again.");
        navigate("/");
        return;
    }

    const backButton = () => {
        navigate(`/test/${testId}`, { replace: true });
    };

    const deleteProblem = async () => {
        const confirm = window.confirm("Are you sure you want to delete this problem?");
        if (!confirm) return;

        try {

            await axios.post(
                "http://localhost:5050/admin/delete-problem",
                { problemId },
                {
                    headers: {
                        token
                    },
                }
            );

            alert("Problem deleted successfully.");
            navigate(`/test/${testId}`, { replace: true });
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete problem.");
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 px-4 flex justify-center">
            <div className="w-[90%]">
                {/* Header + Toggle + Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Update Problem</h2>

                    <div className="flex flex-wrap gap-3">
                        {/* View toggle buttons */}
                        <button
                            onClick={() => setView("markdown")}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${view === "markdown"
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-gray-800 border"
                                }`}
                        >
                            Markdown Update
                        </button>
                        <button
                            onClick={() => setView("setQuestion")}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${view === "setQuestion"
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-gray-800 border"
                                }`}
                        >
                            Set Question
                        </button>

                        {/* Delete and Back buttons */}
                        <button
                            onClick={deleteProblem}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                            🗑 Delete Problem
                        </button>
                        <button
                            onClick={backButton}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                        >
                            ← Back to Test
                        </button>
                    </div>
                </div>

                {/* View content */}
                {view === "markdown" ? (
                    <MarkdownUpdate testId={testId} problemId={problemId} />
                ) : (
                    <SetQuestion testId={testId} problemId={problemId} />
                )}
            </div>
        </div>
    );
};

export default UpdateProblem;
