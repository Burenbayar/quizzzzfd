import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

const QUIZ_DURATION_SEC = 20 * 60; // 20 минут

export default function QuizPanel({ questions, grade, subject }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [percentage, setPercentage] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);

  // ⏱ таймертай холбоотой state-үүд
  const [remainingSec, setRemainingSec] = useState(QUIZ_DURATION_SEC);
  const [timerActive, setTimerActive] = useState(false);
  const [timeUsedSec, setTimeUsedSec] = useState(null);

  // 🔄 Шинэ тест ачааллагдах бүрт таймер, оноо, сонголтыг reset хийнэ
  useEffect(() => {
    if (!questions || questions.length === 0) {
      setTimerActive(false);
      setRemainingSec(QUIZ_DURATION_SEC);
      setScore(null);
      setPercentage(null);
      setShowCorrect(false);
      setSelectedAnswers({});
      setTimeUsedSec(null);
      return;
    }

    // Шинэ тест эхлэв
    setTimerActive(true);
    setRemainingSec(QUIZ_DURATION_SEC);
    setScore(null);
    setPercentage(null);
    setShowCorrect(false);
    setSelectedAnswers({});
    setTimeUsedSec(null);
  }, [questions]);

  // ⏱ Таймер өөрөө 1 секундээр бууна
  useEffect(() => {
    if (!timerActive) return;
    if (remainingSec <= 0) {
      // Цаг дууссан
      setTimerActive(false);
      setShowCorrect(true);
      setTimeUsedSec(QUIZ_DURATION_SEC); // бүх 20 минутыг ашигласан гэж үзнэ
      return;
    }

    const id = setInterval(() => {
      setRemainingSec((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [timerActive, remainingSec]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSelectAnswer = (qIndex, opt) => {
    // Оноо бодчихсон, эсвэл цаг дууссан бол өөрчлөхгүй
    if (showCorrect || !timerActive) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: opt }));
  };

  // 🎯 Оноо бодох + сервер дээр хадгалах
  const handleCalculateScore = async () => {
    if (!questions || questions.length === 0) return;

    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) correct++;
    });

    const total = questions.length;
    const pct = Math.round((correct / total) * 100);

    setScore(`${correct} / ${total}`);
    setPercentage(pct);
    setShowCorrect(true);
    setTimerActive(false);

    // Хэдэн секунд зарцуулсныг тооцоолно
    const used =
      timeUsedSec != null
        ? timeUsedSec
        : QUIZ_DURATION_SEC - remainingSec >= 0
          ? QUIZ_DURATION_SEC - remainingSec
          : 0;
    setTimeUsedSec(used);

    // 🔐 Нэвтэрсэн хэрэглэгчийн token байвал серверт хадгална
    try {
      const rawAuth = localStorage.getItem("auth");
      if (!rawAuth) return;

      let token = null;
      try {
        const parsed = JSON.parse(rawAuth);
        token = parsed?.token;
      } catch {
        token = null;
      }
      if (!token) return;

      await fetch(`${API_BASE}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          grade: grade ?? 0,
          subject: subject || "Тодорхойгүй",
          score: correct,
          total,
          percentage: pct,
          duration_seconds: used,
        }),
      });
    } catch (err) {
      console.error("Quiz result save error:", err);
    }
  };

  const titleText =
    subject === "Танин мэдэхүй"
      ? "Танин мэдэхүй тест"
      : `Тест – ${grade ? `${grade}-р анги` : ""} / ${subject || "-"}`;

  // Асуулт алга байвал
  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-panel">
        <div className="quiz-header">
          <div>
            <div className="quiz-title">{titleText}</div>
            <div className="quiz-subtitle">
              Энд AI-гаар үүсгэсэн тест харагдана.
            </div>
          </div>

          {/* Таймер — одоохондоо 20:00 гэж зүгээр харуулж болно */}
          <div
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.7)",
              fontSize: "13px",
            }}
          >
            ⏱ Цаг: <span style={{ fontWeight: 700 }}>20:00</span>
          </div>
        </div>

        <p style={{ marginTop: 10, fontSize: 14 }}>
          Зүүн талд тохиргоо хийж, <b>“Тест үүсгэх”</b> эсвэл{" "}
          <b>“Танин мэдэхүй тест”</b> товчийг дарна уу.
        </p>
      </div>
    );
  }

  return (
    <div className="quiz-panel">
      {/* HEADER + TIMER */}
      <div className="quiz-header">
        <div>
          <div className="quiz-title">{titleText}</div>
          <div className="quiz-subtitle">
            20 асуулттай сорил — 20 минутын хугацаатай
          </div>
          {!timerActive && showCorrect && (
            <div style={{ fontSize: 12, color: "#fbbf24", marginTop: 4 }}>
              Тест дууссан. Доорх оноог харна уу.
            </div>
          )}
          {!timerActive && !showCorrect && (
            <div style={{ fontSize: 12, color: "#f97373", marginTop: 4 }}>
              Цаг дууссан. Хариултуудаа оноо бодож харж болно.
            </div>
          )}
        </div>

        <div
          style={{
            padding: "6px 10px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.7)",
            fontSize: "13px",
          }}
        >
          ⏱ Цаг:{" "}
          <span
            style={{
              color: remainingSec <= 60 ? "#f97373" : "#f9a8ff",
              fontWeight: 700,
            }}
          >
            {formatTime(remainingSec)}
          </span>
        </div>
      </div>

      <div className="quiz-content">
        {questions.map((q, index) => (
          <div className="quiz-card" key={index}>
            <div className="quiz-question-number">{index + 1}</div>
            <div className="quiz-question-text">{q.question}</div>

            <div className="quiz-options">
              {q.options.map((opt, i) => {
                const isCorrect = showCorrect && opt === q.answer;
                const isWrong =
                  showCorrect &&
                  selectedAnswers[index] === opt &&
                  opt !== q.answer;

                return (
                  <label
                    key={i}
                    className={`quiz-option-item 
                      ${isCorrect ? "correct" : ""} 
                      ${isWrong ? "wrong" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q-${index}`}
                      checked={selectedAnswers[index] === opt}
                      disabled={showCorrect || !timerActive}
                      onChange={() => handleSelectAnswer(index, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="quiz-footer">
        <button
          className="quiz-submit-btn"
          onClick={handleCalculateScore}
          disabled={questions.length === 0 || showCorrect}
        >
          Оноо бодох
        </button>

        <div className="quiz-score-text">
          Оноо: {score ?? "-"}
          <br />
          {percentage != null && <span>{percentage}%</span>}
        </div>
      </div>
    </div>
  );
}
