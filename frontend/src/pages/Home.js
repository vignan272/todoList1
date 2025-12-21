import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import "./Home.css";

/* ================= HELPERS ================= */

// datetime-local → timestamp (LOCAL time)
const toTimestamp = (datetimeLocal) => {
  if (!datetimeLocal) return null;
  const [date, time] = datetimeLocal.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return Date.UTC(y, m - 1, d, h, min);
};

// timestamp → datetime-local (LOCAL time) ✅ FIX
const toLocalInputValue = (timestamp) => {
  if (!timestamp) return "";
  const d = new Date(timestamp);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

// Countdown formatter
const formatRemainingTime = (ms) => {
  if (!ms || ms <= 0) return "Expired";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${m}m ${s}s`;
};

/* ================= COMPONENT ================= */

function Home() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [expiryAt, setExpiryAt] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [now, setNow] = useState(Date.now());

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editExpiryAt, setEditExpiryAt] = useState("");

  const navigate = useNavigate();
  const alarmMap = useRef({});

  /* -------- AUTH -------- */
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  /* -------- CLOCK -------- */
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  /* -------- NOTIFICATION PERMISSION -------- */
  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  /* -------- FETCH TODOS -------- */
  useEffect(() => {
    fetch("https://todo-list-api-henna.vercel.app/api/todos", {
      headers: { Authorization: localStorage.getItem("token") },
    })
      .then((res) => res.json())
      .then((data) => setTodos(data || []))
      .catch(() => handleError("Failed to load todos"));
  }, []);

  /* -------- ALARM -------- */
  const scheduleAlarm = (todo) => {
    if (!todo.expiryAt) return;
    if (alarmMap.current[todo._id]) return;
    if (Notification.permission !== "granted") return;

    const delay = todo.expiryAt - Date.now();
    if (delay <= 0) return;

    alarmMap.current[todo._id] = setTimeout(() => {
      new Notification("⏰ Todo Reminder", {
        body: `${todo.name} (${todo.priority})`,
      });
    }, delay);
  };

  /* -------- ADD TODO -------- */
  const addTodo = async (e) => {
    e.preventDefault();
    if (!task.trim()) return handleError("Task is required");

    const res = await fetch("https://todo-list-api-henna.vercel.app/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({
        name: task,
        isDone: false,
        expiryAt: expiryAt ? toTimestamp(expiryAt) : null,
        priority,
      }),
    });

    const result = await res.json();
    if (!res.ok) return handleError(result.message);

    setTodos((p) => [result, ...p]);
    scheduleAlarm(result);

    setTask("");
    setExpiryAt("");
    setPriority("Medium");

    handleSuccess("Todo added");
  };

  /* -------- TOGGLE -------- */
  const toggleTodo = async (todo) => {
    const res = await fetch(
      `https://todo-list-api-henna.vercel.app/api/todos/${todo._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          name: todo.name,
          isDone: !todo.isDone,
          expiryAt: todo.expiryAt,
          priority: todo.priority,
        }),
      }
    );

    const result = await res.json();
    if (!res.ok) return handleError(result.message);

    setTodos((p) => p.map((t) => (t._id === todo._id ? result : t)));
  };

  /* -------- EDIT -------- */
  const startEdit = (todo) => {
    setEditId(todo._id);
    setEditTask(todo.name);
    setEditPriority(todo.priority);
    setEditExpiryAt(toLocalInputValue(todo.expiryAt)); // ✅ FIX
  };

  const cancelEdit = () => setEditId(null);

  const saveEdit = async (todo) => {
    const res = await fetch(
      `https://todo-list-api-henna.vercel.app/api/todos/${todo._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          name: editTask,
          priority: editPriority,
          expiryAt: editExpiryAt ? toTimestamp(editExpiryAt) : null,
          isDone: todo.isDone,
        }),
      }
    );

    const result = await res.json();
    if (!res.ok) return handleError(result.message);

    if (alarmMap.current[todo._id]) {
      clearTimeout(alarmMap.current[todo._id]);
      delete alarmMap.current[todo._id];
    }

    scheduleAlarm(result);
    setTodos((p) => p.map((t) => (t._id === todo._id ? result : t)));
    setEditId(null);

    handleSuccess("Todo updated");
  };

  /* -------- DELETE -------- */
  const deleteTodo = async (id) => {
    if (!window.confirm("Delete this todo?")) return;

    const res = await fetch(
      `https://todo-list-api-henna.vercel.app/api/todos/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("token") },
      }
    );

    const result = await res.json();
    if (!res.ok) return handleError(result.message);

    clearTimeout(alarmMap.current[id]);
    delete alarmMap.current[id];

    setTodos((p) => p.filter((t) => t._id !== id));
    handleSuccess("Todo deleted");
  };

  /* -------- LOGOUT -------- */
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ================= UI ================= */

  return (
    <div className="background">
      <nav className="top-navbar">
        <div className="nav-links">
          <Link to="/home" className="nav-item active">Home</Link>
          <Link to="/todos/in-progress" className="nav-item">In Progress</Link>
          <Link to="/todos/completed" className="nav-item">Completed</Link>
          <Link to="/todos/high-priority" className="nav-item high">High Priority</Link>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </nav>

      <div className="home-wrapper">
        <div className="home-card">
          <form onSubmit={addTodo} className="todo-form">
            <input
              className="todo-input"
              placeholder="Todo name"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />

            <input
              type="datetime-local"
              className="todo-input"
              value={expiryAt}
              onChange={(e) => setExpiryAt(e.target.value)}
            />

            <select
              className="todo-input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <button className="add-btn">+ Add</button>
          </form>

          <ul className="todo-list">
            {todos.map((todo) => {
              const remaining = todo.expiryAt ? todo.expiryAt - now : null;

              return (
                <li key={todo._id} className="todo-item">
                  {editId === todo._id ? (
                    <>
                      <input
                        className="todo-input"
                        value={editTask}
                        onChange={(e) => setEditTask(e.target.value)}
                      />

                      <input
                        type="datetime-local"
                        className="todo-input"
                        value={editExpiryAt}
                        onChange={(e) => setEditExpiryAt(e.target.value)}
                      />

                      <select
                        className="todo-input"
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>

                      <button onClick={() => saveEdit(todo)}>💾</button>
                      <button onClick={cancelEdit}>❌</button>
                    </>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={todo.isDone}
                        onChange={() => toggleTodo(todo)}
                      />

                      <span className={todo.isDone ? "todo-done" : ""}>
                        {todo.name} ({todo.priority})
                      </span>

                      <span className="todo-timer">
                        ⏳ {formatRemainingTime(remaining)}
                      </span>

                      <button onClick={() => startEdit(todo)}>✏️</button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteTodo(todo._id)}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Home;
