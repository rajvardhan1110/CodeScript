import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import axios from "axios";

const MarkdownUpdate = ({ testId, problemId }) => {
  const [markdownContent, setMarkdownContent] = useState("");
  const [title, setTitle] = useState("");
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

  const fetchMarkdownFromAdmin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5050/adminMarkdown",
        { testId, problemId },
        { headers: { token } }
      );

      if (res.status === 200) {
        setMarkdownContent(res.data.markdownContent || "");
        setTitle(res.data.title || "");
      } else {
        showNotification("Unexpected response from server", "warning");
        setMarkdownContent(`# Problem Title\n\n## Problem Statement\n\nStart writing your problem here...`);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (status === 401) {
        showNotification(msg || "Authentication required", "error");
      } else if (status === 403) {
        showNotification(msg || "Not authorized", "error");
      } else {
        showNotification(msg || "Failed to load problem markdown", "error");
      }
      setMarkdownContent(`# Problem Title\n\n## Problem Statement\n\nStart writing your problem here...`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5050/updateAdminMarkdown",
        { testId, problemId, markdownContent },
        { headers: { token } }
      );

      if (res.data?.message === "Markdown updated successfully") {
        showNotification("Markdown updated successfully", "success");
      } else {
        showNotification("Unexpected server response", "warning");
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      showNotification(msg || "Error updating markdown", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkdownFromAdmin();
  }, [testId, problemId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg text-white ${notification.type === "error" ? "bg-rose-500" :
            notification.type === "success" ? "bg-emerald-500" :
              "bg-sky-500"
          } transition-all duration-300 animate-fade-in`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-[1800px] mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Problem Description Editor</h1>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Markdown Editor */}
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Title</label>
                <input
                  type="text"
                  value={title}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-300"
                />
              </div>

              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Markdown Content</label>
                <textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  className="w-full h-[calc(100vh-250px)] p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-sky-300 focus:border-transparent"
                  placeholder="# Problem Title\n\n## Problem Statement\n\nStart writing your problem here..."
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition flex items-center justify-center"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                ) : (
                  <span className="mr-2">💾</span>
                )}
                Update Markdown
              </button>
            </div>

            {/* Live Preview with Tight Spacing */}
            <div className="border border-gray-200 p-6 rounded-md bg-white overflow-auto h-[calc(100vh-180px)] w-full">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Live Preview</h2>
              <div className="prose max-w-none w-full" style={{ lineHeight: 1.4 }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-800" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-3 mb-1.5 text-gray-800" {...props} />,
                    p: ({ node, ...props }) => <p className="whitespace-pre-wrap my-2 text-gray-700" style={{ lineHeight: 1.5 }} {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-1.5 text-gray-700 space-y-0.5" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-1.5 text-gray-700 space-y-0.5" {...props} />,
                    li: ({ node, ...props }) => <li className="my-0.5 text-gray-700" style={{ lineHeight: 1.4 }} {...props} />,
                    pre: ({ node, ...props }) => (
                      <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto my-2 text-sm" style={{ lineHeight: 1.3 }} {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" style={{ lineHeight: 1.3 }} {...props} />
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
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownUpdate;