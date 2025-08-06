import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { register } from "../api/register";
import { unregister } from "../api/unregister";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function TestInfo() {
    const { testId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [phase, setPhase] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [testTime, setTestTime] = useState(null);
    const [totalTime, setTotalTime] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [totalMarks, setTotalMarks] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [countdown, setCountdown] = useState("");

    // NEW: small feedback for copy buttons
    const [copiedWhat, setCopiedWhat] = useState(null); // 'id' | 'link' | null

    useEffect(() => {
        const fetchTestInfo = async () => {
            try {
                const token = localStorage.getItem("usertoken");

                if (!token) {
                    navigate('/', { replace: true });
                }

                const response = await axios.get(
                    `${API}/testInfo?testId=${testId}`,
                    {
                        headers: { token }
                    }
                );

                const data = response.data;

                if (data.msg === "Test is not available") {
                    setError("Test not found.");
                } else if (data.msg === "over") {
                    setPhase("over");
                    navigate(`/testInfo/${testId}/summary`, { replace: true });
                } else {
                    setPhase(data.phase);
                    setIsRegistered(data.isRegistered);
                    setTitle(data.title || "");
                    setDescription(data.description || "");
                    setTotalMarks(data.totalMarks || "not set");
                    if (data.testTime) setTestTime(new Date(data.testTime));
                    if (data.totalTime) setTotalTime(data.totalTime);

                    if (data.phase === "running" && data.isRegistered) {
                        try {
                            const res = await axios.get(`${API}/test-submission-check`, {
                                params: { testId },
                                headers: { token }
                            });

                            if (res.data.submitted) {
                                navigate(`/testInfo/${testId}/summary`, { replace: true });
                            } else {
                                navigate(`/testInfo/${testId}/live`, { replace: true });
                            }
                        } catch (error) {
                            console.error("Error checking test submission:", error);
                            alert("Something went wrong while checking your submission status. Please try again later.");
                        }
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Error fetching test info.");
            } finally {
                setLoading(false);
            }
        };

        fetchTestInfo();
    }, [testId, navigate]);

    // Countdown timer
    useEffect(() => {
        if (phase !== "upcoming" || !testTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = testTime.getTime() - now.getTime();

            if (diff <= 0) {
                clearInterval(interval);
                window.location.reload();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown(
                `${String(hours).padStart(2, '0')} Hours : ${String(minutes).padStart(2, '0')} Minutes : ${String(seconds).padStart(2, '0')} Seconds`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [testTime, phase]);

    const handleToggleRegistration = async () => {
        setActionLoading(true);
        setActionError(null);
        try {
            if (isRegistered) {
                const res = await unregister(testId);
                if (res.msg === "Unregistered successfully") {
                    alert(res.msg);
                    setIsRegistered(false);
                } else {
                    throw new Error(res.msg || "Unregistration failed");
                }
            } else {
                const res = await register(testId);
                if (res.msg === "Registered successfully") {
                    alert(res.msg);
                    setIsRegistered(true);

                    if (phase === "running") {
                        navigate(`/testInfo/${testId}/live`, { replace: true });
                    }
                } else {
                    throw new Error(res.msg || "Registration failed");
                }
            }
        } catch (err) {
            console.error("Toggle error:", err);
            if (err.response?.data?.msg) {
                setActionError(err.response.data.msg);
            } else {
                setActionError(err.message || "Something went wrong.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    //copy helpers
    const handleCopyTestId = async () => {
        try {
            await navigator.clipboard.writeText(testId);
            setCopiedWhat("id");
            setTimeout(() => setCopiedWhat(null), 2000);
        } catch (e) {
            console.error("Copy failed", e);
            alert("Failed to copy test id");
        }
    };

    const handleCopyLink = async () => {
        try {
            const link = `http://localhost:5173/testInfo/${testId}`;
            await navigator.clipboard.writeText(link);
            setCopiedWhat("link");
            setTimeout(() => setCopiedWhat(null), 2000);
        } catch (e) {
            console.error("Copy failed", e);
            alert("Failed to copy link");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-700">Loading test info...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                    <div className="text-red-500 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        <p className="text-gray-600">{description}</p>
                    </div>

                    {/*  copy buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleCopyTestId}
                            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
                        >
                            {copiedWhat === "id" ? "Copied ID!" : "Copy Test ID"}
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                        >
                            {copiedWhat === "link" ? "Copied Link!" : "Copy Link"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Marks</p>
                        <p className="font-medium text-lg">{totalMarks}</p>
                    </div>

                    {(phase === "upcoming" || (phase === "running" && !isRegistered)) && testTime && (
                        <>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Start Time</p>
                                <p className="font-medium text-lg">{testTime.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Duration</p>
                                <p className="font-medium text-lg">{totalTime} minutes</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium text-lg">
                                    {isRegistered ? (
                                        <span className="text-green-600">Registered</span>
                                    ) : (
                                        <span className="text-yellow-600">Not Registered</span>
                                    )}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {(phase === "upcoming" || (phase === "running" && !isRegistered)) && (
                    <div className="space-y-6">
                        {(testTime || phase === "running") && (
                            <div className="bg-indigo-50 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-500 mb-2">
                                    {phase === "running" && !isRegistered ? "Status" : "Time Remaining"}
                                </p>
                                <p className="font-mono text-xl font-bold text-indigo-700">
                                    {phase === "running" && !isRegistered ? "Running" : countdown}
                                </p>
                            </div>
                        )}

                        {actionError && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-md text-center">
                                {actionError}
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                onClick={handleToggleRegistration}
                                disabled={actionLoading}
                                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                                    isRegistered
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-emerald-600 hover:bg-emerald-700"
                                } ${actionLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {actionLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isRegistered ? "Unregistering..." : "Registering..."}
                                    </span>
                                ) : isRegistered ? (
                                    "Unregister"
                                ) : (
                                    "Register"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
