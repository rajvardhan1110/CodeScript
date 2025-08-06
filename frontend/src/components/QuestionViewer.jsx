import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function QuestionViewer({ questionId, testId }) {
    const [question, setQuestion] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        const fetchQuestion = async () => {
            setIsLoading(true);
            try {
                const res = await axios.post(`${API}/getQuestion`, {
                    questionId
                }, {
                    headers: { token }
                });

                setQuestion(res.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching question:", err);
                setError("Failed to load question.");
            } finally {
                setIsLoading(false);
            }
        };

        if (questionId) fetchQuestion();
    }, [questionId, navigate]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this question?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");

            await axios.post(`${API}/deleteQuestion`, {
                questionId,
                testId
            }, {
                headers: { token }
            });

            alert("Question deleted successfully");
            window.location.reload(); 
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete question");
        }
    };

    // if (isLoading) {
    //     return (
    //         <div className="flex justify-center items-center h-64">
    //             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    //         </div>
    //     );
    // }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md max-w-md mx-auto">
                {error}
            </div>
        );
    }

    if (!question) {
        return (
            <div className="p-4 text-gray-600 text-center max-w-md mx-auto">
                No question selected
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Question Details</h2>
                <button 
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Question
                </button>
            </div>

            <div className="space-y-6">
                {/* Marks */}
                <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg">
                    <span className="font-medium text-gray-700">Marks:</span>
                    <span className="font-bold text-indigo-600">{question.marks}</span>
                </div>

                {/* Question Text */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Question:</h3>
                    <p className="text-gray-800 whitespace-pre-wrap">{question.questionText}</p>
                </div>

                {/* Options */}
                {question.options && question.options.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-medium text-gray-700">Options:</h3>
                        <ul className="space-y-2">
                            {question.options.map((opt, idx) => (
                                <li 
                                    key={opt._id} 
                                    className={`p-3 rounded-lg ${opt.text === question.correctAnswerText ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
                                >
                                    <div className="flex items-start">
                                        <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                                        <span className="whitespace-pre-wrap">{opt.text}</span>
                                    </div>
                                    {opt.text === question.correctAnswerText && (
                                        <div className="mt-1 text-sm text-green-600 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Correct Answer
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}