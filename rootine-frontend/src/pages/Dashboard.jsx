import React, { useState } from "react";

const Dashboard = ({ user }) => {
	const [routines, setRoutines] = useState([]);
	const [newRoutine, setNewRoutine] = useState("");

	const handleAddRoutine = () => {
		if (newRoutine.trim()) {
			setRoutines([...routines, newRoutine]);
			setNewRoutine("");
		}
	};

	const handleDeleteRoutine = (index) => {
		setRoutines(routines.filter((_, i) => i !== index));
	};

	return (
		<div className='container'>
			<div className='dashboard-page'>
				<h1>Welcome, {user}!</h1>

				{/* Manual Routine Management */}
				<div className='dashboard-section'>
					<h2>Your Routines</h2>
					<input
						name='routine-name'
						type='text'
						placeholder='Enter new routine'
						value={newRoutine}
						onChange={(e) => setNewRoutine(e.target.value)}
					/>
					<button onClick={handleAddRoutine}>Add Routine</button>

					<ul>
						{routines.map((routine, index) => (
							<li key={index}>
								{routine}
								<button onClick={() => handleDeleteRoutine(index)}>
									Delete
								</button>
							</li>
						))}
					</ul>
				</div>

				{/* AI Routine Generation */}
				<div className='dashboard-section'>
					<h2>Generate Routine with AI</h2>
					<button>Generate</button>
					<div className='ai-preview'>
						{/* AI output preview goes here */}
						No AI routine generated yet.
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
