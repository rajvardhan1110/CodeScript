import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function UserProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: "", email: "" });
    const [editField, setEditField] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "" });
    const [deletePassword, setDeletePassword] = useState("");
    const [showDeleteInput, setShowDeleteInput] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const token = localStorage.getItem("usertoken");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${API}/userinfo`, {
                    headers: { token }
                });
                setProfile(res.data);
                setFormData(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || "Failed to fetch user info");
                setMessage("");
            }
        };
        fetchUser();
    }, []);

    const handleFieldChange = async (field) => {
        try {
            const endpoint = field === "name" ? "/change-name" : "/change-email";
            const res = await axios.patch(`${API}/user${endpoint}`,
                { [field]: formData[field] },
                { headers: { token } }
            );
            setProfile(prev => ({ ...prev, [field]: formData[field] }));
            setMessage(res.data.msg || `${field} updated successfully`);
            setError("");
            setEditField(null);
        } catch (err) {
            setError(err.response?.data?.msg || `Failed to update ${field}`);
            setMessage("");
        }
    };

    const handlePasswordChange = async () => {
        try {
            const res = await axios.patch(`${API}/user/change-password`, passwordData, {
                headers: { token }
            });
            setMessage(res.data.msg || "Password updated successfully");
            setError("");
            setPasswordData({ oldPassword: "", newPassword: "" });
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to update password");
            setMessage("");
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await axios.delete(`${API}/user/delete`, {
                headers: { token },
                data: { password: deletePassword }
            });
            setMessage(res.data.msg || "Account deleted");
            setError("");

            if (localStorage.getItem("usertoken")) {
                localStorage.removeItem("usertoken");
            }

            navigate("/", { replace: true });
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to delete account");
            setMessage("");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg mb-4">
                        <FaUserAlt size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
                    <p className="text-gray-600 mt-1">Manage your account settings</p>
                </div>

                {/* Name Field */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {editField === "name" ? (
                        <div className="flex gap-2">
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                            />
                            <button 
                                onClick={() => handleFieldChange("name")}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <p className="text-gray-800">{profile.name}</p>
                            <button 
                                onClick={() => setEditField("name")}
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Change
                            </button>
                        </div>
                    )}
                </div>

                {/* Email Field */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {editField === "email" ? (
                        <div className="flex gap-2">
                            <input
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                            />
                            <button 
                                onClick={() => handleFieldChange("email")}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <p className="text-gray-800">{profile.email}</p>
                            <button 
                                onClick={() => setEditField("email")}
                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Change
                            </button>
                        </div>
                    )}
                </div>

                {/* Password Change */}
                <div className="border-t border-gray-200 pt-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                    
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Current Password"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 pr-10"
                            />
                            <button 
                                onClick={() => setShowOldPassword(prev => !prev)}
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                                {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 pr-10"
                            />
                            <button 
                                onClick={() => setShowNewPassword(prev => !prev)}
                                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <button 
                            onClick={handlePasswordChange}
                            className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors shadow-sm hover:shadow-emerald-200"
                        >
                            Update Password
                        </button>
                    </div>
                </div>

                {/* Delete Account */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h3>
                    
                    {!showDeleteInput ? (
                        <button 
                            onClick={() => setShowDeleteInput(true)}
                            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                        >
                            Delete My Account
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">This action cannot be undone. Please enter your password to confirm.</p>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                            />
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowDeleteInput(false)}
                                    className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Feedback Messages */}
                {message && (
                    <div className="mt-6 p-3 bg-green-100 text-green-700 rounded-md">
                        {message}
                    </div>
                )}
                {error && !message && (
                    <div className="mt-6 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}