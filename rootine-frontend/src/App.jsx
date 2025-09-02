import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Routine from "./pages/Routine";
import "./App.css";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/dashboard' element={<Dashboard />} />
				<Route path='/routine/:id' element={<Routine />} />
			</Routes>
		</BrowserRouter>
	);
}
