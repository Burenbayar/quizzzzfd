import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

// Түвшин тооцогч (хувиар)
function getLevel(percent) {
    if (percent < 30) return "I";
    if (percent < 40) return "II";
    if (percent < 50) return "III";
    if (percent < 60) return "IV";
    if (percent < 70) return "V";
    if (percent < 80) return "VI";
    if (percent < 90) return "VII";
    return "VIII";
}

// Хугацааг форматлах: секунд → "мм:сс"
function formatDuration(sec) {
    if (sec == null) return "-";
    const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

// Хувийг авах: backend-д байгаа бол percentage-ийг, үгүй бол score/total
function getPercentFromResult(r) {
    if (typeof r.percentage === "number") return r.percentage;
    if (!r.total) return 0;
    return (r.score / r.total) * 100;
}

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 🧮 Анализ: дундаж хувь, түвшин, хамгийн сайн/сул хичээл, дундаж хугацаа
    const stats = useMemo(() => {
        if (!results || results.length === 0) return null;

        const totalQuizzes = results.length;

        // дундаж хувь
        const sumPercent = results.reduce((acc, r) => {
            const p = getPercentFromResult(r);
            return acc + p;
        }, 0);
        const avgPercent = sumPercent / totalQuizzes;
        const avgLevel = getLevel(avgPercent);

        // дундаж хугацаа (секунд)
        let durationSum = 0;
        let durationCount = 0;
        for (const r of results) {
            if (typeof r.duration_seconds === "number") {
                durationSum += r.duration_seconds;
                durationCount += 1;
            }
        }
        const avgDurationSec =
            durationCount > 0 ? durationSum / durationCount : null;

        // subject-н дундаж
        const subjectMap = {};
        for (const r of results) {
            const key = r.subject;
            const p = getPercentFromResult(r);
            if (!subjectMap[key]) {
                subjectMap[key] = { count: 0, sum: 0 };
            }
            subjectMap[key].count += 1;
            subjectMap[key].sum += p;
        }

        let bestSubject = null;
        let worstSubject = null;

        Object.entries(subjectMap).forEach(([subject, info]) => {
            const avg = info.sum / info.count;
            if (!bestSubject || avg > bestSubject.avg) {
                bestSubject = { subject, avg };
            }
            if (!worstSubject || avg < worstSubject.avg) {
                worstSubject = { subject, avg };
            }
        });

        return {
            totalQuizzes,
            avgPercent,
            avgLevel,
            avgDurationSec,
            bestSubject,
            worstSubject,
        };
    }, [results]);

    // 🔄 Profile data авах
    useEffect(() => {
        async function fetchProfile() {
            try {
                const rawAuth = localStorage.getItem("auth");
                if (!rawAuth) {
                    setError("Та нэвтрээгүй байна.");
                    setLoading(false);
                    return;
                }

                const { token } = JSON.parse(rawAuth);
                if (!token) {
                    setError("Token олдсонгүй.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${API_BASE}/profile-data`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(
                        data.detail || "Профайл мэдээлэл авахад алдаа гарлаа."
                    );
                }

                const data = await res.json(); // { user, results }
                setUser(data.user);
                setResults(data.results || []);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: 80 }}>
                <p>Профайл мэдээлэл ачааллаж байна...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ paddingTop: 80 }}>
                <h2>Профайл</h2>
                <p style={{ color: "#f97373" }}>{error}</p>
            </div>
        );
    }

    return (
        <div
            className="container profile"
            style={{
                paddingTop: 80,
                paddingBottom: 40,
                display: "flex",
                alignItems: "flex-start",
                gap: 32,
            }}
        >
            {/* ЗҮҮН ТАЛ – ХЭРЭГЛЭГЧИЙН МЭДЭЭЛЭЛ + АНАЛИЗ */}
            <div
                className="content-side"
                style={{
                    maxWidth: 360,
                    paddingRight: 0,
                }}
            >
                <h1>Таны профайл</h1>
                <p style={{ marginTop: 8 }}>
                    <b>Нэр:</b> {user?.name || "Нэр тодорхойгүй"}
                </p>
                <p>
                    <b>Имэйл:</b> {user?.email}
                </p>

                {stats && (

                    <div className="profile-analytics-card">
                        <h3 className="profile-analytics-title">Гүйцэтгэлийн тойм</h3>

                        <div className="profile-analytics-list">
                            <div className="profile-analytics-item">
                                <b>Нийт тест:</b> {stats.totalQuizzes}
                            </div>

                            <div className="profile-analytics-item">
                                <b>Дундаж гүйцэтгэл:</b> {stats.avgPercent.toFixed(1)}%
                            </div>

                            <div className="profile-analytics-item">
                                <b>Дундаж түвшин:</b>{" "}
                                <span className="profile-level">{stats.avgLevel} түвшин</span>
                            </div>

                            {typeof stats.avgDurationSec === "number" && (
                                <div className="profile-analytics-item">
                                    <b>Дундаж хугацаа:</b> {formatDuration(Math.round(stats.avgDurationSec))} минут
                                </div>
                            )}

                            {stats.bestSubject && (
                                <div className="profile-analytics-item">
                                    <b>Хамгийн сайн хичээл:</b>{" "}
                                    <span className="profile-best">
                                        {stats.bestSubject.subject} ({stats.bestSubject.avg.toFixed(1)}%)
                                    </span>
                                </div>
                            )}

                            {stats.worstSubject && (
                                <div className="profile-analytics-item">
                                    <b>Сайжруулах хичээл:</b>{" "}
                                    <span className="profile-worst">
                                        {stats.worstSubject.subject} ({stats.worstSubject.avg.toFixed(1)}%)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                )}
            </div>

            {/* БАРУУН ТАЛ – ТЕСТИЙН ТҮҮХ (SCROLLABLE) */}
            <div className='test-history'
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <h2 style={{ marginBottom: 12 }}>Тестийн түүх</h2>

                {(!results || results.length === 0) && (
                    <p style={{ fontSize: 14, color: "#9ca3af" }}>
                        Одоогоор хадгалагдсан тест байхгүй байна. Нэг
                        тест өгөөд дахиад ирээрэй 😊
                    </p>
                )}

                {results && results.length > 0 && (
                    <div
                        style={{
                            marginTop: 8,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            maxHeight: 420, // ✨ зөвхөн энэ хэсэг scroll-тай
                            overflowY: "auto",
                            paddingRight: 4,
                        }}
                    >
                        {results.map((r) => {
                            const percent = getPercentFromResult(r);
                            const level = getLevel(percent);
                            const date = new Date(r.created_at);

                            return (
                                <div
                                    key={r.id}
                                    className="quiz-card"
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>
                                            {r.subject}{" "}
                                            {r.grade && r.grade !== 0
                                                ? `· ${r.grade}-р анги`
                                                : ""}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#9ca3af",
                                            }}
                                        >
                                            {date.toLocaleString()}
                                        </div>
                                        {typeof r.duration_seconds === "number" && (
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#c4b5fd",
                                                    marginTop: 2,
                                                }}
                                            >
                                                Хугацаа:{" "}
                                                {formatDuration(r.duration_seconds)}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                        <div>
                                            Оноо: {r.score} / {r.total}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#a5b4fc",
                                            }}
                                        >
                                            {percent.toFixed(1)}%
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#f472b6",
                                            }}
                                        >
                                            Түвшин: {level}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
