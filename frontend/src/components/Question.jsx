// Question.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Option from "./Option";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function Question({ questionId, testId, markAttempted }) {
    const [question, setQuestion] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        async function fetchQuestion() {
            try {
                const token = localStorage.getItem("usertoken");
                const res = await axios.post(`${API}/liveQuestion`, {
                    questionId,
                    testId
                }, {
                    headers: { token }
                });

                setQuestion(res.data.question);
                setSelected(res.data.userAnswer);
            } catch (err) {
                console.error("Failed to fetch question", err);
            }
        }

        fetchQuestion();
    }, [questionId, testId]);

    async function handleOptionSelect(optionId) {
        try {
            const token = localStorage.getItem("usertoken");
            await axios.post(`${API}/studentResponse`, {
                testId,
                questionId,
                optionId
            }, {
                headers: { token }
            });

            setSelected(optionId);
            markAttempted(questionId);
        } catch (err) {
            console.error("Failed to save response", err);
        }
    }

    if (!question) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {question.questionText}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((opt) => (
                    <Option
                        key={opt._id}
                        option={opt}
                        onSelect={() => handleOptionSelect(opt._id)}
                        selected={opt._id === selected}
                    />
                ))}
            </div>
        </div>
    );
}