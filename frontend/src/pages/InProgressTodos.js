import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleError } from "../utils";
import { ToastContainer } from "react-toastify";
import "./Home.css";

function InProgressTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://todo-list-api-henna.vercel.app/api/todos",
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setTodos(result.filter((t) => !t.isDone));
    } catch (err) {
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTodos();
  }, [navigate, fetchTodos]);

  return (
    <div className="background">
      <div className="home-wrapper">
        <nav className="top-navbar">
          <div className="nav-links">
            <Link to="/home" className="nav-item">
              Home
            </Link>
            <Link to="/todos/in-progress" className="nav-item active">
              In Progress
            </Link>
            <Link to="/todos/completed" className="nav-item">
              Completed
            </Link>
            <Link to="/todos/high-priority" className="nav-item high">
              High Priority
            </Link>
          </div>
        </nav>

        <div className="home-card">
          <h2>In Progress Todos</h2>

          {loading ? (
            <p className="info-text">Loading...</p>
          ) : todos.length === 0 ? (
            <p className="info-text empty">No pending tasks 🎉</p>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo._id} className="todo-item">
                  <span className="todo-text">{todo.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}

export default InProgressTodos;
