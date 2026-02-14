import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { getRoutineByUserId } from "../api/routine";

const Dashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const [routines, setRoutines] = useState([]);
  const [newRoutine, setNewRoutine] = useState("");
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  // Fetch routines for the current user
  useEffect(() => {
    const fetchRoutines = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const routinesData = await getRoutineByUserId(user.id);
        setRoutines(routinesData);
        console.log("Fetched routines:", routinesData);
      } catch (err) {
        console.error("Error fetching routines:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchRoutines();
  }, [user]);

  const handleAddRoutine = () => {
    if (newRoutine.trim()) {
      setRoutines([...routines, newRoutine]);
      setNewRoutine("");
    }
  };

  const handleDeleteRoutine = (index) => {
    setRoutines(routines.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    logout();
    navigate("/login"); // redirect back to login
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to access your dashboard.</div>;

  return (
    <div className="container">
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Welcome, {user.name || user.email}!</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* Manual Routine Management */}
        <div className="dashboard-section">
          <div className="routine-container">
            <div className="input-container">
              <h2>Your Routines</h2>
              <input
                name="routine-name"
                type="text"
                placeholder="Enter new routine"
                value={newRoutine}
                onChange={(e) => setNewRoutine(e.target.value)}
              />
              <button onClick={handleAddRoutine}>Add Routine</button>
            </div>
            <div className="routines">
              <ul>
                {routines.map((routine, index) => (
                  <li key={routine.routineId || index}>
                    <div>
                      <strong>{routine.title}</strong>
                      <p>Theme: {routine.theme}</p>
                      <p>Detail Level: {routine.detailLevel}</p>
                      <p>Status: {routine.isActive ? "Active" : "Inactive"}</p>
                    </div>
                    <button onClick={() => handleDeleteRoutine(index)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Routine Generation */}
        <div className="dashboard-section">
          <h2>Generate Routine with AI</h2>
          <button>Generate</button>
          <div className="ai-preview">
            {/* AI output preview goes here */}
            No AI routine generated yet.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
