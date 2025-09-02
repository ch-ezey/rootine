import axios from "axios";

const API = axios.create({
	baseURL: "http://localhost:8080", // your Spring Boot API base URL
});

// Attach JWT token automatically
API.interceptors.request.use((req) => {
	const token = localStorage.getItem("token");
	if (token) req.headers.Authorization = `Bearer ${token}`;
	return req;
});

// Add test function
export const testAPI = async () => {
	try {
		const response = await API.get("/user/users");
		console.log("API Test Success:", response.data);
		return response.data;
	} catch (error) {
		console.error("API Test Error:", error);
		throw error;
	}
};

export default API;
