import { useEffect, useState } from "react";
import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function UpdateTestPage({ testId, title, description, testTime, totalTime }) {
  const [Title, setTitle] = useState("");
  const [Description, setDescription] = useState("");
  const [TestTime, setTestTime] = useState("");
  const [TotalTime, setTotalTime] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(title || "");
    setDescription(description || "");

    let formattedTime = "";
    if (testTime) {
      const d = new Date(testTime);
      if (!isNaN(d.getTime())) {
        formattedTime = d.toISOString().slice(0, 16);
      }
    }
    setTestTime(formattedTime);

    setTotalTime(totalTime || "");
  }, [title, description, testTime, totalTime]);

  const isValidDateTime = (dtString) => {
    const date = new Date(dtString);
    return !isNaN(date.getTime());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = {
      testId,
      title: Title,
      description: Description,
    };

    if (TestTime && isValidDateTime(TestTime)) {
      payload.testTime = new Date(TestTime);
    }

    if (TotalTime) {
      const totalTimeInt = parseInt(TotalTime);
      if (!isNaN(totalTimeInt) && totalTimeInt > 0) {
        payload.totalTime = totalTimeInt;
      } else {
        setError("Total time must be a positive number.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(`${API}/editTest`, payload, {
        headers: { token },
      });

      alert("Test updated successfully");
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Error updating test");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Test Details</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={Title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={Description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Test Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Time (Date & Time)
          </label>
          <input
            type="datetime-local"
            value={TestTime}
            onChange={(e) => setTestTime(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Total Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={TotalTime}
            onChange={(e) => setTotalTime(e.target.value)}
            min="1"
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm flex items-center gap-2 ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Test"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}