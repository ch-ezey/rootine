import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Routine from "./pages/Routine";
import "./App.css";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";

export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<LandingPage />} />
					<Route path='/login' element={<Login />} />
					<Route path='/register' element={<Register />} />
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/routine/:id'
						element={
							<ProtectedRoute>
								<Routine />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}
