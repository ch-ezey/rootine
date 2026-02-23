import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../app/contexts/auth.context.js";

const LandingPage = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="container">
      <div className="page">
        <h1>Welcome to Rootine</h1>
        <p>
          Organize your day, build routines, and stay productive with ease. Sign
          up today and start creating your smart routines.
        </p>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link to="/login">
            <button style={{ maxWidth: "200px" }}>Login</button>
          </Link>
          <Link to="/register">
            <button style={{ maxWidth: "200px", marginLeft: "1rem" }}>
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
