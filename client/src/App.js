import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import RegisterPage from "./components/RegisterPage"; 
import AdminDashboard from "./components/AdminDashboard"; 
import ClientDashboard from "./components/ClientDashboard"; 
import MyMap from "./components/MyMap";
import CoffeShopSelector from "./components/CoffeShopSelector";
import AdminProfile from "./components/Coffees";
import Offers from "./components/Offers";
import MyRewards from "./components/MyRewards";
import AdminClientManagement from "./components/AdminClientManagement";
import ClientMap from "./components/ClientMap";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/ClientMap" element={<ClientMap />} />
          <Route path="/reviews" element={<AdminClientManagement />} />
          <Route path="/myRewards" element={<MyRewards />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/MycoffeeShop" element={<CoffeShopSelector />} />
          <Route path="/MyMap" element={<MyMap />} />
          <Route path="/Coffees" element={<AdminProfile />} />
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