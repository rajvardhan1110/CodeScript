import { useState } from "react";

export default function Option({ option, onSelect, selected }) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        if (loading) return;
        setLoading(true);
        await onSelect();
        setLoading(false);
    }

    return (
        <div className="mb-3 last:mb-0"> {/* Added margin-bottom and removed for last child */}
            <button
                onClick={handleClick}
                disabled={loading}
                className={`
                    w-full p-4 text-left rounded-lg border transition-all duration-200
                    ${selected 
                        ? 'bg-green-50 border-green-200 text-green-800 shadow-sm' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'}
                    ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                `}
            >
                <div className="flex items-center">
                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 border-2 ${selected ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'}`}>
                            {selected && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </span>
                    )}
                    <span className="text-gray-800 text-base">{option.text}</span>
                </div>
            </button>
        </div>
    );
}