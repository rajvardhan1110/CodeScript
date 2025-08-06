import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const CodingQuestions = ({ testId }) => {
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, []);

  const showNotification = (message, type = "info", duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  const fetchCodingQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5050/admin/test-problems",
        { testId },
        { headers: { token } }
      );

      if (res.status === 200) {
        setCodingQuestions(res.data.problems || []);
      } else {
        showNotification(res.data.msg || "Unexpected server response", "warning");
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.msg;
      showNotification(
        msg || "Failed to fetch coding questions",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultMarkdown = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5050/getDefaultMarkdown",
        { headers: { token } }
      );

      if (res.status === 200 && res.data.content) {
        setMarkdownContent(res.data.content);
      } else {
        showNotification("Failed to load default template", "warning");
        setMarkdownContent(`# Problem Title\n\n## Problem Statement\n\nStart writing your problem here...`);
      }
    } catch (err) {
      showNotification("Failed to load default template", "error");
      setMarkdownContent(`# Problem Title\n\n## Problem Statement\n\nStart writing your problem here...`);
    }
  };

  useEffect(() => {
    if (testId) {
      fetchCodingQuestions();
    }
  }, [testId]);

  useEffect(() => {
    if (showEditor) {
      fetchDefaultMarkdown();
    }
  }, [showEditor]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5050/createTestCode",
        {
          testId,
          title,
          markdown: markdownContent,
        },
        { headers: { token } }
      );

      if (res.status === 201) {
        showNotification("Question created successfully", "success");
        setShowEditor(false);
        setTitle("");
        setMarkdownContent("");
        fetchCodingQuestions();
      } else {
        showNotification(res.data.msg || "Unexpected server response", "warning");
      }
    } catch (err) {
      const msg = err.response?.data?.msg;
      showNotification(msg || "Failed to create question", "error");
    } finally {
      setLoading(false);
    }
  };

  const markdownComponents = {
    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4 text-gray-800" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold my-3 text-gray-800" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-lg font-medium my-2 text-gray-800" {...props} />,
    p: ({ node, ...props }) => <p className="whitespace-pre-wrap my-3 text-gray-700" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 text-gray-700" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 text-gray-700" {...props} />,
    li: ({ node, ...props }) => <li className="my-1 text-gray-700" {...props} />,
    pre: ({ node, ...props }) => (
      <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto my-3 text-sm" {...props} />
    ),
    code: ({ node, ...props }) => (
      <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
    ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-2">
        <table className="min-w-full border border-gray-200" style={{ lineHeight: 1.3 }} {...props} />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-left font-semibold text-sm" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="px-3 py-1.5 border border-gray-200 text-sm" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2" style={{ lineHeight: 1.4 }} {...props} />
    ),
    a: ({ node, ...props }) => (
      <a className="text-sky-600 hover:text-sky-700 hover:underline" {...props} />
    ),
  };

  const renderQuestionPreview = (content) => {
    if (!content || typeof content !== 'string') return "";
    const maxLength = 500;
    return content.length > maxLength 
      ? `${content.substring(0, maxLength)}...` 
      : content;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {showEditor ? "Create Coding Question" : "Coding Questions"}
          </h1>

          {!showEditor && (
            <div className="space-y-4">
              {codingQuestions.length > 0 ? (
                <div className="space-y-3">
                  {codingQuestions.map((q) => (
                    <div
                      key={q._id}
                      className="cursor-pointer border border-gray-200 rounded-lg p-2 bg-white hover:bg-gray-50 transition"
                      onClick={() => navigate(`/test/${testId}/updatecodingproblem/${q._id}`)}
                    >
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {q.title || "Untitled Question"}
                      </h3>
                      <div className="text-sm text-gray-700 max-h-48 overflow-y-auto prose prose-sm">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]} 
                          rehypePlugins={[rehypeRaw]}
                          components={markdownComponents}
                        >
                          {renderQuestionPreview(q.markdownContent)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  {loading ? "Loading questions..." : "No coding questions found"}
                </div>
              )}

              <button
                onClick={() => setShowEditor(true)}
                disabled={loading}
                className="bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition flex items-center justify-center mt-4"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                ) : (
                  <span className="mr-2">+</span>
                )}
                Add Coding Question
              </button>
            </div>
          )}

          {showEditor && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Preview */}
              <div className="border border-gray-200 p-4 rounded-md bg-white overflow-auto h-[calc(100vh-250px)]">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Live Preview</h2>
                <div className="prose max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={markdownComponents}
                  >
                    {markdownContent}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Editor */}
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter question title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-300 focus:border-transparent"
                  />
                </div>

                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    className="w-full h-[calc(100vh-350px)] p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-sky-300 focus:border-transparent"
                    placeholder="# Problem Title\n\n## Problem Statement\n\nStart writing your problem here..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition flex items-center justify-center"
                  >
                    {loading ? (
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    ) : (
                      "Save Question"
                    )}
                  </button>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingQuestions;