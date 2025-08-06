import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import config from "../../apiconfig";
const API = config.BASE_URL;
export default function AddQuestion({ testId, onCancel, setQuestionsVisible,setAllQuestions,setSelectedQuestionId }) {

    const { id } = useParams();
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [correctAnswerText, setCorrectAnswerText] = useState("");
    const [marks, setMarks] = useState(1);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
    };

    const addOption = () => {
        if (options.length >= 6) {
            alert("Maximum 6 options allowed.");
            return;
        }
        setOptions([...options, ""]);
    };

    const removeOption = (index) => {
        if (options.length <= 2) {
            alert("Minimum 2 options required.");
            return;
        }
        const updatedOptions = options.filter((_, i) => i !== index);
        setOptions(updatedOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Login required");
            return;
        }

        // Validation
        if (!questionText.trim() || !correctAnswerText.trim()) {
            setError("Question and correct answer are required.");
            return;
        }

        if (options.some(opt => !opt.trim())) {
            setError("All option fields must be filled.");
            return;
        }

        const matchingOption = options.find(opt => opt.trim() === correctAnswerText.trim());
        if (!matchingOption) {
            setError("Correct answer text must match one of the options.");
            return;
        }

        try {
            const response = await axios.post(`${API}/createQuestion`, {
                testId,
                questionText,
                options: options.map(text => ({ text: text.trim() })),
                correctAnswerText: correctAnswerText.trim(),
                marks: Number(marks)
            }, {
                headers: { token }
            });

            setSuccessMessage(response.data.msg || "Question added successfully!");
            // setTimeout(() => {
            //     onCancel();
            //     // setQuestionsVisible(true);
            //     // window.location.reload();
            // }, 1500);
        } catch (err) {
            console.error("Error in submission:", err);
            setError(err.response?.data?.error || "Failed to add question");
        }
    };

    useEffect(()=>{
        // setQuestionsVisible(true);
        const fetchque = async () => {
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
            } catch(e) {
                setError("error in question fetching");
                console.log(e);
            }
        }

        fetchque();
    },[handleSubmit])
    return (
       <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto -ml-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Question</h2>

            {/* Status Messages */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    <strong>Error:</strong> {error}
                </div>
            )}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <textarea
                        value={questionText}
                        onChange={(e) => {
                            setQuestionText(e.target.value);
                            setError("");
                        }}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                        placeholder="Enter the question text"
                    />
                </div>

                {/* Options */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                    <div className="space-y-2">
                        {options.map((opt, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-gray-600 w-6">{index + 1}.</span>
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                    placeholder={`Option ${index + 1}`}
                                />
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="p-2 text-red-600 hover:text-red-800"
                                        title="Remove option"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center gap-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Option
                    </button>
                </div>

                {/* Correct Answer */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                    <input
                        type="text"
                        value={correctAnswerText}
                        onChange={(e) => {
                            setCorrectAnswerText(e.target.value);
                            setError("");
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                        placeholder="Enter the correct answer (must match one option exactly)"
                    />
                </div>

                {/* Marks */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                    <input
                        type="number"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        min="1"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm"
                    >
                        Add Question
                    </button>
                </div>
            </form>
        </div>
    );
}