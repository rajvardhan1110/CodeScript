import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function UserSignup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    async function signupuser() {
        setErrorMsg('');
        const data = { name, email, password };

        try {
            const response = await axios.post(`${API}/user/signup`, data);
            const msg = response.data.msg;

            if (msg === "invalid format") {
                setErrorMsg("Please enter valid name, email, and password");
            } else if (msg === "User already exists") {
                setErrorMsg("An account with this email already exists");
            } else if (msg === "successfully user signed up") {
                setSuccessMsg("Account created successfully! Redirecting...");
                setTimeout(() => {
                    navigate("/user/signin", { replace: true });
                }, 1000);
            } else {
                setErrorMsg("Unexpected error. Please try again.");
            }
        } catch (e) {
            console.error("Error: ", e);
            setErrorMsg("Server error. Please try again later.");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
            {/* Header */}
            <div className="pt-8 px-8">
                <h1 className="text-3xl font-bold text-indigo-800">
                    <span className="text-indigo-600">Code</span>Script
                </h1>
            </div>

            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4">
                {/* User Signup Form */}
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">User Registration</h1>
                        <p className="text-gray-500 mt-2">Create your account</p>
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="text-red-500 text-sm text-center mb-4">{errorMsg}</div>
                    )}

                    {successMsg && (
                        <div className="text-green-500 text-sm text-center mb-4">{successMsg}</div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                                placeholder="Rajvardhan Patil"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                                placeholder="raj@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                                placeholder="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2">Use a strong password with letters, numbers, and symbols</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <button
                            onClick={signupuser}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md hover:shadow-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        >
                            Create Account
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600">
                                Already registered?{' '}
                                <a
                                    href="/user/signin"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate("/user/signin", { replace: true });
                                    }}
                                    className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    Sign in here
                                </a>

                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
