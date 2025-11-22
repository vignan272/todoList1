import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copyLoginInfo = { ...loginInfo };
    copyLoginInfo[name] = value;
    setLoginInfo(copyLoginInfo);
  };

  console.log("Login info->", loginInfo);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("email and password requried");
    }
    try {
      const url = "https://todo-list-api-henna.vercel.app/auth/login";
      const res = await fetch(url, {
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
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("loggedInUser", name);
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else if (error) {
        const details = error?.details[0].message;
        handleError(details);
      } else if (!success) {
        handleError(message);
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-wrapper">
        <div className="container">
          <h1>Goto FUM HOUSE To-dos</h1>
          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="email">Email</label>
              <input
                onChange={handleChange}
                type="text"
                name="email"
                autoFocus
                placeholder="Enter your email..."
                value={loginInfo.email}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                onChange={handleChange}
                type="password"
                name="password"
                autoFocus
                placeholder="Enter your password..."
                value={loginInfo.password}
              />
            </div>
            <button type="submit">Login</button>
            <span>
              You don't have account ? <Link to="/signup">signup</Link>
            </span>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default Login;
