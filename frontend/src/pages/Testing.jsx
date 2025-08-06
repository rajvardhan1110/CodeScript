import React from "react";
import UserCodingQuestions from '../components/UserCodingQuestions'

// Dummy Timer Component
const Timer = () => {
  return (
    <div className="text-gray-700 font-medium">
      00:30:00 {/* Static dummy time */}
    </div>
  );
};

// Full-width component placeholder

export default function Testing() {
  const testData = {
    title: "Demo Test Title",
    testTime: new Date().toISOString(),
    totalTime: 1800,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header section with previous width */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {testData?.title || "Test"}
          </h2>
          <Timer />
        </div>
      </div>

      {/* Full-width component */}
      <UserCodingQuestions />
    </div>
  );
}
