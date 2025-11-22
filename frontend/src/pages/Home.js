import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import { ToastContainer } from "react-toastify";
import "./Home.css";

function Home() {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get logged in user name
  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoggedInUser(user || "");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    handleSuccess("User logged out");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const fetchTodolist = async () => {
    try {
      setLoading(true);
      const url = "http://localhost:8080/api/todos";
      const res = await fetch(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to fetch todos");
      }
      setTodos(result || []);
    } catch (err) {
      handleError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodolist();
  }, []);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) {
      return handleError("Todo name is required");
    }

    try {
      const res = await fetch("http://localhost:8080/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({ name: newTodo.trim(), isDone: false }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to add todo");
      }

      setTodos((prev) => [result, ...prev]);
      setNewTodo("");
      handleSuccess("Todo added");
    } catch (err) {
      handleError(err.message || "Something went wrong");
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const res = await fetch(`http://localhost:8080/api/todos/${todo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          name: todo.name,
          isDone: !todo.isDone,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to update todo");
      }

      setTodos((prev) => prev.map((t) => (t._id === todo._id ? result : t)));
    } catch (err) {
      handleError(err.message || "Something went wrong");
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/todos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to delete todo");
      }

      setTodos((prev) => prev.filter((t) => t._id !== id));
      handleSuccess("Todo deleted");
    } catch (err) {
      handleError(err.message || "Something went wrong");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all todos?")) return;

    try {
      const res = await fetch("http://localhost:8080/api/todos", {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to clear todos");
      }

      setTodos([]);
      handleSuccess("All todos cleared");
    } catch (err) {
      handleError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="background">
      <div className="home-wrapper">
        <div className="home-card">
          <header className="home-header">
            <div>
              <p className="welcome-text">Welcome back to Fun House,</p>
              <h1 className="user-name">{loggedInUser || "User"}</h1>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </header>

          <section className="todo-input-section">
            <form onSubmit={handleAddTodo} className="todo-form">
              <input
                type="text"
                placeholder="What do you want to do today?"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                className="todo-input"
              />
              <button type="submit" className="add-btn">
                + Add
              </button>
            </form>
          </section>

          <section className="todo-list-section">
            <div className="todo-list-header">
              <h2>Your Todos</h2>
              {todos.length > 0 && (
                <button className="clear-btn" onClick={handleClearAll}>
                  Clear All
                </button>
              )}
            </div>

            {loading ? (
              <p className="info-text">Loading your tasks...</p>
            ) : todos.length === 0 ? (
              <p className="info-text empty">
                No todos yet. Add your first task ✨
              </p>
            ) : (
              <ul className="todo-list">
                {todos.map((todo) => (
                  <li key={todo._id} className="todo-item">
                    <label className="todo-left">
                      <input
                        type="checkbox"
                        checked={todo.isDone}
                        onChange={() => handleToggleTodo(todo)}
                      />
                      <span
                        className={
                          todo.isDone ? "todo-text todo-done" : "todo-text"
                        }
                      >
                        {todo.name}
                      </span>
                    </label>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTodo(todo._id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
}

export default Home;
