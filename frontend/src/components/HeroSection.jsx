import React from "react";
import { useNavigate } from "react-router-dom"; // ← энэ мөрийг нэм

export default function Hero() {
  const navigate = useNavigate(); // ← navigate функц

  return (
    <section className="container hero">
      <div className="content-side">
        <div className="hero-tag">AI FOR WOMEN • TEAM 4</div>

        <h1>
          Ирээдүйн <br />
          Боловсрол
        </h1>

        <p>
          Технологийн дэвшлийг ашиглан сурагч бүрт
          хувьчилсан, ухаалаг тестийн орчныг бий болгоорой.
        </p>

        <div className="hero-buttons">
          <button
            className="hero-btn hero-btn-primary"
            onClick={() => navigate("/quiz")}   // ← ЭНД!
          >
            Тест эхлүүлэх
          </button>

          <button
            className="hero-btn hero-btn-secondary"
            onClick={() => navigate("/quiz")}   // хүсвэл энд өөр зам хийж болно
          >
            Танин мэдэхүй турших
          </button>
        </div>
      </div>

      <div className="image-side">
        <div className="glow-effect" />
        <div className="hero-card">
          <div className="hero-card-glow" />
          <img src="/logo.png" alt="Hero" className="hero-image" />
        </div>
      </div>
    </section>
  );
}
