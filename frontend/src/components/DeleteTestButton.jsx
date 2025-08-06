import { useNavigate } from "react-router-dom";
import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export default function DeleteTestButton({ testId }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please login again.");
      navigate("/");
      return;
    }

    try {
      const response = await axios.delete(`${API}/deleteTest`, {
        headers: {
          token
        },
        data: { testId },
      });

      alert(response.data.msg);
      navigate("/admin/home", { replace: true });

    } catch (error) {
      console.error("Delete failed:", error);

      const message =
        error.response?.data?.msg ||
        error.response?.data?.error ||
        "An unexpected error occurred while deleting the test.";

      alert(message);
    }
  };

  return (
    <button onClick={handleDelete} style={{ color: "white", backgroundColor: "red", padding: "8px", borderRadius: "4px" }}>
      Delete Test
    </button>
  );
}
