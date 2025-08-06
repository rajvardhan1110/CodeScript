import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserAlt } from 'react-icons/fa';
import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function UserHome() {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");

    function logout() {
        if (localStorage.getItem("usertoken")) {
            localStorage.removeItem("usertoken");
        }
        navigate("/");
    }

    useEffect(() => {
        const onPopState = () => {
            localStorage.removeItem("usertoken");
            navigate("/", { replace: true }); 
        };

        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [navigate]);

    useEffect(() => {
        async function fetchTests() {
            try {
                const token = localStorage.getItem("usertoken");
                if (!token) {
                    setError("No token found. Please login.");
                    logout();
                    return;
                }

                const response = await axios.get(`${API}/allTests`, {
                    headers: { token }
                });

                setTests(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching tests:", error);

                setLoading(false);
                if (error.response) {
                    if (error.response.status === 401) {
                        setError("Session expired. Please login again.");
                        logout();
                    } else {
                        setError(error.response.data?.msg || "Server error occurred");
                    }
                } else {
                    setError("Network error. Please try again later.");
                }
            }
        }

        fetchTests();
    }, []);

    const handleCardClick = (testId) => {
        navigate(`/testInfo/${testId}`);
    };

    const filteredTests = tests.filter(test => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
            test.title?.toLowerCase().includes(q) ||
            String(test.testId).toLowerCase().includes(q)
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
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-red-200"
                        >
                            Log Out
                        </button>

                        <button
                            onClick={() => navigate('/userprofile')}
                            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-indigo-200 transition-all"
                            title="Profile"
                        >
                            <FaUserAlt size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Title + Search (responsive) */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Available Tests</h2>
                        <p className="text-gray-600 mt-2">
                            Select a test to begin your assessment<br />
                            Below you'll find upcoming, ongoing, and completed tests.
                        </p>
                    </div>

                    {/* Search bar goes to the right on ≥ sm, below on < sm */}
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

                {/* Loading and Error States */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                        <p className="font-medium">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Tests Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTests.map(test => (
                            <div
                                key={test.testId}
                                onClick={() => handleCardClick(test.testId)}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-300 cursor-pointer transition-all hover:shadow-md group"
                            >
                                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 mb-3">
                                    {test.title}
                                </h3>

                                {/* Test ID shown */}
                                <p className="text-sm text-gray-500 mb-2">
                                    <span className="font-medium">Test ID:</span> {test.testId}
                                </p>

                                <p className="text-gray-600 mb-4 line-clamp-2">
                                    {test.description}
                                </p>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Total Marks:</span>
                                        <span>{test.totalMarks}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Date:</span>
                                        <span>{test.date === "upcoming" ? "Upcoming" : new Date(test.date).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Duration:</span>
                                        <span>{test.totalTime} minutes</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && tests.length === 0 && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                        <h3 className="text-lg font-medium text-gray-700">No tests available</h3>
                        <p className="text-gray-500 mt-2">Check back later for new assessments</p>
                    </div>
                )}
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
