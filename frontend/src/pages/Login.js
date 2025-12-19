import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  /* ===== SHOW SESSION MESSAGE ONCE ===== */
  useEffect(() => {
    if (location.state?.reason) {
      handleError(location.state.reason);

      // clear state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("Email and password required");
    }

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });

      const result = await res.json();
      const { success, message, jwtToken, error, name } = result;

      if (success) {
        handleSuccess(message);

        // ===== LOCAL STORAGE =====
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("loggedInUser", name);

        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else if (error) {
        handleError(error?.details?.[0]?.message || "Login failed");
      } else {
        handleError(message);
      }
    } catch (err) {
      handleError("Server error. Try again.");
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-wrapper">
        <div className="container">
          <h1>Todo List</h1>

          <form onSubmit={handleLogin}>
            <div>
              <label>Email</label>
              <input
                name="email"
                type="text"
                autoFocus
                placeholder="Enter your email..."
                value={loginInfo.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password..."
                value={loginInfo.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit">Login</button>

            <span>
              You don't have an account? <Link to="/signup">Signup</Link>
            </span>
          </form>

          <ToastContainer position="top-center" autoClose={3000} />
        </div>
      </div>
    </div>
  );
}

export default Login;
