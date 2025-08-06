import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import MonacoEditor from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router-dom";

const languageOptions = [
  { id: 50, label: "C" },
  { id: 54, label: "C++" },
  { id: 62, label: "Java" },
  { id: 63, label: "JavaScript" },
  { id: 71, label: "Python" },
  { id: 74, label: "TypeScript" },
  { id: 60, label: "Go" },
];

const SetQuestion = () => {
  const { testId, problemId } = useParams();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const panelRef = useRef(null);

  const [languageId, setLanguageId] = useState(54);
  const [adminCodeLanguageId, setAdminCodeLanguageId] = useState(null);
  const [code, setCode] = useState("");
  const [sampleTestCaseIds, setSampleTestCaseIds] = useState([]);
  const [hiddenTestCaseIds, setHiddenTestCaseIds] = useState([]);
  const [addMode, setAddMode] = useState(null);
  const [testInput, setTestInput] = useState("");
  const [addResult, setAddResult] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    adminCode: false,
    boilerplate: false,
    testCase: false,
    saveCode: false,
    deleteCase: false
  });
  const [notification, setNotification] = useState(null);
  const userChangedLanguage = useRef(false);

  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    fetchAdminCode();
  }, []);

  useEffect(() => {
    if (!userChangedLanguage.current) return;
    if (languageId === adminCodeLanguageId) {
      fetchAdminCode();
    } else {
      fetchBoilerplate(languageId);
    }
  }, [languageId]);

  const showNotification = (message, type = "info", duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  const fetchBoilerplate = async (langId) => {
    setLoadingStates(prev => ({...prev, boilerplate: true}));
    try {
      const res = await axios.post(
        "http://localhost:5050/get-boilerplates",
        { languageId: langId },
        { headers: { token } }
      );
      setCode(res.data.boilerplateCode || "");
    } catch (error) {
      console.error("Failed to fetch boilerplate:", error);
      showNotification("Failed to fetch boilerplate code", "error");
    } finally {
      setLoadingStates(prev => ({...prev, boilerplate: false}));
    }
  };

  const fetchAdminCode = async () => {
    setLoadingStates(prev => ({...prev, adminCode: true}));
    try {
      const res = await axios.post(
        "http://localhost:5050/getAdminCode",
        { problemId },
        {
          headers: { token },
          validateStatus: () => true,
        }
      );

      if (res.status === 404) {
        const fallbackLang = 54;
        setAdminCodeLanguageId(null);
        setLanguageId(fallbackLang);
        await fetchBoilerplate(fallbackLang);
        setSampleTestCaseIds([]);
        setHiddenTestCaseIds([]);
        return;
      }

      if (res.status !== 200) {
        showNotification(res.data.msg || "Failed to fetch admin code.", "error");
        return;
      }

      const {
        content,
        language_id,
        sampleTestCaseIds,
        hiddenTestCaseIds,
      } = res.data;

      userChangedLanguage.current = false;
      setAdminCodeLanguageId(language_id);
      setLanguageId(language_id);
      setCode(content);
      setSampleTestCaseIds(sampleTestCaseIds);
      setHiddenTestCaseIds(hiddenTestCaseIds);
    } catch (error) {
      console.error("Exception in fetchAdminCode:", error);
      showNotification("Something went wrong while fetching admin code.", "error");
    } finally {
      setLoadingStates(prev => ({...prev, adminCode: false}));
    }
  };

  const handleLanguageChange = (e) => {
    const newLangId = Number(e.target.value);
    userChangedLanguage.current = true;
    setLanguageId(newLangId);
  };

  const handleResetToBoilerplate = async () => {
    userChangedLanguage.current = false;
    await fetchBoilerplate(languageId);
  };

  const handleAddCase = (type) => {
    setAddMode(type);
    setTestInput("");
    setAddResult(null);
  };

  const handleViewTestCase = async (testCaseId, type) => {
    setLoadingStates(prev => ({...prev, testCase: true}));
    try {
      const res = await axios.post(
        "http://localhost:5050/getAdminTestcase",
        { problemId, testCaseId },
        { headers: { token } }
      );

      setAddMode("view");
      setAddResult({
        input: res.data.input,
        output: res.data.output,
        type: type,
        _id: testCaseId,
      });
    } catch (error) {
      console.error("Failed to load test case details:", error);
      showNotification("Could not load test case details.", "error");
    } finally {
      setLoadingStates(prev => ({...prev, testCase: false}));
    }
  };

  const handleSubmitTestCase = async () => {
    if (!testInput.trim()) {
      showNotification("Input cannot be empty.", "warning");
      return;
    }

    setLoadingStates(prev => ({...prev, testCase: true}));
    try {
      const res = await axios.post(
        `http://localhost:5050/upload${addMode === "sample" ? "Sample" : "Hidden"}Test`,
        { problemId, testCase: { input: testInput } },
        { headers: { token } }
      );

      setAddResult({
        success: true,
        msg: res.data.msg || "Test case added!",
        output: res.data.output,
      });

      showNotification("Test case added successfully!", "success");
      fetchAdminCode();
    } catch (err) {
      const { data } = err.response || {};
      setAddResult({
        error: true,
        msg: data?.msg || "Failed to add test case.",
        stderr: data?.stderr,
        compile_output: data?.compile_output,
      });
      showNotification(data?.msg || "Failed to add test case.", "error");
    } finally {
      setLoadingStates(prev => ({...prev, testCase: false}));
    }
  };

  const handleDeleteTestCase = async () => {
    if (!window.confirm("Are you sure you want to delete this test case?")) return;

    setLoadingStates(prev => ({...prev, deleteCase: true}));
    try {
      const res = await axios.delete(
        `http://localhost:5050/delete${addResult.type === "sample" ? "Sample" : "Hidden"}Test`,
        {
          headers: { token },
          data: {
            testId,
            problemId,
            testCaseId: addResult._id,
          },
        }
      );

      showNotification(res.data.msg || "Deleted successfully!", "success");
      setAddMode(null);
      setAddResult(null);
      fetchAdminCode();
    } catch (err) {
      console.error("Delete failed", err);
      showNotification("Failed to delete test case.", "error");
    } finally {
      setLoadingStates(prev => ({...prev, deleteCase: false}));
    }
  };

  const handleSaveCode = async () => {
    setLoadingStates(prev => ({...prev, saveCode: true}));
    try {
      const res = await axios.post(
        "http://localhost:5050/uploadAdminCode",
        {
          code,
          language_id: languageId,
          testId,
          problemId,
        },
        {
          headers: { token },
        }
      );

      showNotification(res.data.msg || "Code saved successfully!", "success");
    } catch (err) {
      console.error("Save failed", err);
      showNotification("Failed to save code", "error");
    } finally {
      setLoadingStates(prev => ({...prev, saveCode: false}));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg text-white ${
          notification.type === "error" ? "bg-rose-500" :
          notification.type === "success" ? "bg-emerald-500" :
          "bg-sky-500"
        } transition-all duration-300 animate-fade-in`}>
          {notification.message}
        </div>
      )}

      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-4 right-4 z-30 bg-sky-600 text-white p-3 rounded-full shadow-lg"
      >
        {isCollapsed ? 'Show Tests' : 'Hide Tests'}
      </button>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="flex flex-col lg:flex-row">
          {/* Left Panel - Test Cases (Collapsible) */}
          <div 
            ref={panelRef}
            className={`lg:w-2/5 xl:w-1/3 bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-y-auto ${
              isCollapsed ? 'hidden lg:block lg:absolute lg:left-0 lg:z-20 lg:shadow-lg' : 'block'
            }`}
            style={{ 
              maxHeight: 'calc(100vh - 2rem)',
              transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)'
            }}
          >
            <div className="p-4 sticky top-0 bg-gray-50 z-10 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Test Cases</h2>
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block text-gray-500 hover:text-gray-700"
              >
                {isCollapsed ? '→' : '←'}
              </button>
            </div>

            <div className="p-4">
              {addMode === "view" && addResult ? (
                <div className="bg-white rounded-lg p-4 shadow-xs border border-gray-200 mb-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                    <span className="mr-2">📄</span>
                    Viewing {addResult.type === "sample" ? "Sample" : "Hidden"} Test Case
                  </h3>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Input:</label>
                    <pre className="bg-gray-50 p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-200">
                      {addResult.input}
                    </pre>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Expected Output:</label>
                    <pre className="bg-gray-50 p-2 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-200">
                      {addResult.output}
                    </pre>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setAddMode(null);
                        setAddResult(null);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition flex items-center justify-center text-sm"
                    >
                      <span className="mr-1">←</span> Back
                    </button>
                    <button
                      onClick={handleDeleteTestCase}
                      disabled={loadingStates.deleteCase}
                      className="flex-1 bg-rose-500 text-white px-3 py-1.5 rounded hover:bg-rose-600 transition flex items-center justify-center text-sm"
                    >
                      {loadingStates.deleteCase ? (
                        <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                      ) : (
                        <span className="mr-1">🗑</span>
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ) : addMode && addMode !== "view" ? (
                <div className="bg-white rounded-lg p-4 shadow-xs border border-gray-200 mb-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    Add {addMode === "sample" ? "Sample" : "Hidden"} Test Case
                  </h3>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 text-xs mb-3 focus:outline-none focus:ring-1 focus:ring-sky-300 focus:border-transparent bg-gray-50"
                    placeholder="Enter input (plain text)"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    rows={15}
                  />
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={handleSubmitTestCase}
                      disabled={loadingStates.testCase}
                      className="flex-1 bg-sky-600 text-white px-3 py-1.5 rounded hover:bg-sky-700 transition flex items-center justify-center text-sm"
                    >
                      {loadingStates.testCase ? (
                        <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                      ) : (
                        <span className="mr-1">+</span>
                      )}
                      Add Test Case
                    </button>
                    <button
                      onClick={() => setAddMode(null)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  {addResult && (
                    <div className="mt-3 space-y-2">
                      {addResult.error ? (
                        <div className="text-rose-600 bg-rose-50 p-2 rounded border border-rose-100 text-xs">
                          <div className="font-medium">❌ {addResult.msg}</div>
                          {addResult.compile_output && (
                            <div className="mt-1 bg-white p-1 rounded text-xs text-rose-700 font-mono max-h-40 overflow-y-auto whitespace-pre-wrap border border-rose-100">
                              <strong>Compilation Output:</strong>
                              <pre>{addResult.compile_output}</pre>
                            </div>
                          )}
                          {addResult.stderr && (
                            <div className="mt-1 bg-white p-1 rounded text-xs text-amber-700 font-mono max-h-40 overflow-y-auto whitespace-pre-wrap border border-rose-100">
                              <strong>Standard Error:</strong>
                              <pre>{addResult.stderr}</pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100 text-xs">
                          <div className="font-medium">✅ Output:</div>
                          <div className="mt-1 bg-white p-1 rounded text-xs text-emerald-800 font-mono max-h-40 overflow-y-auto whitespace-pre-wrap border border-emerald-100">
                            <pre>{addResult.output}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    <button
                      onClick={() => handleAddCase("sample")}
                      className="w-full py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition flex items-center justify-center text-sm"
                    >
                      <span className="mr-1">+</span> Add Sample Test Case
                    </button>
                    <button
                      onClick={() => handleAddCase("hidden")}
                      className="w-full py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition flex items-center justify-center text-sm"
                    >
                      <span className="mr-1">+</span> Add Hidden Test Case
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center text-sm">
                        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mr-1.5"></span>
                        Sample Test Cases
                      </h3>
                      {loadingStates.adminCode ? (
                        <div className="flex justify-center py-2">
                          <span className="inline-block h-4 w-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                        </div>
                      ) : sampleTestCaseIds.length > 0 ? (
                        <div className="grid gap-1.5">
                          {sampleTestCaseIds.map((id, index) => (
                            <div
                              key={id}
                              className="bg-white p-2 rounded border border-gray-200 hover:border-sky-300 cursor-pointer transition flex items-center text-xs"
                              onClick={() => handleViewTestCase(id, "sample")}
                            >
                              <span className="text-sky-500 mr-1.5">#</span>
                              Sample Test Case {index + 1}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic py-1">No sample test cases yet</div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center text-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5"></span>
                        Hidden Test Cases
                      </h3>
                      {loadingStates.adminCode ? (
                        <div className="flex justify-center py-2">
                          <span className="inline-block h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                        </div>
                      ) : hiddenTestCaseIds.length > 0 ? (
                        <div className="grid gap-1.5">
                          {hiddenTestCaseIds.map((id, index) => (
                            <div
                              key={id}
                              className="bg-white p-2 rounded border border-gray-200 hover:border-emerald-300 cursor-pointer transition flex items-center text-xs"
                              onClick={() => handleViewTestCase(id, "hidden")}
                            >
                              <span className="text-emerald-500 mr-1.5">#</span>
                              Hidden Test Case {index + 1}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic py-1">No hidden test cases yet</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className={`flex-1 transition-all duration-300 ${
            isCollapsed ? 'lg:ml-0' : ''
          }`}>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Admin Code Editor</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={languageId}
                    onChange={handleLanguageChange}
                    disabled={loadingStates.boilerplate}
                    className="border border-gray-300 p-1.5 rounded text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-300"
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
                    className="bg-gray-100 text-gray-700 p-1.5 rounded hover:bg-gray-200 transition text-xs"
                    title="Reset editor to boilerplate"
                  >
                    {loadingStates.boilerplate ? (
                      <span className="inline-block h-3 w-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "↻"
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-grow" style={{ height: 'calc(100vh - 180px)' }}>
                <MonacoEditor
                  height="100%"
                  language={
                    languageId === 54
                      ? "cpp"
                      : languageId === 62
                      ? "java"
                      : languageId === 71
                      ? "python"
                      : languageId === 63
                      ? "javascript"
                      : languageId === 50
                      ? "c"
                      : languageId === 74
                      ? "typescript"
                      : languageId === 60
                      ? "go"
                      : "plaintext"
                  }
                  value={code}
                  theme="vs-dark"
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    fontFamily: "'Fira Code', monospace",
                    wordWrap: "on",
                    smoothScrolling: true,
                    lineNumbersMinChars: 3,
                    padding: { top: 10 },
                  }}
                />
              </div>

              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={handleSaveCode}
                  disabled={loadingStates.saveCode}
                  className="ml-auto bg-sky-600 text-white py-1.5 px-4 rounded hover:bg-sky-700 transition flex items-center justify-center text-sm"
                >
                  {loadingStates.saveCode ? (
                    <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                  ) : (
                    <span className="mr-1">💾</span>
                  )}
                  Save Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetQuestion;