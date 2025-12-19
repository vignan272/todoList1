import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleError } from "../utils";
import { ToastContainer } from "react-toastify";
import "./Home.css";

function HighPriorityTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/todos", {
        headers: { Authorization: localStorage.getItem("token") },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setTodos(result.filter((t) => t.priority === "High"));
    } catch (err) {
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background">
      <div className="home-wrapper">
        <nav className="top-navbar">
          <div className="nav-links">
            <Link to="/home" className="nav-item">
              Home
            </Link>
            <Link to="/todos/in-progress" className="nav-item">
              In Progress
            </Link>
            <Link to="/todos/completed" className="nav-item">
              Completed
            </Link>
            <Link to="/todos/high-priority" className="nav-item active high">
              High Priority
            </Link>
          </div>
        </nav>

        <div className="home-card">
          <h2>High Priority Todos</h2>

          {loading ? (
            <p className="info-text">Loading...</p>
          ) : todos.length === 0 ? (
            <p className="info-text empty">No high priority tasks 🚀</p>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo._id} className="todo-item priority-high">
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

export default HighPriorityTodos;
