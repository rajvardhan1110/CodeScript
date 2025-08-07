// components/CodingQuestions.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import UserMarkdown from "./UserMarkdown";
import CodeEditor from "./CodeEditor";
import Split from 'react-split'
import { useParams } from "react-router-dom";

const UserCodingQuestions = () => {
    const { testId } = useParams();

    const [codingQuestions, setCodingQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    // console.log(testId);
    // const testId = "688e6eb6daef290f9db94f72";

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

            {loading ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : selectedQuestionId === null ? (
                codingQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg">No coding questions found</p>
                    </div>
                ) : (
                    <div className="max-w-7xl mx-auto p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Coding Questions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {codingQuestions.map((q, index) => (
                                <div
                                    key={q._id}
                                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedQuestionId(q._id)}
                                >
                                    <div className="flex items-start">
                                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 text-sm mr-3">
                                            {index + 1}
                                        </div>
                                        <h3 className="font-medium text-gray-800 flex-1">
                                            {q.title || "Untitled Question"}
                                        </h3>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                )
            ) : null}

            {selectedQuestionId && (
                <div className="w-full mt-6">
                    {/* Mobile view - stacked (full width) */}
                    <div className="block md:hidden space-y-4">
                        <div className="p-4 border rounded-md bg-gray-100 overflow-auto w-full">
                            <UserMarkdown problemId={selectedQuestionId} />
                            <button
                                onClick={() => setSelectedQuestionId(null)}
                                className="mt-3 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                            >
                                Back to List
                            </button>
                        </div>
                        <div className="p-4 border rounded-md bg-gray-100 overflow-auto w-full">
                            <CodeEditor problemId={selectedQuestionId} />
                        </div>
                    </div>

                    {/* Desktop view - split */}
                    <div className="hidden md:block">
                        <Split
                            className="flex w-full flex-1"
                            sizes={[43, 57]}
                            minSize={[200, 300]}
                            gutterSize={10}
                            gutterAlign="center"
                            direction="horizontal"
                            cursor="col-resize"
                            gutter={(index, direction) => {
                                const gutter = document.createElement('div')
                                gutter.className = `gutter gutter-${direction} bg-gray-300 hover:bg-blue-400 transition-colors duration-200 relative group`
                                return gutter
                            }}
                        >
                            <div className="p-4 border rounded-md bg-gray-100 overflow-auto">
                                <UserMarkdown problemId={selectedQuestionId} />
                                <button
                                    onClick={() => setSelectedQuestionId(null)}
                                    className="mt-3 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                                >
                                    Back to List
                                </button>
                            </div>
                            <div className="p-4 border rounded-md bg-gray-100 overflow-auto">
                                <CodeEditor problemId={selectedQuestionId} />
                            </div>
                        </Split>
                    </div>
                </div>
            )}


        </div>
    );
};

export default UserCodingQuestions;
