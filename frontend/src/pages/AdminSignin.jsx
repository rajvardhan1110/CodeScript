import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function AdminSignin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginshow, setLoginshow] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    async function signinadmin() {
        const data = {
            email: email,
            password: password
        }

        try {
            const response = await axios.post(`${API}/admin/signin`, data);
            if (response.data.msg === "invalid email") {
                setErrorMsg("Invalid email");
            } else if (response.data.msg === "incorrect password") {
                setErrorMsg("Incorrect password");
            } else {
                const token = response.data.token;
                localStorage.setItem("token", token);

                setSuccessMsg("Account Login successfully! Redirecting...");

                setTimeout(() => {
                    navigate('/admin/home', { replace: true });
                }, 1000);

            }
        } catch (e) {
            console.error("Error: ", e);
        }
    }

    function forUser() {
        navigate("/user/signin", { replace: true });
    }

    function forAdmin() {
        navigate("/admin/signin", { replace: true });
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
                {/* Login Type Selector */}
                <div className="mb-8 flex space-x-4 bg-white p-2 rounded-full shadow-md">
                    <button
                        onClick={forUser}
                        className={`px-6 py-2 rounded-full transition-all ${window.location.pathname.includes('user') ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'}`}
                    >
                        Student Login
                    </button>
                    <button
                        onClick={forAdmin}
                        className={`px-6 py-2 rounded-full transition-all ${window.location.pathname.includes('admin') ? 'bg-emerald-100 text-emerald-800 font-medium' : 'hover:bg-gray-100'}`}
                    >
                        Educator Login
                    </button>
                </div>

                {/* Admin Signin Form */}
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Educator Portal</h1>
                    <p className="text-center text-gray-500 mb-6">Sign in to manage your courses</p>

                    {errorMsg && (
                        <div className="text-red-500 text-sm text-center mb-4">{errorMsg}</div>
                    )}

                    {successMsg && (
                        <div className="text-green-500 text-sm text-center mb-4">{successMsg}</div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                                placeholder="raj@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                                placeholder="Enter your password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <button
                            onClick={signinadmin}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md hover:shadow-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        >
                            Sign In
                        </button>

                        <div className="text-center pt-2">
                            <a
                                href="/admin/signup"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate("/admin/signup", { replace: true });
                                }}
                                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                Don&apos;t have educator access? <span className="font-medium">Request account</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}