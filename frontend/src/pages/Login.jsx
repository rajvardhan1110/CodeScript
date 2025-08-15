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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4 font-sans text-center">
      {/* Logo/Branding */}
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold text-indigo-900 tracking-tight m-0 leading-tight">
          <span className="text-indigo-600">Code</span>Script
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
          Empowering live assessments for MCQs and coding questions
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Student Card */}
          <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">
              For Students
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Participate in real-time exams featuring multiple-choice questions and coding challenges with our multi-language code editor.
            </p>
            <button 
              onClick={forUser}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg border-none cursor-pointer transition-colors duration-200 hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200"
            >
              Student Login
            </button>
          </div>

          {/* Educator Card */}
          <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <h2 className="text-2xl font-bold text-indigo-900 mb-4">
              For Educators
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Design and schedule tests with MCQs and coding problems, manage live exams, track progress, and generate final results.
            </p>
            <button 
              onClick={forAdmin}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg border-none cursor-pointer transition-colors duration-200 hover:bg-emerald-700 shadow-emerald-100 hover:shadow-emerald-200"
            >
              Educator Login
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white/70 p-6 rounded-lg max-w-3xl mx-auto backdrop-blur-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-indigo-900 mb-4">
            About CodeScript
          </h3>
          <p className="text-gray-600 leading-relaxed">
            CodeScript is a powerful online testing platform where educators can create tests containing both
            multiple-choice questions and coding challenges. Students can register and participate in real-time
            exams scheduled by educators.
          </p>
        </div>
      </div>
    </div>
  );
}