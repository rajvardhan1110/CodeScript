import React, { useEffect, useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const testId = "688e6eb6daef290f9db94f72";
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
  const [verdicts, setVerdicts] = useState([]);
  const [runResult, setRunResult] = useState({ message: "", isError: false });
  const [submitResult, setSubmitResult] = useState({ message: "", isError: false });
  const [executionError, setExecutionError] = useState(null);

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

    return () => {
      clearTimeout(debounceTimer.current);
    };
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
    } catch (error) {
      console.error("❌ Error fetching user code", error);
    } finally {
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
    } catch (error) {
      console.error("Error fetching boilerplate", error);
    } finally {
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
    } catch (error) {
      console.error("❌ Error fetching sample test cases:", error);
    }
  };

  const handleLanguageChange = (e) => {
    const newLangId = Number(e.target.value);
    setLanguageId(newLangId);
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
    } catch (err) {
      console.error("Error saving code", err);
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

  const handleSampleClick = (sample) => {
    setSelectedSampleId(sample._id);
    setSelectedSample(sample);
  };

  const handleRun = async () => {
    setRunResult({ message: "", isError: false });
    setVerdicts([]);
    setExecutionError(null);
    setLoadingStates((prev) => ({ ...prev, run: true }));

    try {
      const res = await axios.post(
        "http://localhost:5050/runUserTestCase",
        { code, language_id: languageId, problemId },
        { headers: { token } }
      );

      if (res.data.msg === "Test case execution failed") {
        // Error case (compilation error, runtime error, etc.)
        const errorDetails = res.data.compile_output || res.data.stderr || res.data.status;
        setExecutionError({
          type: res.data.status?.description || "Execution Error",
          message: errorDetails,
          testCase: res.data.testCase
        });
        setRunResult({
          message: `❌ ${res.data.status?.description || "Execution failed"}`,
          isError: true
        });
      } else {
        // Success case with verdicts
        setVerdicts(res.data.verdicts || []);
        setRunResult({
          message: res.data.msg || "✅ Sample test cases executed",
          isError: false
        });
      }
    } catch (err) {
      const error = err.response?.data;
      const errorMessage = error?.compile_output || error?.stderr || error?.msg || "Run failed";
      setExecutionError({
        type: error?.status || "Error",
        message: errorMessage
      });
      setRunResult({
        message: `❌ ${error?.status || "Error"}: ${errorMessage}`,
        isError: true
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, run: false }));
    }
  };

  const handleSubmit = async () => {
    setSubmitResult({ message: "", isError: false });
    setVerdicts([]);
    setExecutionError(null);
    setLoadingStates((prev) => ({ ...prev, submit: true }));

    try {
      const res = await axios.post(
        "http://localhost:5050/submitCodeUser",
        { code, language_id: languageId, testId, problemId },
        { headers: { token } }
      );

      if (res.data.msg === "All test cases passed") {
        setSubmitResult({
          message: "✅ All test cases passed!",
          isError: false
        });
      } else if (res.data.msg === "Sample test case(s) failed") {
        setVerdicts(res.data.verdicts || []);
        setSubmitResult({
          message: "❌ Sample test case(s) failed",
          isError: true
        });
      } else if (res.data.msg === "Wrong answer on hidden test case") {
        setSubmitResult({
          message: `❌ Wrong answer on hidden test case ${res.data.hiddenFailedCase}`,
          isError: true
        });
      } else if (res.data.error) {
        setExecutionError({
          type: res.data.type || "Error",
          message: res.data.compile_output || res.data.stderr || res.data.type
        });
        setSubmitResult({
          message: `❌ ${res.data.type || "Error"}`,
          isError: true
        });
      } else {
        setSubmitResult({
          message: res.data.msg || "Submission complete",
          isError: false
        });
      }
    } catch (err) {
      const error = err.response?.data;
      const errorMessage = error?.compile_output || error?.stderr || error?.msg || "Submit failed";
      setExecutionError({
        type: error?.status || "Error",
        message: errorMessage
      });
      setSubmitResult({
        message: `❌ ${error?.status || "Error"}: ${errorMessage}`,
        isError: true
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, submit: false }));
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

  const renderExecutionError = () => {
    if (!executionError) return null;

    return (
      <div className="mt-6 bg-white rounded-xl shadow border p-4 max-w-7xl mx-auto">
        <h3 className="text-md font-semibold mb-3 text-red-600">
          {executionError.type}
        </h3>
        <pre className="bg-red-50 p-3 rounded overflow-auto text-sm text-red-700 whitespace-pre-wrap">
          {executionError.message}
        </pre>
        {executionError.testCase && (
          <div className="mt-4">
            <h4 className="font-medium mb-1 text-gray-700">Failed Test Case:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-1 text-gray-700">Input</h5>
                <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">
                  {executionError.testCase.input}
                </pre>
              </div>
              <div>
                <h5 className="font-medium mb-1 text-gray-700">Expected Output</h5>
                <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">
                  {executionError.testCase.expectedOutput}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <div className="flex gap-3 items-center">
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
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

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
      </div>

      {/* Sample Test Cases Section */}
      <div className="mt-6 p-4 bg-white rounded-xl shadow border max-w-7xl mx-auto">
        <h3 className="text-md font-semibold mb-2 text-gray-800">Sample Test Cases</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {sampleTests.map((sample, index) => (
            <button
              key={sample._id}
              onClick={() => handleSampleClick(sample)}
              className={`px-3 py-1 rounded text-sm border ${
                selectedSampleId === sample._id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {`Sample ${index + 1}`}
            </button>
          ))}
        </div>

        {selectedSample && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1 text-gray-700">Input</h4>
              <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">
                {selectedSample.input}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-1 text-gray-700">Expected Output</h4>
              <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-auto whitespace-pre-wrap">
                {selectedSample.output}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Execution Error Display */}
      {executionError && renderExecutionError()}

      {/* Test Results */}
      {verdicts.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow border p-4 max-w-7xl mx-auto">
          <h3 className="text-md font-semibold mb-3 text-gray-800">Test Results</h3>
          {verdicts.map((v, i) => (
            <div key={i} className="mb-3 p-3 border rounded bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm"><strong>Input:</strong> <pre className="mt-1">{v.input}</pre></p>
                  <p className="text-sm mt-2"><strong>Expected Output:</strong> <pre className="mt-1">{v.expectedOutput}</pre></p>
                  <p className="text-sm mt-2"><strong>Your Output:</strong> <pre className="mt-1">{v.userOutput}</pre></p>
                </div>
                <span className={`ml-4 px-3 py-1 rounded text-sm font-medium ${
                  v.verdict === "Accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {v.verdict}
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
      )}

      {/* Status Messages */}
      {(runResult.message || submitResult.message) && (
        <div className={`text-sm text-center mt-4 ${
          runResult.isError || submitResult.isError ? "text-red-600" : "text-green-600"
        }`}>
          {runResult.message || submitResult.message}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;