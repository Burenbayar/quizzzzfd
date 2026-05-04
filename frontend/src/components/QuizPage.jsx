import React, { useState } from "react";
import QuizPanel from "./QuizPanel";

const API_BASE = import.meta.env.VITE_API_URL;


const GRADES = [6, 7, 8, 9, 10, 11, 12];
const SUBJECTS = [
  "Математик",
  "Монгол хэл",
  "Уран зохиол",
  "Англи хэл",
  "Физик",
  "Хими",
  "Биологи",
  "Газарзүй",
  "Түүх",
  "Мэдээлэл зүй",
];

export default function QuizPage() {
  const [grade, setGrade] = useState(null);
  const [subject, setSubject] = useState(null);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerateQuiz() {
    if (!grade || !subject) {
      alert("Эхлээд анги болон хичээлээ сонгоно уу.");
      return;
    }

    setLoading(true);
    setGeneratedQuiz(null);

    try {
      const res = await fetch(`${API_BASE}/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, subject }),
      });

      const data = await res.json();
      setGeneratedQuiz(data);
    } catch (err) {
      console.error("Quiz fetch error:", err);
      alert("Серверээс мэдээлэл авахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="quiz-layout">
      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="quiz-sidebar">
        <h3>Тохиргоо</h3>

        {/* Анги */}
        <div className="sidebar-block">
          <h4>Анги</h4>
          <div className="sidebar-chip-group">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={
                  "sidebar-chip " + (grade === g ? "sidebar-chip-active" : "")
                }
              >
                {g}-р
              </button>
            ))}
          </div>
        </div>

        {/* Хичээл */}
        <div className="sidebar-block">
          <h4>Хичээл</h4>
          <div className="sidebar-list">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={
                  "sidebar-list-item " +
                  (subject === s ? "sidebar-list-item-active" : "")
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Танин мэдэхүй */}
        <div className="sidebar-block">
          <h4>Тусгай</h4>
          <button
            className="sidebar-full-btn"
            onClick={() => {
              setGrade(0);
              setSubject("Танин мэдэхүй");
            }}
          >
            Танин мэдэхүй тест
          </button>
        </div>

        {/* Тест үүсгэх */}
        <button
          className="sidebar-generate-btn"
          onClick={handleGenerateQuiz}
          disabled={loading}
        >
          {loading ? "Ачааллаж байна..." : "Тест үүсгэх"}
        </button>
      </aside>

      {/* ---------------- MOBILE/TABLET DROPDOWN FILTERS ---------------- */}
      <div className="quiz-mobile-filters">
        <h3>Тохиргоо</h3>

        <div className="quiz-mobile-field">
          <label>Анги</label>
          <select
            value={grade ?? ""}
            onChange={(e) =>
              setGrade(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Анги сонгох</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}-р анги
              </option>
            ))}
          </select>
        </div>

        <div className="quiz-mobile-field">
          <label>Хичээл</label>
          <select
            value={subject ?? ""}
            onChange={(e) =>
              setSubject(e.target.value ? e.target.value : null)
            }
          >
            <option value="">Хичээл сонгох</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          className="sidebar-full-btn"
          onClick={() => {
            setGrade(0);
            setSubject("Танин мэдэхүй");
          }}
          style={{ marginTop: 4 }}
        >
          Танин мэдэхүй тест
        </button>

        <button
          className="sidebar-generate-btn"
          onClick={handleGenerateQuiz}
          disabled={loading}
        >
          {loading ? "Тест ачааллаж байна..." : "Тест үүсгэх"}
        </button>
      </div>

      {/* ---------------- MAIN QUIZ SECTION ---------------- */}
      <main className="quiz-main">
        <h2 className="quiz-page-title">
          {grade ? `${grade}-р анги` : "Анги сонгоогүй"} /{" "}
          {subject || "Хичээл сонгоогүй"}
        </h2>

        <p className="quiz-page-subtitle">
          Зүүн талын тохиргоогоор анги, хичээлээ сонгоод тест үүсгэнэ үү.
        </p>

        {loading && (
          <div className="quiz-loading">
            <div className="quiz-spinner" />
            <span>Тест ачааллаж байна...</span>
          </div>
        )}

        {!loading && generatedQuiz && (
          <QuizPanel
            questions={generatedQuiz}
            grade={grade}
            subject={subject}
          />
        )}
      </main>
    </div>
  );
}
