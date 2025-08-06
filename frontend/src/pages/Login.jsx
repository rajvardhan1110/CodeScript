import { useNavigate } from "react-router-dom";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function Login() {
  const navigate = useNavigate();

  function forUser() {
    navigate("/user/signin");
  }

  function forAdmin() {
    navigate("/admin/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col items-center justify-center p-4">
      {/* Logo/Branding */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-indigo-800">
          <span className="text-indigo-600">Code</span>Script
        </h1>
        
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg space-y-6 border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Select your role to continue</p>
        </div>

        <div className="flex flex-col space-y-4">
          <button 
            onClick={forUser}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 
                      focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-md hover:shadow-indigo-200"
          >
            Continue as Student
          </button>
          <button 
            onClick={forAdmin}
            className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 
                      focus:outline-none focus:ring-4 focus:ring-emerald-100 shadow-md hover:shadow-emerald-200"
          >
            Continue as Educator
          </button>
        </div>

        
      </div>
    </div>
  );
}