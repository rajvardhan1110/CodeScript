import React, { useEffect, useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import confetti from 'canvas-confetti';

const languageOptions = [
  { id: 50, label: "C" },
  { id: 54, label: "C++" },
  { id: 62, label: "Java" },
  { id: 63, label: "JavaScript" },
  { id: 71, label: "Python" },
  { id: 74, label: "TypeScript" },
  { id: 60, label: "Go" },
];

const CodeEditor = ({ problemId }) => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("usertoken");

  const [languageId, setLanguageId] = useState();
  const [code, setCode] = useState("");
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [loadingStates, setLoadingStates] = useState({
    boilerplate: false,
    userCode: false,
    saveCode: false,
    run: false,
    submit: false,
  });

  const [sampleTests, setSampleTests] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);

  const [runVerdicts, setRunVerdicts] = useState([]);
  const [runError, setRunError] = useState(null);
  const [submitResult, setSubmitResult] = useState({ message: "", isError: false });
  const [submitVerdicts, setSubmitVerdicts] = useState([]);
  const [submitError, setSubmitError] = useState(null);

  const [showSubmissions, setShowSubmissions] = useState(false);
  const [submissionList, setSubmissionList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionListError, setSubmissionListError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loadingOneSubmission, setLoadingOneSubmission] = useState(false);
  const [oneSubmissionError, setOneSubmissionError] = useState('');

  const debounceTimer = useRef(null);
  const skipAutoSave = useRef(false);
  const skipNextBoilerplateFetch = useRef(false);
  const prevLangId = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchUserCode();
      fetchSampleTestCases();
    }
    return () => clearTimeout(debounceTimer.current);
    // eslint-disable-next-line
  }, []);

  const fetchUserCode = async () => {
    setLoadingStates((prev) => ({ ...prev, userCode: true }));
    try {
      const res = await axios.post(
        "http://localhost:5050/getUserCode",
        { testId, problemId },
        { headers: { token } }
      );
      const { code: fetchedCode, language_id } = res.data;
      const lang = language_id ?? 54;
      if (!fetchedCode || fetchedCode.trim() === "") {
        skipAutoSave.current = true;
        if (prevLangId.current !== lang) {
          setLanguageId(lang);
        } else {
          await fetchBoilerplate(lang);
        }
      } else {
        setCode(fetchedCode);
        if (prevLangId.current !== lang) {
          skipNextBoilerplateFetch.current = true;
          setLanguageId(lang);
        }
      }
    } catch { }
    finally {
      setLoadingStates((prev) => ({ ...prev, userCode: false }));
    }
  };

  const fetchBoilerplate = async (langId) => {
    setLoadingStates((prev) => ({ ...prev, boilerplate: true }));
    try {
      const res = await axios.post(
        "http://localhost:5050/get-boilerplates",
        { languageId: langId },
        { headers: { token } }
      );
      setCode(res.data.boilerplateCode || "");
    } catch { }
    finally {
      setLoadingStates((prev) => ({ ...prev, boilerplate: false }));
    }
  };

  useEffect(() => {
    if (skipNextBoilerplateFetch.current) {
      skipNextBoilerplateFetch.current = false;
      return;
    }
    if (prevLangId.current !== languageId) {
      prevLangId.current = languageId;
      skipAutoSave.current = true;
      fetchBoilerplate(languageId);
    }
    // eslint-disable-next-line
  }, [languageId]);

  const fetchSampleTestCases = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5050/getSampleTestCase",
        { problemId },
        { headers: { token } }
      );
      const { sampleTestCases } = res.data;
      setSampleTests(sampleTestCases || []);
      if (sampleTestCases?.length > 0) {
        setSelectedSampleId(sampleTestCases[0]._id);
        setSelectedSample(sampleTestCases[0]);
      }
    } catch { }
  };

  const handleSampleClick = (sample) => {
    setSelectedSampleId(sample._id);
    setSelectedSample(sample);
  };
  const handleLanguageChange = (e) => {
    setLanguageId(Number(e.target.value));
  };
  const handleResetToBoilerplate = () => {
    skipAutoSave.current = true;
    fetchBoilerplate(languageId);
  };

  const saveCode = async (currentCode) => {
    if (!currentCode) return;
    setAutoSaveStatus("saving");
    setLoadingStates((prev) => ({ ...prev, saveCode: true }));
    try {
      await axios.post(
        "http://localhost:5050/uploadUserCode",
        {
          code: currentCode,
          language_id: languageId,
          testId,
          problemId,
        },
        { headers: { token } }
      );
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus(""), 2000);
    } catch {
      setAutoSaveStatus("error");
    } finally {
      setLoadingStates((prev) => ({ ...prev, saveCode: false }));
    }
  };
  const handleEditorChange = (value) => {
    const updatedCode = value || "";
    setCode(updatedCode);
    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      return;
    }
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveCode(updatedCode);
    }, 1000);
  };

  const getEditorLang = (id) => {
    switch (id) {
      case 50: return "c";
      case 54: return "cpp";
      case 62: return "java";
      case 63: return "javascript";
      case 71: return "python";
      case 74: return "typescript";
      case 60: return "go";
      default: return "plaintext";
    }
  };

  const handleRun = async () => {
    setSubmitResult({ message: "", isError: false });
    setSubmitVerdicts([]);
    setSubmitError(null);
    setRunVerdicts([]);
    setRunError(null);
    setLoadingStates((prev) => ({ ...prev, run: true }));
    try {
      const res = await axios.post(
        "http://localhost:5050/runUserTestCase",
        { code, language_id: languageId, problemId },
        { headers: { token } }
      );
      setRunVerdicts(res.data.verdicts || []);
      setRunError(null);
    } catch (err) {
      const error = err.response?.data;
      setRunError({
        type: error?.status || "Error",
        message: error?.testCase?.compile_output || error?.testCase?.stderr || error?.msg || "Run failed",
        testCase: error?.testCase || null
      });
      setRunVerdicts([]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, run: false }));
    }
  };

  const handleSubmit = async () => {
    setRunVerdicts([]);
    setRunError(null);
    setSubmitResult({ message: "", isError: false });
    setSubmitVerdicts([]);
    setSubmitError(null);
    setLoadingStates(prev => ({ ...prev, submit: true }));
    try {
      const res = await axios.post(
        "http://localhost:5050/submitCodeUser",
        { code, language_id: languageId, testId, problemId },
        { headers: { token } }
      );
      if (res.data.msg === "All test cases passed") {
        setSubmitResult({ message: "All test cases passed!", isError: false });
        setSubmitVerdicts([]);
        setSubmitError(null);
      } else if (res.data.msg === "Sample test case(s) failed") {
        setSubmitResult({ message: "❌ Sample test failed", isError: true });
        setSubmitVerdicts(res.data.verdicts || []);
        setSubmitError(null);
      } else if (res.data.msg?.startsWith("Wrong answer on hidden test case")) {
        setSubmitResult({ message: `${res.data.msg}`, isError: true });
        setSubmitVerdicts([]);
        setSubmitError(null);
      } else if (
        res.data.msg === "Compilation Error" ||
        res.data.msg === "Time Limit Exceeded" ||
        res.data.msg === "Runtime Error"
      ) {
        const failed = (res.data.verdicts || []).find(v => v.verdict !== "Accepted");
        setSubmitError({
          type: res.data.msg,
          message: failed?.errorDetails?.compile_output ||
            failed?.errorDetails?.stderr ||
            res.data?.msg,
          errorDetails: failed?.errorDetails,
          testCase: failed
        });
        setSubmitVerdicts(res.data.verdicts || []);
        setSubmitResult({ message: `❌ ${res.data.msg}`, isError: true });
      } else {
        setSubmitResult({ message: res.data.msg || "Submission complete", isError: false });
        setSubmitVerdicts([]);
        setSubmitError(null);
      }
    } catch (err) {
      const error = err.response?.data;
      if (
        error?.msg === "Compilation Error" ||
        error?.msg === "Time Limit Exceeded" ||
        error?.msg === "Runtime Error"
      ) {
        setSubmitError({
          type: error.msg,
          message: error.compile_output || error.stderr || error.status || "",
          errorDetails: error,
          testCase: error.testCase || null
        });
        setSubmitResult({ message: `❌ ${error.msg}`, isError: true });
        setSubmitVerdicts([]);
      } else if (error?.msg?.startsWith("Wrong answer on hidden test case")) {
        setSubmitResult({ message: `❌ ${error.msg}`, isError: true });
        setSubmitError(null);
        setSubmitVerdicts([]);
      } else {
        setSubmitResult({ message: "❌ Internal server error", isError: true });
        setSubmitError(null);
        setSubmitVerdicts([]);
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, submit: false }));
    }
  };

  const getSubmissionList = async () => {
    setLoadingSubmissions(true);
    setSubmissionList([]);
    setSubmissionListError('');
    setSelectedSubmission(null);
    setOneSubmissionError('');
    try {
      const res = await axios.post(
        'http://localhost:5050/history/list',
        { testId, problemId },
        { headers: { token } }
      );
      setSubmissionList(res.data || []);
    } catch (err) {
      setSubmissionListError('Failed to fetch submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const getSingleSubmission = async (submissionId) => {
    setLoadingOneSubmission(true);
    setSelectedSubmission(null);
    setOneSubmissionError('');
    try {
      const res = await axios.post(
        "http://localhost:5050/history/one",
        { testId, problemId, submissionId },
        { headers: { token } }
      );
      setSelectedSubmission(res.data);
    } catch (err) {
      setOneSubmissionError("Failed to fetch submission details");
    } finally {
      setLoadingOneSubmission(false);
    }
  };

  const renderAutoSaveStatus = () => {
    if (autoSaveStatus === "saving") {
      return <span className="text-xs text-gray-500">Saving...</span>;
    } else if (autoSaveStatus === "saved") {
      return <span className="text-xs text-emerald-500">All changes saved</span>;
    } else if (autoSaveStatus === "error") {
      return <span className="text-xs text-red-500">Failed to save</span>;
    }
    return null;
  };

  const renderErrorBlock = (err) => {
    if (!err) return null;
    return (
      <div className="mt-6 bg-white rounded-xl shadow border p-4 max-w-7xl mx-auto">
        <h3 className="text-md font-semibold text-red-600 mb-2">{err.type}</h3>
        {err.message && (
          <pre className="bg-red-50 p-3 rounded overflow-auto text-sm text-red-700 whitespace-pre-wrap mb-4">
            {err.message}
          </pre>
        )}
        {err.testCase && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1 text-gray-700">Input</h4>
              <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">
                {err.testCase.input}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-1 text-gray-700">Expected Output</h4>
              <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">
                {err.testCase.expectedOutput}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };


  const renderVerdictBlock = (verdicts, blockTitle = "Test Results") => (
    <div className="mt-6 bg-white rounded-xl shadow border p-4 max-w-7xl mx-auto">
      <h3 className="text-md font-semibold mb-3 text-gray-800">{blockTitle}</h3>
      {verdicts.map((v, i) => (
        <div key={i} className="mb-3 p-3 border rounded bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-sm">
                <strong>Input:</strong>
                <pre className="mt-1">{v.input}</pre>
              </div>
              <div className="text-sm mt-2">
                <strong>Expected Output:</strong>
                <pre className="mt-1">{v.expectedOutput}</pre>
              </div>
              <div className="text-sm mt-2">
                <strong>Your Output:</strong>
                <pre className="mt-1">{v.userOutput}</pre>
              </div>
            </div>
            <span className={`ml-4 px-3 py-1 rounded text-sm font-medium ${v.status === "Accepted" || v.verdict === "Accepted"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}>
              {v.status || v.verdict}
            </span>
          </div>
          {v.errorDetails && (
            <div className="mt-2 p-2 bg-red-50 rounded text-red-700 text-sm">
              <pre>{v.errorDetails.compile_output || v.errorDetails.stderr}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const noResultsYet =
    runVerdicts.length === 0 && !runError &&
    submitVerdicts.length === 0 && !submitError && !submitResult.message;


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <div className="flex gap-3 items-center">
            {!showSubmissions && (
              <>
                <button
                  onClick={handleRun}
                  disabled={loadingStates.run || loadingStates.submit}
                  className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingStates.run ? "Running..." : "Run"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loadingStates.run || loadingStates.submit}
                  className="bg-green-600 text-white px-4 py-1.5 text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loadingStates.submit ? "Submitting..." : "Submit"}
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!showSubmissions && (
              <>
                <select
                  value={languageId}
                  onChange={handleLanguageChange}
                  disabled={loadingStates.boilerplate}
                  className="border p-1.5 rounded text-sm bg-white text-gray-700"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleResetToBoilerplate}
                  disabled={loadingStates.boilerplate}
                  title="Reset to boilerplate"
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  ↻
                </button>
                <button
                  onClick={() => {
                    setShowSubmissions(true);
                    getSubmissionList();
                  }}
                  className="ml-2 border bg-gray-100 hover:bg-gray-200 rounded px-3 py-1 text-sm"
                  title="View your past submissions"
                  type="button"
                >
                  Submissions
                </button>
              </>
            )}
          </div>
        </div>

        {showSubmissions ? (
          <div className="relative p-4" style={{ minHeight: "500px" }}>
            {/* Cancel Button */}
            <button
              className="absolute right-6 top-4 text-xl font-bold text-gray-400 hover:text-gray-700"
              onClick={() => setShowSubmissions(false)}
              title="Cancel"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-3">Your Submissions</h2>
            {loadingSubmissions ? (
              <div className="text-center py-8">Loading...</div>
            ) : submissionListError ? (
              <div className="text-center text-red-500 p-4">{submissionListError}</div>
            ) : submissionList.length === 0 ? (
              <div className="text-center text-gray-500 p-4">No submissions yet.</div>
            ) : (
              // SCROLLABLE TABLE Wrapper begins
              <div className="max-h-80 overflow-y-auto border rounded mb-6">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Verdict</th>
                      <th className="p-2 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionList.map((s) => (
                      <tr
                        key={s._id}
                        className="hover:bg-blue-50 cursor-pointer"
                        onClick={() => getSingleSubmission(s._id)}
                      >
                        <td className="p-2 text-blue-700 underline max-w-[110px] truncate">{s._id}</td>
                        <td className={`p-2 max-w-xs truncate font-semibold
                          ${s.verdict === "All test cases passed"
                            ? "text-green-700"
                            : "text-red-600"}
                        `}>
                          {typeof s.verdict === 'string' && s.verdict.length > 35
                            ? s.verdict.slice(0, 32) + "..."
                            : s.verdict}
                        </td>
                        <td className="p-2">{new Date(s.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Selected submission details */}
            {loadingOneSubmission && (
              <div className="text-center py-4 text-gray-600">Loading submission details...</div>
            )}
            {oneSubmissionError && (
              <div className="text-center py-4 text-red-500">{oneSubmissionError}</div>
            )}
            {selectedSubmission && (
              <div className="my-4 px-2 py-3 border rounded bg-gray-50">
                <div className="mb-2 text-sm text-gray-700">
                  <span className="font-semibold">Verdict:</span>{" "}
                  <span className={
                    selectedSubmission.verdict === "Accepted"
                      ? "text-green-700 font-bold"
                      : selectedSubmission.verdict === "Wrong Answer"
                        ? "text-red-700 font-bold"
                        : "text-yellow-700 font-bold"
                  }>
                    {selectedSubmission.verdict}
                  </span>
                  <span className="ml-4 text-gray-500">
                    at {new Date(selectedSubmission.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="mb-2">
                  <strong className="text-gray-700">Code:</strong>
                  <pre className="mt-1 bg-gray-200 rounded p-2 overflow-x-auto text-xs">
                    {selectedSubmission.code}
                  </pre>
                </div>

              </div>
            )}
          </div>
        ) : (
          /* --- All other main editor and verdict UI here --- */
          <>
            <div style={{ height: "calc(100vh - 180px)" }}>
              <MonacoEditor
                height="100%"
                language={getEditorLang(languageId)}
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  wordWrap: "on",
                  fontFamily: "'Fira Code', monospace",
                  scrollBeyondLastLine: false,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  lineNumbersMinChars: 3,
                  padding: { top: 10 },
                }}
              />
            </div>
            <div className="p-2 border-t text-right pr-4 bg-white">
              {renderAutoSaveStatus()}
            </div>
            {noResultsYet && (
              <div className="mt-6 p-4 bg-white rounded-xl shadow border max-w-7xl mx-auto">
                <h3 className="text-md font-semibold mb-2 text-gray-800">Sample Test Cases</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(sampleTests || []).map((sample, index) => (
                    <button
                      key={sample._id}
                      onClick={() => handleSampleClick(sample)}
                      className={`px-3 py-1 rounded text-sm border ${selectedSampleId === sample._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      style={{ minWidth: 64 }}
                    >
                      {`Sample ${index + 1}`}
                    </button>
                  ))}
                </div>
                {selectedSample && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="overflow-auto">
                      <h4 className="font-medium mb-1 text-gray-700">Input</h4>
                      <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">
                        {selectedSample.input}
                      </pre>
                    </div>
                    <div className="overflow-auto">
                      <h4 className="font-medium mb-1 text-gray-700">Expected Output</h4>
                      <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">
                        {selectedSample.output}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
            {runError && (
              <div className="overflow-auto">
                {renderErrorBlock(runError)}
              </div>
            )}
            {runVerdicts.length > 0 && (
              <div className="overflow-auto">
                {renderVerdictBlock(runVerdicts, "Run Results")}
              </div>
            )}
            {submitError && (
              <div className="overflow-auto">
                {renderErrorBlock(submitError)}
              </div>
            )}
            {submitVerdicts.length > 0 && (
              <div className="overflow-auto">
                {renderVerdictBlock(submitVerdicts, "Sample Test Case Results")}
              </div>
            )}
            {submitResult.message && (
              <div className={`p-4 rounded-lg text-center mt-4 transition-all duration-300 
    ${submitResult.isError
                  ? "bg-red-50 border border-red-200 text-red-600"
                  : "bg-green-50 border border-green-200 text-green-600"
                }`}
              >
                <div className="flex items-center justify-center">
                  {submitResult.isError ? (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span className="font-medium">{submitResult.message}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
