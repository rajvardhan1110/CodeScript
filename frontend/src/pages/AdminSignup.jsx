import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function AdminSignup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registershow, setRegistershow] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    async function signupadmin() {
        const data = {
            name: name,
            email: email,
            password: password
        }

        try {
            const response = await axios.post(`${API}/admin/signup`, data);
            if (response.data.msg === "invalid format") {
                setErrorMsg("Please enter valid information");
            } else if (response.data.msg === "User already exists") {
                setErrorMsg("An account with this email already exists");
            } else if (response.data.msg === "successfully admin signed up") {
                setSuccessMsg("Educator account created successfully");
                setTimeout(() => {
                    navigate("/admin/home");
                }, 1000);

            }
        } catch (e) {
            console.error("Error: ", e);
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
                {/* Educator Signup Form */}
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Educator Registration</h1>

                    </div>

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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                            onClick={signupadmin}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all shadow-md hover:shadow-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        >
                            Create Educator Account
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600">
                                Already registered?{' '}
                                <a
                                    href="/admin/signin"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate("/admin/signin", { replace: true });
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