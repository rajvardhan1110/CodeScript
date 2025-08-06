import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserAlt } from 'react-icons/fa';

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function UserHome() {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [error, setError] = useState("");
    const [query, setQuery] = useState(""); // <-- added for search

    useEffect(() => {
        const fetchDraftTests = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setError("Authentication token missing. Please log in.");
                    navigate("/");
                    return;
                }

                const res = await axios.get(`${API}/draft`, {
                    headers: { token }
                });

                setTests(res.data.alltests || []);
                setError("");

            } catch (err) {
                console.error("Failed to fetch tests:", err);

                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem("token");
                    setError("Session expired. Please log in again.");
                    navigate("/");
                } else {
                    setError("Failed to load draft tests. Please try again later.");
                }
            }
        };

        fetchDraftTests();
    }, [navigate]);

    useEffect(() => {
        const onPopState = () => {
            localStorage.removeItem("token");
            navigate("/", { replace: true }); 
        };

        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [navigate]);

    function logout() {
        localStorage.removeItem("token");
        navigate("/");
    }

    function CreateTest() {
        navigate("/test/createtest");
    }

    function handleCardClick(test_id) {
        console.log(test_id);
        navigate(`/test/${test_id}`);
    }

    
    const filteredTests = tests.filter(test => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
            (test.title || "").toLowerCase().includes(q) ||
            String(test._id).toLowerCase().includes(q)
        );
    });
    

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-indigo-800">
                            <span className="text-indigo-600">Code</span>Script
                        </h1>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={CreateTest}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-emerald-200"
                        >
                            Create Test
                        </button>

                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-red-200"
                        >
                            Log Out
                        </button>

                        <button
                            onClick={() => navigate('/adminprofile')}
                            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-indigo-200 transition-all"
                            title="Admin Profile"
                        >
                            <FaUserAlt size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                        <p className="font-medium">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Page Title + Search */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Tests</h1>
                        <p className="text-gray-600 mt-2">Manage your curent and upcoming assessments</p>
                    </div>

                    {/*added: search bar  */}
                    <div className="w-full sm:w-96">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by test name or test ID..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        />
                    </div>
                  
                </div>

                {/* Test List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.length === 0 && !error ? (
                        <div className="col-span-full bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                            <h3 className="text-lg font-medium text-gray-700">No draft tests available</h3>
                            <p className="text-gray-500 mt-2">Create your first test to get started</p>
                            <button
                                onClick={CreateTest}
                                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Create New Test
                            </button>
                        </div>
                    ) : (
                        filteredTests.map(test => (
                            <div
                                key={test._id}
                                onClick={() => handleCardClick(test._id)}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 cursor-pointer transition-all hover:shadow-md group h-full flex flex-col"
                            >
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 line-clamp-2">
                                                {test.title || "Untitled Test"}
                                            </h2>

                                            {/* added: show test ID */}
                                            <p className="text-sm text-gray-500 mt-1">
                                                <span className="font-medium">Test ID:</span> {test._id}
                                            </p>
                                           

                                            <p className="text-gray-600 mt-1 line-clamp-3">
                                                {test.description || "No description provided"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">Start Time:</span>{" "}
                                        {test.testTime
                                            ? new Date(test.testTime).toLocaleString()
                                            : "Not scheduled"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    <p>Made with ❤️ by Rajvardhan Patil</p>
                    <p className="mt-1">© {new Date().getFullYear()} CodeScript. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
