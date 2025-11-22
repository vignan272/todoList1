import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copySignupInfo = { ...signupInfo };
    copySignupInfo[name] = value;
    setSignupInfo(copySignupInfo);
  };

  console.log("Signup info->", signupInfo);

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return handleError("name, email and password requried");
    }
    try {
      const url = "http://localhost:8080/auth/signup";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupInfo),
      });
      const result = await res.json();
      const { success, message, error } = result;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          navigate("/login");
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
          <h1>Signup</h1>
          <form onSubmit={handleSignup}>
            <div>
              <label htmlFor="name">Name</label>
              <input
                onChange={handleChange}
                type="text"
                name="name"
                autoFocus
                placeholder="Enter your name..."
                value={signupInfo.name}
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                onChange={handleChange}
                type="text"
                name="email"
                autoFocus
                placeholder="Enter your email..."
                value={signupInfo.email}
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
                value={signupInfo.password}
              />
            </div>
            <button type="submit">Signup</button>
            <span>
              All ready have an account ? <Link to="/login">Login</Link>
            </span>
          </form>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default Signup;
