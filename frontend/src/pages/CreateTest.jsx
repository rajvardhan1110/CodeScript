import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function CreateTest() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    async function create() {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Authentication token missing. Please log in.");
            navigate("/");
            return;
        }

        if (title.trim() === "") {
            alert("Title is required.");
            return;
        }

        try {
            const res = await axios.post(
                `${API}/createtest`,
                {
                    title: title.trim(),
                    description: description.trim(),
                },
                {
                    headers: {
                        token: token,
                    },
                }
            );

            alert(res.data.msg);
            console.log("Test ID:", res.data.testid);
            navigate("/admin/home");

        } catch (err) {
            if (err.response) {
                const status = err.response.status;
                const msg = err.response.data.msg || "Unknown error";

                if (status === 400) {
                    alert("❗ Bad Request: " + msg);
                } else if (status === 401) {
                    alert("⛔ Unauthorized: " + msg);
                    localStorage.removeItem("token");
                    navigate("/");
                } else if (status === 403) {
                    alert("🚫 Forbidden: " + msg);
                    localStorage.removeItem("token");
                    navigate("/");
                } else {
                    alert("⚠️ Server error: " + msg);
                }

            } else if (err.request) {
                alert("❌ Network error. Please check your internet.");
            } else {
                alert("⚠️ Error: " + err.message);
            }

            console.error("Error in create test frontend:", err);
        }
    }

    function adminhome(){
        navigate("/admin/home");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col items-center justify-center p-4">
            {/* Header */}
            <div className="w-full max-w-4xl mb-8">
                <h1 className="text-3xl font-bold text-indigo-800">
                    <span className="text-indigo-600">Code</span>Script
                </h1>
            </div>

            {/* Form Container */}
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Assessment</h2>
                
                <div className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assessment Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Midterm Exam - Introduction to Programming"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide instructions or details about this assessment..."
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button 
                            onClick={adminhome}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={create}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-emerald-200"
                        >
                            Create Assessment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}