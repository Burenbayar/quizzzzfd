import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Hero from "./components/HeroSection";
import QuizPage from "./components/QuizPage";
import ProfilePage from "./components/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="main-wrapper">
        <div className="vertical-marquee-container">
          <div className="flowing-text">
            AI FOR WOMEN 100 БАГШ ХӨТӨЛБӨР • AI FOR WOMEN 100 БАГШ ХӨТӨЛБӨР •
          </div>
        </div>

        <Header />

        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
