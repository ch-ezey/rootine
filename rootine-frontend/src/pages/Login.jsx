import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login } = useContext(AuthContext);
	const navigate = useNavigate();

	const onLogin = async (email, password) => {
		const res = await fetch("http://localhost:8080/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		if (!res.ok) {
			throw new Error("Login failed");
		}

		const data = await res.json();

		// Fetch user info
		const userRes = await fetch("http://localhost:8080/auth/me", {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${data.token}`,
			},
		});

		if (!userRes.ok) {
			throw new Error("Failed to fetch user info");
		}

		const userData = await userRes.json();

		console.log("Login successful:", userData);

		// Save session globally
		login(userData, data.token);

		// Redirect to dashboard
		navigate("/dashboard");
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (email.trim() && password.trim()) {
			onLogin(email, password).catch((err) => alert(err.message));
		}
	};

	return (
		<div className='login-page'>
			<h1>Login</h1>
			<form onSubmit={handleSubmit}>
				<input
					type='text'
					placeholder='Enter email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>

				<input
					type='password'
					placeholder='Enter password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type='submit'>Login</button>
			</form>
		</div>
	);
};

export default Login;
