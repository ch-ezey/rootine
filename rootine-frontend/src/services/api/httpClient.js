import axios from "axios";

export const TOKEN_KEY = "token";

const API = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
});

// Attach JWT token
API.interceptors.request.use((req) => {
	const token = localStorage.getItem(TOKEN_KEY);
	if (token) req.headers.Authorization = `Bearer ${token}`;
	return req;
});

// An expired or invalid token ends the session everywhere (AuthProvider listens for this)
API.interceptors.response.use(
	(res) => res,
	(error) => {
		const hadToken = Boolean(error.config?.headers?.Authorization);
		if (error.response?.status === 401 && hadToken) {
			localStorage.removeItem(TOKEN_KEY);
			window.dispatchEvent(new Event("auth:expired"));
		}
		return Promise.reject(error);
	},
);

/** Human-readable message from an API error ({ message } body) or network failure. */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
	if (!error) return fallback;
	if (error.code === "ERR_NETWORK") return "Can't reach the server. Is the API running?";
	const message = error.response?.data?.message;
	return typeof message === "string" && message.trim() ? message : fallback;
}

export default API;
