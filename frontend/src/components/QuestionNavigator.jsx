// QuestionNavigator.jsx
export default function QuestionNavigator({
    questions,
    current,
    onJump,
    attemptedQIDs,
    onSubmit
}) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">Questions</h3>
            
            <div className="grid grid-cols-5 gap-2">
                {questions.map((qid, index) => (
                    <button
                        key={qid}
                        onClick={() => onJump(index)}
                        className={`p-3 rounded-lg text-center transition-colors ${
                            current === index
                                ? 'bg-indigo-600 text-white'
                                : attemptedQIDs.includes(qid)
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            <button 
                onClick={onSubmit}
                className="w-full mt-6 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
                Submit Test
            </button>
        </div>
    );
}