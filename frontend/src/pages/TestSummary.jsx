import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import config from "../../apiconfig";
const API = config.BASE_URL;

// import your UserCodingQuestions (no changes in its file)
import UserCodingQuestions from "../components/UserCodingQuestions";

export default function TestSummaryPage() {
  const { testId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [codingInfo, setCodingInfo] = useState({ totalQuestions: 0, totalMarks: 0 });
  const [viewType, setViewType] = useState("mcq"); // "mcq" or "coding"

  // Fetch summary
  useEffect(() => {
    async function fetchSummary() {
      const token = localStorage.getItem("usertoken");
      if (!token) {
        setError("User not authenticated. Please login again.");
        setLoading(false);
        return;
      }
      if (!testId || testId.length !== 24) {
        setError("Invalid test ID.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API}/summary?testId=${testId}`, {
          headers: { token },
        });
        if (res.data && res.data.show) {
          setSummaryData(res.data);
        } else {
          setError("Invalid summary response from server.");
        }
      } catch (err) {
        if (err.response?.data?.msg) {
          setError(`Error: ${err.response.data.msg}`);
        } else {
          setError("Server error. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [testId]);

  // Fetch coding info
  useEffect(() => {
    async function fetchCoding() {
      const token = localStorage.getItem("usertoken");
      if (!token || !testId) return;
      try {
        const res = await axios.post(
          "http://localhost:5050/checkTestCode",
          { testId },
          { headers: { token } }
        );
        if (res.data?.exists && res.data.totalQuestions > 0) {
          setCodingInfo({
            totalQuestions: res.data.totalQuestions,
            totalMarks: res.data.totalMarks,
          });
        } else {
          setCodingInfo({ totalQuestions: 0, totalMarks: 0 });
        }
      } catch {
        setCodingInfo({ totalQuestions: 0, totalMarks: 0 });
      }
    }
    fetchCoding();
  }, [testId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md max-w-md mx-auto shadow-lg">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="p-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-md max-w-md mx-auto shadow-lg">
          <h3 className="font-bold text-lg mb-2">Notice</h3>
          <p>Summary data not available.</p>
        </div>
      </div>
    );
  }

  // Prepare question info
  const { show, questions = [], resultData } = summaryData;
  const mcqQuestions = questions.filter(q => Array.isArray(q.options) && q.options.length > 0);
  const totalMcqMarks = summaryData.TotalMarks || summaryData.resultData?.TotalMarks;
  const codingQuestions = questions.filter(q => !Array.isArray(q.options) || q.options.length === 0);

  function getOptionClasses(option, question) {
    const qid = question._id;
    if (show === "reviewOnly") {
      if (option._id === question.correctAnswer) {
        return "bg-green-50 border border-green-200 shadow-sm";
      }
      return "bg-gray-50";
    }
    if (show === "fullReview") {
      const resp = resultData?.response?.find(r => r.questionId === qid);
      const isSelected = resp?.optionId === option._id;
      const isCorrect = question.correctAnswer === option._id;
      if (isSelected && isCorrect) {
        return "bg-green-50 border border-green-200 shadow-sm";
      } else if (isSelected && !isCorrect) {
        return "bg-red-50 border border-red-200 shadow-sm";
      } else if (!isSelected && isCorrect) {
        return "bg-green-50 border border-green-100 shadow-sm";
      }
    }
    return "bg-gray-50 hover:bg-gray-100 transition-colors";
  }

  function renderMCQQuestions() {
    if (!mcqQuestions.length) {
      return (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">No MCQ questions found.</p>
        </div>
      );
    }
    return mcqQuestions.map((q, idx) => (
      <div key={q._id} className="border border-gray-200 rounded-lg p-6 mb-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <h4 className="text-lg font-medium text-gray-800 mb-4">
          <span className="font-bold text-indigo-600">Q{idx + 1}.</span> {q.questionText}
        </h4>
        <div className="space-y-3">
          {q.options &&
            q.options.map(opt => (
              <div key={opt._id} className={`p-4 rounded-md transition-all ${getOptionClasses(opt, q)}`}>
                <div className="flex items-start">
                  <span className="mr-3 text-gray-500">{String.fromCharCode(65 + q.options.indexOf(opt))}.</span>
                  <div>
                    {opt.text}
                    {opt._id === q.correctAnswer && (
                      <span className="ml-2 text-green-600 text-sm flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Correct Answer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    ));
  }

  function renderFullWidthCoding() {
    return (
      <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen max-w-none bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <UserCodingQuestions />
        </div>
      </div>
    );
  }

  function renderContent() {
    const title = summaryData?.testName || resultData?.testName;
    const showTabs = (show === "reviewOnly" || show === "fullReview") && codingInfo.totalQuestions > 0;

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-indigo-500 to-blue-400 p-6 rounded-xl text-white shadow-lg">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span>📘</span> {title}
          </h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <h4 className="text-sm font-medium opacity-90">Total MCQ Marks</h4>
              <p className="text-xl font-bold">{totalMcqMarks}</p>
            </div>
            {codingInfo.totalQuestions > 0 && (
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                <h4 className="text-sm font-medium opacity-90">Coding Questions Marks</h4>
                <p className="text-xl font-bold">{codingInfo.totalMarks}</p>
              </div>
            )}
          </div>
        </div>
        
        {(() => {
          switch (show) {
            case "notSubmittedNoReview":
              return (
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-6 rounded-xl text-white shadow-lg">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span>❌</span> Test not submitted
                  </h2>
                  <p className="mt-2 opacity-90">
                    The test time is over. You can no longer attempt or view this test.
                  </p>
                </div>
              );
            case "reviewOnly":
              return (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 rounded-xl text-white shadow-lg">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <span>⚠️</span> Test not submitted
                    </h2>
                    <p className="mt-2 opacity-90">
                      You didn't submit the test, but review is allowed.
                    </p>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Test Questions</h3>
                  {showTabs && (
                    <div className="flex space-x-2 mb-6">
                      <button
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                          viewType === "mcq" 
                            ? "bg-indigo-600 text-white shadow-md" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setViewType("mcq")}
                      >
                        MCQ Questions
                      </button>
                      <button
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                          viewType === "coding" 
                            ? "bg-indigo-600 text-white shadow-md" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setViewType("coding")}
                      >
                        Coding Questions
                      </button>
                    </div>
                  )}
                  {showTabs
                    ? (viewType === "mcq"
                        ? renderMCQQuestions()
                        : renderFullWidthCoding())
                    : renderMCQQuestions()
                  }
                </div>
              );
            case "submittedNoResult":
              return (
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-xl text-white shadow-lg">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span>✅</span> Test submitted
                  </h2>
                  <p className="mt-2 opacity-90">
                    The result is not published yet. Please check back later.
                  </p>
                </div>
              );
            case "fullReview":
              return (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl text-white shadow-lg">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <span>✅</span> Test submitted and reviewed
                    </h2>
                    <h3 className="text-xl font-bold mt-3">
                      Your Total Score: {resultData?.score ?? 0}
                    </h3>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Your Responses</h3>
                  {showTabs && (
                    <div className="flex space-x-2 mb-6">
                      <button
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                          viewType === "mcq" 
                            ? "bg-indigo-600 text-white shadow-md" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setViewType("mcq")}
                      >
                        MCQ Questions
                      </button>
                      <button
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                          viewType === "coding" 
                            ? "bg-indigo-600 text-white shadow-md" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setViewType("coding")}
                      >
                        Coding Questions
                      </button>
                    </div>
                  )}
                  {showTabs
                    ? (viewType === "mcq"
                        ? renderMCQQuestions()
                        : renderFullWidthCoding())
                    : renderMCQQuestions()
                  }
                </div>
              );
            default:
              return (
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6 rounded-xl text-white shadow-lg">
                  <p>Unknown summary case.</p>
                </div>
              );
          }
        })()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <span className="bg-indigo-600 text-white p-2 rounded-lg">📝</span> 
          <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Test Summary
          </span>
        </h1>
        {renderContent()}
      </div>
    </div>
  );
}