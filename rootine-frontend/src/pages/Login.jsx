import React, { useState } from "react";
import { testAPI } from "../api/api";

const Login = ({ login }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

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

		console.log("Login successful, token:", data.token);
		localStorage.setItem("token", data.token);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (email.trim()) {
			onLogin(email, password);
		}
	};

	const handleTestAPI = async () => {
		try {
			const result = await testAPI();
			alert("API connection successful!");
		} catch (error) {
			alert("API connection failed. Check console for details.");
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
					type='text'
					placeholder='Enter password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type='submit'>Login</button>
				<button onClick={handleTestAPI}>Test API Connection</button>
			</form>
		</div>
	);
};

export default Login;
