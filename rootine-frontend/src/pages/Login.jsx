import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { loginUser, fetchMe } from "../api/auth";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { login } = useContext(AuthContext);
	const navigate = useNavigate();

	const onLogin = async (email, password) => {
		try {
			const { token } = await loginUser(email, password);

			// Save token
			localStorage.setItem("token", token);

			// Fetch user info
			const userData = await fetchMe();

			console.log("Login successful:", userData);

			// Save session globally
			login(userData, token);

			// Redirect to dashboard
			navigate("/dashboard");
		} catch (err) {
			alert("Login failed: " + err.message);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (email.trim() && password.trim()) {
			onLogin(email, password);
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
			<p>
				Don’t have an account? <Link to='/register'>Register here</Link>
			</p>
		</div>
	);
};

export default Login;
