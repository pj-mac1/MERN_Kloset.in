import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import AuthModal from "./components/AuthModal";
import ThriftMarket from "./pages/ThriftMarket";
import MyCloset from "./pages/MyCloset";
import OutfitPlanner from "./pages/OutfitPlanner";
import AddClothing from "./pages/AddClothing";
import ProfilePage from "./pages/ProfilePage";
import "./style.css";

function ToastNotification() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className={`toast-notification ${toast.type}`}>
      <span>{toast.message}</span>
    </div>
  );
}

function MainApp() {
  return (
    <div className="app-layout">
      <Navbar />
      <CartDrawer />
      <AuthModal />
      <ToastNotification />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/market" replace />} />
          <Route path="/market" element={<ThriftMarket />} />
          <Route path="/thrift" element={<ThriftMarket />} />
          <Route path="/thrift-store" element={<ThriftMarket />} />
          <Route path="/feed" element={<Navigate to="/market" replace />} />
          <Route path="/closet" element={<MyCloset />} />
          <Route path="/planner" element={<OutfitPlanner />} />
          <Route path="/add" element={<AddClothing />} />
          <Route path="/add-clothing" element={<AddClothing />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/market" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AppProvider>
  );
}