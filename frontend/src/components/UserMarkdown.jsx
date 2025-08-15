import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useParams } from "react-router-dom";

import config from "../../apiconfig";
const API2 = config.JudgeBackend_url;

const UserMarkdown = ({ problemId }) => {
    const [markdownContent, setMarkdownContent] = useState("");
    const token = localStorage.getItem("usertoken");
    const { testId } = useParams(); 
   
    useEffect(() => {
        const fetchMarkdown = async () => {
            try {
                const res = await axios.post(
                    `${API2}/userMarkdown`,
                    {
                        testId: testId,
                        problemId: problemId
                    },
                    {
                        headers: {
                            token
                        }
                    }
                );

                if (res.status === 200 && res.data.markdownContent) {
                    setMarkdownContent(res.data.markdownContent);
                } else {
                    setMarkdownContent(`# Problem Title\n\n## Problem Statement\n\nStart writing your problem here...`);
                }
            } catch (error) {
                setMarkdownContent(`# Problem Title\n\n## Problem Statement\n\nStart writing your problem here...`);
            }
        };

        fetchMarkdown();
    }, []);

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
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2" {...props} />
        ),
        a: ({ node, ...props }) => (
            <a className="text-sky-600 hover:text-sky-700 hover:underline" {...props} />
        ),
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                
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
        </div>
    );
};

export default UserMarkdown;
