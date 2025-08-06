import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export async function toggleTestPhase(testId) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token missing. Please log in.");
  }

  const response = await axios.patch(`${API}/finalTest`, {
    testId
  }, {
    headers: { token }
  });

  return response.data;
}
