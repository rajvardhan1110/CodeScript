// components/CodingQuestions.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import UserMarkdown from "./UserMarkdown";
import CodeEditor from "./CodeEditor";

const UserCodingQuestions = () => {
    const [codingQuestions, setCodingQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    //   const { testId } = useParams();
    const testId = "688e6eb6daef290f9db94f72";

    const token = localStorage.getItem("usertoken");

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const res = await axios.post(
                    "http://localhost:5050/user/test-problems",
                    { testId },
                    { headers: { token } }
                );
                if (res.status === 200) {
                    setCodingQuestions(res.data.problems || []);
                }
            } catch (err) {
                console.error("Failed to fetch coding questions");
            } finally {
                setLoading(false);
            }
        };

        if (testId) fetchQuestions();
    }, [testId]);

    return (
        <div className="w-full ">
            <h2 className="text-xl font-semibold mb-4 py-4 px-6 md:px-24">Coding Questions</h2>


            {loading ? (
                <div className="text-gray-500 italic">Loading questions...</div>
            ) : selectedQuestionId === null ? (
                codingQuestions.length === 0 ? (
                    <div className="text-gray-500 italic">No coding questions found.</div>
                ) : (
                    <div className="space-y-3 px-6 md:px-24">
                        {codingQuestions.map((q, index) => (
                            <div
                                key={q._id}
                                className="cursor-pointer border border-gray-300 rounded-md p-3 bg-white hover:bg-gray-50 transition"
                                onClick={() => setSelectedQuestionId(q._id)}
                            >
                                <h3 className="text-base font-medium text-gray-800">
                                    {index + 1}. {q.title || "Untitled Question"}
                                </h3>
                            </div>
                        ))}
                    </div>

                )
            ) : null}

            {selectedQuestionId && (
                <div className="w-full mt-6 flex flex-col md:flex-row gap-4">
                    {/* Left Side - Markdown */}
                    <div className="w-full md:w-1/2 p-4 border rounded-md bg-gray-100">
                        <UserMarkdown problemId={selectedQuestionId} />

                        <button
                            onClick={() => setSelectedQuestionId(null)}
                            className="mt-3 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                        >
                            Back to List
                        </button>
                    </div>

                    {/* Right Side - Code Editor */}
                    <div className="w-full md:w-1/2 p-4 border rounded-md bg-gray-100">
                        <CodeEditor problemId={selectedQuestionId}/>
                    </div>
                </div>
            )}






        </div>
    );
};

export default UserCodingQuestions;
