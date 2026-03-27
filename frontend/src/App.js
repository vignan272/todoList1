import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CompletedTodos from "./pages/CompletedTodos";
import InProgressTodos from "./pages/InProgressTodos";
import HighPriorityTodos from "./pages/HighPriorityTodos";
import { useState } from "react";
import RefrshHandler from "./RefrshHandler";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <SpeedInsights />
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />

        <Route
          path="/todos/in-progress"
          element={<PrivateRoute element={<InProgressTodos />} />}
        />

        <Route
          path="/todos/completed"
          element={<PrivateRoute element={<CompletedTodos />} />}
        />

        <Route
          path="/todos/high-priority"
          element={<PrivateRoute element={<HighPriorityTodos />} />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </div>
  );
}

export default App;
