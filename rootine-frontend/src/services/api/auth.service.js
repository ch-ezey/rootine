import API from "./httpClient.js";

// Both return { token, user: { id, name, email, createdAt, lastLogin } }
export const loginUser = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (name, email, password) => {
  const res = await API.post("/auth/register", { name, email, password });
  return res.data;
};

// Current user (session restore)
export const fetchMe = async () => {
  const res = await API.get("/auth/me");
  return res.data;
};
