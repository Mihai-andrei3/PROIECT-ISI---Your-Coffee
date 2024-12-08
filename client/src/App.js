import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import RegisterPage from "./components/RegisterPage"; // Create this component
import AdminDashboard from "./components/AdminDashboard"; // Create this component
import ClientDashboard from "./components/ClientDashboard"; // Create this component
import Coffees from "./components/Coffees";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/Coffees" element={<Coffees />} />
          <Route path="/" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;