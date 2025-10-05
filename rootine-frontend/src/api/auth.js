// src/services/auth.js
import API from "./api";

// Login
export const loginUser = async (email, password) => {
	const res = await API.post("/auth/login", { email, password });
	return res.data; // expected { token, user }
};

// Register
export const registerUser = async (name, email, password) => {
	const res = await API.post("/auth/register", { name, email, password });
	return res.data; // expected { message, user? }
};

// Fetch current user (session restore)
export const fetchMe = async () => {
	const res = await API.get("/auth/me");
	return res.data; // expected { id, email, name, lastLogin }
};
