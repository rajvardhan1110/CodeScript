import axios from "axios";

import config from "../../apiconfig";
const API = config.BASE_URL;

export async function unregister(testId) {
  const token = localStorage.getItem("usertoken");

  if (!token) {
    throw new Error("Authentication token missing. Please log in.");
  }

  const response = await axios.post(`${API}/unregister`, {
    testId
  }, {
    headers: { token }
  });

  return response.data;
}
