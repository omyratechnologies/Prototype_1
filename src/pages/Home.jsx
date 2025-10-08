import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import HomeProductsSection from "../components/HomeProductSection";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} onLogout={logout} />
      <HeroSection />
      <HomeProductsSection />
    </div>
  );
}
