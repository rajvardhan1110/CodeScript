export default function QuestionPanel({ questions, onSelect, selectedIndex, testId }) {
    return (
       <div className="w-full lg:w-[80%] p-4 border-r border-gray-200 h-[80vh] overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Questions</h4>
            
            </div>

            <div className="space-y-2">
                {questions.map((qId, index) => (
                    <div
                        key={qId}
                        onClick={() => onSelect(qId, index)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between
                            ${selectedIndex === index 
                                ? 'bg-indigo-100 border border-indigo-300 text-indigo-800' 
                                : 'bg-white border border-gray-200 hover:bg-gray-100'}`}
                    >
                        <span className="font-medium">Q{index + 1}</span>
                        {selectedIndex === index && (
                            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        )}
                    </div>
                ))}

                {/* Add Question Button */}
                <div
                    onClick={() => onSelect("add", null)}
                    className="p-3 mt-4 bg-green-50 border-2 border-dashed border-green-300 rounded-lg cursor-pointer 
                              hover:bg-green-100 transition-colors text-center text-green-700 font-medium flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                     Add Question
                </div>
            </div>
        </div>
    );
}