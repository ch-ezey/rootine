import React, { createContext, useState, useEffect } from "react";
import { fetchMe } from "./api/auth"; // central API function

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const restoreSession = async () => {
			const token = localStorage.getItem("token");
			console.log("Restoring session with token:", token);

			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const data = await fetchMe(); // axios call with token automatically attached
				setUser(data);
			} catch (err) {
				console.error("Session restore failed:", err.message);
				localStorage.removeItem("token"); // clear bad token
			} finally {
				setLoading(false);
			}
		};

		restoreSession();
	}, []);

	const login = (userData, token) => {
		localStorage.setItem("token", token);
		setUser(userData);
	};

	const logout = () => {
		localStorage.removeItem("token");
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	);
};
