import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function UserSignin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    async function signinuser() {
        const data = { email, password };
        setErrorMsg(''); // clear previous errors

        try {
            const response = await axios.post(`${API}/user/signin`, data);
            const { token, msg } = response.data;

            if (token) {
                localStorage.setItem("usertoken", token);
                setSuccessMsg("Account Login successfully! Redirecting...");
                setTimeout(() => {
                    navigate('/user/home', { replace: true });
                }, 1000);

            } else if (msg) {
                setErrorMsg(msg);
            } else {
                setErrorMsg("Unexpected error. Please try again.");
            }
        } catch (e) {
            if (e.response && e.response.data && e.response.data.msg) {
                setErrorMsg(e.response.data.msg);
            } else {
                setErrorMsg("Server error. Please try again later.");
            }
        }
    }

    function forUser() {
        navigate("/user/signin", { replace: true });
    }

    function forAdmin() {
        navigate("/admin/signin", { replace: true });
    }

    const goToSignup = (e) => {
        e.preventDefault();
        navigate("/user/signup", { replace: true }); 
    };

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
                        className={`px-6 py-2 rounded-full transition-all ${window.location.pathname.includes('user') ? 'bg-indigo-100 text-indigo-800 font-medium' : 'hover:bg-gray-100'}`}
                    >
                        Student Login
                    </button>
                    <button
                        onClick={forAdmin}
                        className={`px-6 py-2 rounded-full transition-all ${window.location.pathname.includes('admin') ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'}`}
                    >
                        Educator Login
                    </button>
                </div>

                {/* Student Signin Form */}
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Student Sign In</h1>
                    <p className="text-center text-gray-500 mb-6">Continue your learning journey</p>

                    {/* Error Message */}
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
                                placeholder="student@gmail.com"
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
                            onClick={signinuser}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md hover:shadow-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        >
                            Sign In
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600">
                                New to CodeScript?{' '}
                                <a
                                    href="/user/signup"
                                    onClick={goToSignup}
                                    className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    Create account
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
