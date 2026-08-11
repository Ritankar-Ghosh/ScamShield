"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";

export default function Home() {
  const [message, setMessage] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scanStep, setScanStep] = useState(0);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistory, setSelectedHistory] = useState(null);

  const scanSteps = [
    "Inspecting message patterns",
    "Analyzing threat signals",
    "Inspecting URLs",
    "Running AI security analysis",
  ];

  useEffect(() => {
    if (!analyzing) {
      setScanStep(0);
      return;
    }

    const interval = setInterval(() => {
      setScanStep((current) => (current + 1) % scanSteps.length);
    }, 900);

    return () => clearInterval(interval);
  }, [analyzing]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(
        "https://scamshield-backend-jqmi.onrender.com/history?page=1&limit=20"
      );

      if (!response.ok) {
        throw new Error("Unable to load analysis history.");
      }

      const data = await response.json();

      if (data.available) {
        setHistory(data.history || []);
      } else {
        setHistory([]);
        setHistoryError(
          data.message || "MongoDB history is currently unavailable."
        );
      }
    } catch (err) {
      console.error("History loading failed:", err);

      setHistoryError(
        "Unable to connect to the ScamShield history service."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this analysis?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://scamshield-backend-jqmi.onrender.com/history/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete analysis.");
      }

      // Remove deleted item immediately from UI
      setHistory((currentHistory) =>
        currentHistory.filter((item) => item.id !== id)
      );

      // If the deleted item was currently open, close it
      if (selectedHistory?.id === id) {
        setSelectedHistory(null);
      }

    } catch (error) {
      console.error(
        "Delete history failed:",
        error
      );

      setHistoryError(
        "Unable to delete this analysis. Please try again."
      );
    }
  };


  // ============================================================
  // DELETE ALL HISTORY
  // ============================================================

  const handleDeleteAllHistory = async () => {
    // Nothing to delete
    if (!history || history.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete ALL analysis history? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "https://scamshield-backend-jqmi.onrender.com/history",
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to delete all history."
        );
      }

      const data = await response.json();

      console.log(
        "Delete all history response:",
        data
      );

      // Clear all history from UI
      setHistory([]);

      // Close currently selected analysis
      setSelectedHistory(null);

      // Clear any previous history error
      setHistoryError("");

    } catch (error) {
      console.error(
        "Delete all history failed:",
        error
      );

      setHistoryError(
        "Unable to delete all history. Please try again."
      );
    }
  };

  const handleAnalyze = async () => {
    if (!message.trim()) return;

    setAnalyzing(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("https://scamshield-backend-jqmi.onrender.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to analyze the message.");
      }

      const data = await response.json();

      setResult(data);

      fetchHistory();

    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to ScamShield. Make sure the backend is running on port 9000."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setError("");
    setMessage("");
  };

  const loadExample = (type) => {
    const examples = {
      high: `🚨 URGENT! Your bank account will be blocked. Verify your account immediately by clicking here: http://bit.ly/account-check123 and send your OTP to confirm your identity!`,

      medium: `Your account requires a security update. Please review your account information and verify your details here: http://example.com/verify-account. Some account features may be temporarily unavailable if you do not complete the update.`,

      safe: `Your order has been delivered successfully. Thank you for shopping with us.`,
    };

    setMessage(examples[type]);
    setResult(null);
    setError("");
  };

  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-[#05070b] text-gray-100">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="security-background" />

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        {/* Logo */}

        <div className="flex items-center gap-3">
          <div className="shield-glow relative flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.08]">
            <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 blur-md" />

            <span className="relative text-xl">🛡️</span>
          </div>

          <div>
            <div className="text-lg font-black tracking-[0.18em]">
              SCAM<span className="text-emerald-400">SHIELD</span>
            </div>

            <div className="text-[9px] font-medium tracking-[0.38em] text-gray-600">
              THREAT INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Navigation */}

        <div className="hidden items-center gap-8 text-sm text-gray-500 md:flex">

          <a
            href="#history"
            className="transition hover:text-emerald-400"
          >
            History
          </a>

          <a
            href="#how-it-works"
            className="transition hover:text-emerald-400"
          >
            How it works
          </a>

          <a
            href="#features"
            className="transition hover:text-emerald-400"
          >
            Features
          </a>

          <a
            href="#about"
            className="transition hover:text-emerald-400"
          >
            About
          </a>

        </div>

        {/* Status */}

        <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-2 text-[10px] font-bold tracking-widest text-emerald-400 sm:flex">
          <span className="security-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
          SYSTEM ONLINE
        </div>
      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
        {/* Badge */}

        <div className="float-glow mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-emerald-300">
          <span className="security-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
          AI-POWERED THREAT DETECTION
        </div>

        {/* Heading */}

        <h1 className="text-glow text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
          Don&apos;t get scammed.
          <br />

          <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            Get Shielded.
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
          Analyze suspicious messages, links, and social-engineering attempts
          using rule-based threat intelligence and AI-powered security
          analysis.
        </p>

        {/* =================================================
            ANALYZER
        ================================================= */}

        <div className="mx-auto mt-12 max-w-4xl">
          <div className="security-card rounded-[30px] border border-white/[0.08] bg-white/[0.025] p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="cyber-line rounded-[24px] border border-white/[0.06] bg-[#080c12] p-5 sm:p-6">
              {/* Analyzer header */}

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <span className="text-emerald-400">◉</span>
                  Message Analyzer
                </div>

                <span className="text-[10px] font-medium tracking-wider text-gray-600">
                  {message.length} CHARACTERS
                </span>
              </div>

              {/* Textarea */}

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste a suspicious SMS, email, message, or URL here..."
                className="min-h-[190px] w-full resize-none rounded-2xl border border-white/[0.06] bg-black/20 p-5 text-sm leading-7 text-gray-200 outline-none transition placeholder:text-gray-700 focus:border-emerald-400/30 focus:bg-black/30"
              />

              {/* Demo buttons */}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => loadExample("high")}
                  className="rounded-lg border border-red-400/10 bg-red-400/[0.035] px-3 py-2 text-[10px] font-semibold tracking-wide text-red-300 transition hover:border-red-400/25 hover:bg-red-400/[0.07]"
                >
                  🚨 HIGH RISK DEMO
                </button>

                <button
                  onClick={() => loadExample("medium")}
                  className="rounded-lg border border-yellow-400/10 bg-yellow-400/[0.035] px-3 py-2 text-[10px] font-semibold tracking-wide text-yellow-300 transition hover:border-yellow-400/25 hover:bg-yellow-400/[0.07]"
                >
                  ⚠ SUSPICIOUS DEMO
                </button>

                <button
                  onClick={() => loadExample("safe")}
                  className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.035] px-3 py-2 text-[10px] font-semibold tracking-wide text-emerald-300 transition hover:border-emerald-400/25 hover:bg-emerald-400/[0.07]"
                >
                  ✓ SAFE DEMO
                </button>
              </div>

              {/* Analyzer controls */}

              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-left text-xs leading-5 text-gray-600">
                  🔒 Message processing is performed through your ScamShield
                  analysis engine.
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !message.trim()}
                  className="button-shine group relative rounded-xl bg-emerald-400 px-7 py-3.5 text-sm font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {analyzing ? (
                      <>
                        <span className="loading-dot h-2 w-2 rounded-full bg-black" />
                        Scanning...
                      </>
                    ) : (
                      <>🔍 Analyze Threat</>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* =================================================
              SCANNING PANEL
          ================================================= */}

          {analyzing && (
            <div className="result-reveal mt-5 overflow-hidden rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-5 text-left backdrop-blur-xl">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.25em] text-emerald-400">
                    SCAMSHIELD SCANNER
                  </div>

                  <div className="mt-2 text-sm font-semibold text-gray-200">
                    {scanSteps[scanStep]}
                  </div>
                </div>

                <div className="scanner-radar hidden sm:block" />

                <div className="text-2xl sm:hidden">◉</div>
              </div>

              {/* Progress */}

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div className="scan-progress h-full rounded-full bg-emerald-400" />
              </div>

              {/* Steps */}

              <div className="mt-4 grid gap-2 text-[10px] text-gray-600 sm:grid-cols-4">
                {scanSteps.map((step, index) => (
                  <div
                    key={step}
                    className={`transition ${index === scanStep
                      ? "text-emerald-400"
                      : index < scanStep
                        ? "text-gray-400"
                        : ""
                      }`}
                  >
                    {index < scanStep
                      ? "✓"
                      : index === scanStep
                        ? "◉"
                        : "○"}{" "}
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="result-reveal mx-auto mt-6 max-w-4xl rounded-2xl border border-red-400/15 bg-red-400/[0.04] p-5 text-left text-sm text-red-300">
            <div className="font-bold">⚠ CONNECTION ERROR</div>

            <div className="mt-1 text-xs leading-5 text-red-300/70">
              {error}
            </div>
          </div>
        )}

        {/* =================================================
          RESULTS
      ================================================= */}

        {result && (
          <Results result={result} onReset={resetAnalysis} />
        )}

        {/* =================================================
            TRUST SIGNALS
        ================================================= */}

        {!result && !analyzing && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-semibold tracking-wider text-gray-600">
            <span>✓ AI ANALYSIS</span>
            <span>✓ URL INTELLIGENCE</span>
            <span>✓ RISK SCORING</span>
            <span>✓ THREAT INDICATORS</span>
          </div>
        )}
      </section>

      {/* =====================================================
    ANALYSIS HISTORY
===================================================== */}

      <section
        id="history"
        className="relative z-10 border-t border-white/[0.05] bg-white/[0.012]"
      >
        <div className="mx-auto max-w-6xl px-6 py-24">

          <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="text-[10px] font-bold tracking-[0.3em] text-emerald-400">
                MONGODB INTELLIGENCE
              </div>

              <h2 className="mt-3 text-3xl font-black">
                Analysis History
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600">
                Previously analyzed messages are securely stored and retrieved
                from the ScamShield analysis database.
              </p>
            </div>

            <button
              onClick={fetchHistory}
              disabled={historyLoading}
              className="w-fit rounded-xl border border-emerald-400/15 bg-emerald-400/[0.035] px-5 py-3 text-[10px] font-black tracking-wider text-emerald-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {historyLoading ? "LOADING..." : "↻ REFRESH HISTORY"}
            </button>

          </div>

          {historyError && (
            <div className="mb-5 rounded-2xl border border-red-400/10 bg-red-400/[0.025] p-5 text-sm text-red-300">
              <div className="font-bold">
                ⚠ HISTORY UNAVAILABLE
              </div>

              <div className="mt-1 text-xs text-red-300/70">
                {historyError}
              </div>
            </div>
          )}

          {historyLoading && history.length === 0 ? (
            <div className="rounded-[30px] border border-white/[0.06] bg-white/[0.025] p-10 text-center">
              <div className="security-pulse mx-auto h-3 w-3 rounded-full bg-emerald-400" />

              <div className="mt-4 text-xs font-bold tracking-wider text-gray-500">
                LOADING ANALYSIS HISTORY...
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-[30px] border border-white/[0.06] bg-white/[0.025] p-10 text-center">
              <div className="text-4xl">
                ◈
              </div>

              <div className="mt-4 text-sm font-bold text-gray-300">
                No analysis history yet
              </div>

              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-gray-600">
                Analyze your first suspicious message and the result will
                automatically appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {history.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}

                  onSelect={async () => {
                    try {
                      const response = await fetch(
                        `https://scamshield-backend-jqmi.onrender.com/history/${item.id}`
                      );

                      if (!response.ok) {
                        throw new Error(
                          "Unable to retrieve analysis."
                        );
                      }

                      const data = await response.json();

                      setSelectedHistory(data);

                    } catch (error) {
                      console.error(
                        "History item error:",
                        error
                      );
                    }
                  }}

                  onDelete={handleDeleteHistory}
                />
              ))}

            </div>
          )}

          {selectedHistory && (
            <HistoryDetail
              result={selectedHistory}
              onClose={() => setSelectedHistory(null)}
            />
          )}

        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="relative z-10 border-t border-white/[0.05] bg-white/[0.012]"
      >
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-12 text-center">
            <div className="text-[10px] font-bold tracking-[0.3em] text-emerald-400">
              DEFENSE LAYER
            </div>

            <h2 className="mt-3 text-3xl font-black">
              Multiple signals. One clear verdict.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600">
              ScamShield combines multiple detection techniques to identify
              suspicious patterns that simple keyword scanners can miss.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon="◈"
              title="Message Intelligence"
              description="Detect urgency, financial manipulation, credential requests, OTP scams, and suspicious language patterns."
            />

            <FeatureCard
              icon="⌁"
              title="URL Intelligence"
              description="Analyze links for shorteners, insecure protocols, suspicious terms, IP addresses, and unusual structures."
            />

            <FeatureCard
              icon="✦"
              title="AI Analysis"
              description="AI analyzes the context and intent behind suspicious messages and provides an explainable security assessment."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="relative z-10 mx-auto max-w-6xl px-6 py-24"
      >
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-[10px] font-bold tracking-[0.3em] text-emerald-400">
              HOW IT WORKS
            </div>

            <h2 className="mt-4 text-4xl font-black leading-tight">
              From suspicious message
              <br />
              to clear answer.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-gray-600">
              ScamShield examines the message from multiple angles before
              presenting the result in a simple, understandable format.
            </p>
          </div>

          <div className="space-y-4">
            <Step
              number="01"
              title="Paste"
              text="Submit a suspicious SMS, email, message, or URL."
            />

            <Step
              number="02"
              title="Analyze"
              text="The detection engine examines language, links, and behavioral signals."
            />

            <Step
              number="03"
              title="Understand"
              text="Receive a risk score, threat indicators, and an AI-generated explanation."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        id="about"
        className="relative z-10 border-t border-white/[0.05] px-6 py-10"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-center text-[10px] font-medium tracking-wider text-gray-700 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>© 2026 SCAMSHIELD</div>

          <div>BUILT FOR SAFER DIGITAL COMMUNICATION</div>
        </div>
      </footer>
    </main>
  );
}

function HistoryItem({ item, onSelect, onDelete }) {
  const risk = Number(item?.risk_score ?? 0);

  const theme =
    risk >= 70
      ? {
        label: "HIGH RISK",
        text: "text-red-400",
        border: "border-red-400/15",
        bg: "bg-red-400/[0.025]",
        icon: "🚨",
      }
      : risk >= 40
        ? {
          label: "SUSPICIOUS",
          text: "text-yellow-300",
          border: "border-yellow-400/15",
          bg: "bg-yellow-400/[0.025]",
          icon: "⚠",
        }
        : {
          label: "LOW RISK",
          text: "text-emerald-400",
          border: "border-emerald-400/15",
          bg: "bg-emerald-400/[0.025]",
          icon: "✓",
        };

  const createdAt = item?.created_at
    ? new Date(item.created_at).toLocaleString()
    : "Unknown time";

  return (
    <div
      className={`group flex w-full items-center justify-between gap-5 rounded-2xl border p-4 ${theme.border} ${theme.bg}`}
    >
      {/* Clickable history content */}
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-5 text-left"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
        >
          {theme.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[8px] font-black tracking-[0.2em] text-gray-700">
            ANALYZED MESSAGE
          </div>

          <div className="mt-1 truncate text-sm font-semibold text-gray-300">
            {item?.message || "No message available"}
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-[9px] font-bold tracking-wider text-gray-700">
            <span>{createdAt}</span>

            <span>
              {item?.suspicious_keywords?.length || 0} SIGNALS
            </span>

            <span>
              {item?.urls_detected?.length || 0} URLS
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className={`text-2xl font-black ${theme.text}`}>
              {risk}
            </div>

            <div className="text-[8px] font-bold tracking-wider text-gray-700">
              / 100
            </div>
          </div>

          <div
            className={`hidden rounded-full border px-3 py-1.5 text-[8px] font-black tracking-wider sm:block ${theme.border} ${theme.bg} ${theme.text}`}
          >
            {theme.label}
          </div>
        </div>
      </button>

      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
        aria-label="Delete analysis"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-400/10 bg-red-400/[0.025] text-red-400/60 transition hover:border-red-400/30 hover:bg-red-400/[0.08] hover:text-red-300"
      >
        🗑
      </button>

      {/* Arrow */}
      <div className="shrink-0 text-gray-700 transition group-hover:translate-x-1">
        →
      </div>
    </div>
  );
}

function HistoryDetail({ result, onClose }) {
  const risk = Number(result?.risk_score ?? 0);

  const theme =
    risk >= 70
      ? {
        label: "HIGH RISK",
        text: "text-red-400",
        border: "border-red-400/20",
        bg: "bg-red-400/[0.035]",
      }
      : risk >= 40
        ? {
          label: "SUSPICIOUS",
          text: "text-yellow-300",
          border: "border-yellow-400/20",
          bg: "bg-yellow-400/[0.035]",
        }
        : {
          label: "LOW RISK",
          text: "text-emerald-400",
          border: "border-emerald-400/20",
          bg: "bg-emerald-400/[0.035]",
        };

  return (
    <div className="mt-6 rounded-[30px] border border-white/[0.06] bg-[#080c12] p-7 sm:p-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="text-[10px] font-black tracking-[0.3em] text-emerald-400">
            STORED ANALYSIS
          </div>

          <h3 className="mt-2 text-2xl font-black">
            Historical Threat Assessment
          </h3>
        </div>

        <button
          onClick={onClose}
          className="w-fit rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-gray-500 transition hover:border-red-400/20 hover:text-red-300"
        >
          ✕ CLOSE
        </button>

      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">

        <div className={`rounded-2xl border ${theme.border} ${theme.bg} p-5`}>
          <div className="text-[8px] font-black tracking-[0.2em] text-gray-600">
            VERDICT
          </div>

          <div className={`mt-2 text-xl font-black ${theme.text}`}>
            {result?.verdict || "Unknown"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-[8px] font-black tracking-[0.2em] text-gray-600">
            THREAT SCORE
          </div>

          <div className="mt-2 text-xl font-black text-gray-200">
            {risk}/100
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="text-[8px] font-black tracking-[0.2em] text-gray-600">
            ANALYSIS ID
          </div>

          <div className="mt-2 truncate font-mono text-xs text-gray-500">
            {result?.id}
          </div>
        </div>

      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/20 p-6">

        <div className="text-[9px] font-black tracking-[0.2em] text-gray-700">
          ORIGINAL MESSAGE
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-400">
          {result?.message}
        </p>

      </div>

      {Array.isArray(result?.suspicious_keywords) &&
        result.suspicious_keywords.length > 0 && (
          <div className="mt-5">

            <div className="mb-3 text-[9px] font-black tracking-[0.2em] text-gray-700">
              THREAT SIGNALS
            </div>

            <div className="flex flex-wrap gap-2">

              {result.suspicious_keywords.map(
                (keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                    className="rounded-full border border-red-400/10 bg-red-400/[0.035] px-3 py-2 text-[9px] font-bold text-red-300"
                  >
                    ⚠ {keyword}
                  </span>
                )
              )}

            </div>

          </div>
        )}

      {Array.isArray(result?.reasons) &&
        result.reasons.length > 0 && (
          <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">

            <div className="text-[9px] font-black tracking-[0.2em] text-gray-700">
              DETECTION REASONS
            </div>

            <div className="mt-4 space-y-2">

              {result.reasons.map(
                (reason, index) => (
                  <div
                    key={`${reason}-${index}`}
                    className="text-sm leading-6 text-gray-500"
                  >
                    <span className="mr-3 text-emerald-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {reason}
                  </div>
                )
              )}

            </div>

          </div>
        )}

      {result?.gemini_analysis && (
        <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.018] p-6">

          <div className="text-[9px] font-black tracking-[0.2em] text-cyan-400">
            AI SECURITY ANALYSIS
          </div>

          <div className="mt-4 text-xl font-black text-gray-200">
            {result.gemini_analysis.verdict || "Assessment"}
          </div>

          <p className="mt-4 text-sm leading-7 text-gray-400">
            {result.gemini_analysis.explanation ||
              "No AI explanation available."}
          </p>

          <div className="mt-5 text-xs font-bold text-cyan-300">
            AI CONFIDENCE:{" "}
            {Number(result.gemini_analysis.confidence ?? 0)}%
          </div>

        </div>
      )}

    </div>
  );
}

/* ============================================================
   RESULTS DASHBOARD
============================================================ */

function Results({ result, onReset }) {
  const risk = Number(result?.risk_score ?? 0);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const keywords = Array.isArray(result?.suspicious_keywords)
    ? result.suspicious_keywords
    : [];

  const urls = Array.isArray(result?.urls_detected)
    ? result.urls_detected
    : [];

  const reasons = Array.isArray(result?.reasons)
    ? result.reasons
    : [];

  const gemini = result?.gemini_analysis;

  const handleCopyAnalysis = async () => {
    const analysisText = `
SCAMSHIELD SECURITY ANALYSIS

VERDICT: ${result?.verdict || "Unknown"}
THREAT SCORE: ${risk}/100

THREAT SIGNALS:
${keywords.length > 0
        ? keywords.map((keyword) => `• ${keyword}`).join("\n")
        : "• None detected"
      }

URLS DETECTED:
${urls.length > 0
        ? urls.join("\n")
        : "• No URLs detected"
      }

DETECTION REASONS:
${reasons.length > 0
        ? reasons.map((reason) => `• ${reason}`).join("\n")
        : "• None available"
      }

AI ASSESSMENT:
${gemini?.explanation || "No AI assessment available."}

AI CONFIDENCE:
${Number(gemini?.confidence ?? 0)}%

ANALYZED MESSAGE:
${result?.message || ""}
`.trim();

    try {
      await navigator.clipboard.writeText(analysisText);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleShareAnalysis = async () => {
    const shareText = `ScamShield Analysis: ${result?.verdict || "Unknown"} — Threat Score ${risk}/100`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "ScamShield Security Analysis",
          text: shareText,
        });

        setShared(true);

        setTimeout(() => {
          setShared(false);
        }, 2000);
      } else {
        await navigator.clipboard.writeText(shareText);

        setShared(true);

        setTimeout(() => {
          setShared(false);
        }, 2000);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF();

    const verdict = result?.verdict || "Unknown";
    const score = risk;
    const messageText = result?.message || "No message available.";

    const aiExplanation =
      gemini?.explanation || "No AI assessment available.";

    const aiConfidence = Number(gemini?.confidence ?? 0);

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("SCAMSHIELD", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("SECURITY THREAT ANALYSIS REPORT", 20, 27);

    // Divider
    doc.line(20, 32, 190, 32);

    // Verdict
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("VERDICT", 20, 45);

    doc.setFontSize(18);
    doc.text(verdict.toUpperCase(), 20, 55);

    // Threat score
    doc.setFontSize(11);
    doc.text("THREAT SCORE", 20, 70);

    doc.setFontSize(18);
    doc.text(`${score} / 100`, 20, 80);

    // Threat signals
    let y = 98;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("THREAT SIGNALS", 20, y);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    if (keywords.length > 0) {
      keywords.forEach((keyword) => {
        doc.text(`• ${keyword}`, 25, y);
        y += 6;
      });
    } else {
      doc.text("• No suspicious keywords detected", 25, y);
      y += 6;
    }

    // URL analysis
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("URL ANALYSIS", 20, y);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    if (urlAnalysis.length > 0) {
      urlAnalysis.forEach((item) => {
        const url = item?.url || "Unknown URL";
        const urlScore = Number(item?.score ?? 0);

        doc.text(`URL: ${url}`, 25, y);
        y += 6;

        doc.text(`Risk Score: ${urlScore}/100`, 25, y);
        y += 8;

        if (Array.isArray(item?.findings)) {
          item.findings.forEach((finding) => {
            const lines = doc.splitTextToSize(`• ${finding}`, 160);

            doc.text(lines, 30, y);

            y += lines.length * 5;
          });
        }

        y += 4;
      });
    } else {
      doc.text("No URLs detected.", 25, y);
      y += 8;
    }

    // AI Assessment
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("AI SECURITY ASSESSMENT", 20, y);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const explanationLines = doc.splitTextToSize(
      aiExplanation,
      165
    );

    doc.text(explanationLines, 25, y);

    y += explanationLines.length * 5 + 8;

    doc.setFont("helvetica", "bold");
    doc.text(`AI CONFIDENCE: ${aiConfidence}%`, 25, y);

    // Recommendation
    y += 15;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("RECOMMENDATION", 20, y);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const recommendation =
      score >= 70
        ? "Do not click suspicious links or provide passwords, OTPs, or other sensitive information."
        : score >= 40
          ? "Exercise caution and verify the sender through an official channel before taking action."
          : "No major threat indicators were detected. Continue to remain cautious with unexpected messages.";

    const recommendationLines = doc.splitTextToSize(
      recommendation,
      165
    );

    doc.text(recommendationLines, 25, y);

    // Original message
    y += recommendationLines.length * 5 + 15;

    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("ANALYZED MESSAGE", 20, y);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const messageLines = doc.splitTextToSize(
      messageText,
      165
    );

    doc.text(messageLines, 25, y);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setFontSize(8);
      doc.setTextColor(120);

      doc.text(
        `ScamShield Security Report • Page ${i} of ${pageCount}`,
        20,
        285
      );

      doc.setTextColor(0);
    }

    // Download
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-");

    doc.save(`ScamShield-Report-${timestamp}.pdf`);
  };

  const urlAnalysis = Array.isArray(result?.url_analysis)
    ? result.url_analysis
    : [];

  let theme = {
    label: "LOW RISK",
    icon: "✓",
    text: "text-emerald-400",
    stroke: "stroke-emerald-400",
    border: "border-emerald-400/20",
    bg: "bg-emerald-400/[0.035]",
    glow: "shadow-emerald-500/10",
    soft: "bg-emerald-400/10",
    bar: "bg-emerald-400",
    description:
      "No major indicators of malicious or deceptive behavior were detected.",
  };

  if (risk >= 70) {
    theme = {
      label: "HIGH RISK",
      icon: "🚨",
      text: "text-red-400",
      stroke: "stroke-red-400",
      border: "border-red-400/20",
      bg: "bg-red-400/[0.035]",
      glow: "shadow-red-500/10",
      soft: "bg-red-400/10",
      bar: "bg-red-400",
      description:
        "Multiple indicators strongly suggest phishing, fraud, or social-engineering activity.",
    };
  } else if (risk >= 40) {
    theme = {
      label: "SUSPICIOUS",
      icon: "⚠",
      text: "text-yellow-300",
      stroke: "stroke-yellow-300",
      border: "border-yellow-400/20",
      bg: "bg-yellow-400/[0.035]",
      glow: "shadow-yellow-500/10",
      soft: "bg-yellow-400/10",
      bar: "bg-yellow-400",
      description:
        "Several suspicious signals were detected. Exercise caution before interacting.",
    };
  }

  return (
    <section className="result-reveal mx-auto mt-16 max-w-6xl text-left">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-emerald-400">
            <span className="security-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ANALYSIS COMPLETE
          </div>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Threat Assessment
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            ScamShield analyzed the submitted content across multiple
            detection layers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyAnalysis}
            aria-label="Copy security analysis"
            className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-bold text-gray-500 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03] hover:text-cyan-300"
          >
            <span className="mr-2">
              {copied ? "✓" : "⧉"}
            </span>

            {copied ? "COPIED" : "COPY ANALYSIS"}
          </button>

          <button
            onClick={handleShareAnalysis}
            aria-label="Share security analysis"
            className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-bold text-gray-500 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03] hover:text-cyan-300"
          >
            <span className="mr-2">
              {shared ? "✓" : "↗"}
            </span>

            {shared ? "SHARED" : "SHARE"}
          </button>

          <button
            onClick={handleGenerateReport}
            aria-label="Generate security report"
            className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-bold text-gray-500 transition hover:border-red-400/20 hover:bg-red-400/[0.03] hover:text-red-300"
          >
            <span className="mr-2">
              📄
            </span>
            SECURITY REPORT
          </button>

          <button
            onClick={onReset}
            aria-label="Analyze another message"
            className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-bold text-gray-500 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.03] hover:text-white"
          >
            <span className="mr-2 inline-block transition group-hover:rotate-180">
              ↻
            </span>

            ANALYZE ANOTHER
          </button>
        </div>
      </div>

      {/* ==================================================
          RISK OVERVIEW
      ================================================== */}

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* Risk score */}

        <div
          className={`security-card relative overflow-hidden rounded-[30px] border ${theme.border} ${theme.bg} p-8 shadow-2xl ${theme.glow} ${risk >= 70 ? "threat-alert" : ""
            }`}
        >
          <div
            className={`absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full ${theme.soft} blur-[90px]`}
          />

          <div className="absolute left-1/2 top-[46%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025]" />

          <div className="absolute left-1/2 top-[46%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025]" />

          <div className="relative text-center">
            <div className="text-[10px] font-black tracking-[0.35em] text-gray-600">
              THREAT SCORE
            </div>

            <div className="mt-6 flex justify-center">
              <ThreatGauge risk={risk} theme={theme} />
            </div>

            <div
              className={`mx-auto mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[10px] font-black tracking-[0.18em] ${theme.border} ${theme.soft} ${theme.text}`}
            >
              <span>{theme.icon}</span>
              {theme.label}
            </div>

            <p className="mx-auto mt-6 max-w-xs text-xs leading-6 text-gray-600">
              {theme.description}
            </p>
          </div>
        </div>

        {/* Intelligence summary */}

        <div className="security-card rounded-[30px] border border-white/[0.06] bg-white/[0.025] p-7 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="text-[10px] font-black tracking-[0.28em] text-gray-600">
                THREAT INTELLIGENCE
              </div>

              <h3 className="mt-2 text-xl font-black">
                Detection Overview
              </h3>
            </div>

            <div
              className={`hidden rounded-full border px-3 py-1.5 text-[9px] font-black tracking-wider sm:block ${theme.border} ${theme.soft} ${theme.text}`}
            >
              {theme.label}
            </div>
          </div>

          {/* Progress */}

          <div className="mt-8">
            <div className="mb-3 flex justify-between text-[10px] font-bold tracking-wider text-gray-600">
              <span>OVERALL THREAT LEVEL</span>

              <span className={theme.text}>{risk}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className={`risk-bar h-full rounded-full ${theme.bar}`}
                style={{
                  width: `${Math.min(Math.max(risk, 0), 100)}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[8px] font-bold tracking-wider text-gray-700">
              <span>SAFE</span>
              <span>CAUTION</span>
              <span>CRITICAL</span>
            </div>
          </div>

          {/* Stats */}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <TelemetryCard
              value={keywords.length}
              label="THREAT SIGNALS"
              icon="⚠"
            />

            <TelemetryCard
              value={urls.length}
              label="URLS DETECTED"
              icon="⌁"
            />

            <TelemetryCard
              value={reasons.length}
              label="DETECTION REASONS"
              icon="◈"
            />
          </div>
        </div>
      </div>

      {/* ==================================================
          THREAT INDICATORS
      ================================================== */}

      <DashboardCard
        className="mt-5"
        label="THREAT INDICATORS"
        icon="⚠"
        accent="red"
      >
        {keywords.length > 0 ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {keywords.map((keyword, index) => (
              <div
                key={`${keyword}-${index}`}
                className="stagger-item security-card group relative overflow-hidden rounded-2xl border border-red-400/10 bg-red-400/[0.025] p-4"
              >
                <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-red-400/[0.04] blur-2xl" />

                <div className="relative flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-sm text-red-400">
                    ⚠
                  </div>

                  <div className="min-w-0">
                    <div className="text-[8px] font-black tracking-[0.18em] text-gray-600">
                      SUSPICIOUS SIGNAL
                    </div>

                    <div className="mt-1 truncate text-sm font-bold text-gray-200">
                      {keyword}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-5 text-sm text-emerald-300">
            ✓ No obvious suspicious keyword signals were detected.
          </div>
        )}
      </DashboardCard>

      {/* ==================================================
          AI SECURITY ANALYSIS
      ================================================== */}

      {gemini && (
        <DashboardCard
          className="mt-5 result-reveal"
          label="AI SECURITY ANALYSIS"
          icon="✦"
          accent="cyan"
        >
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_220px]">
            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.018] p-6">
              <div className="text-[9px] font-black tracking-[0.25em] text-gray-600">
                AI ASSESSMENT
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-black">
                  {gemini.verdict || "Assessment"}
                </h3>

                <span className="rounded-full border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-1 text-[9px] font-black tracking-wider text-cyan-300">
                  AI ANALYSIS
                </span>
              </div>

              <p className="mt-5 text-sm leading-7 text-gray-400">
                {gemini.explanation || "No AI explanation was provided."}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.018] p-6 text-center">
              <div className="text-[9px] font-black tracking-[0.25em] text-gray-600">
                AI CONFIDENCE
              </div>

              <div className="mt-3 text-5xl font-black text-cyan-300">
                {Number(gemini.confidence ?? 0)}%
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      Math.max(Number(gemini.confidence ?? 0), 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-3 text-[8px] font-bold tracking-wider text-gray-700">
                MODEL CONFIDENCE
              </div>
            </div>
          </div>

          {Array.isArray(gemini.indicators) &&
            gemini.indicators.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 text-[9px] font-black tracking-[0.22em] text-gray-600">
                  AI-DETECTED INDICATORS
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {gemini.indicators.map((indicator, index) => (
                    <div
                      key={`${indicator}-${index}`}
                      className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.02] p-4 text-sm leading-6 text-gray-400 transition hover:border-cyan-400/20 hover:text-gray-300"
                    >
                      <span className="mr-2 text-cyan-400">✦</span>

                      {indicator}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </DashboardCard>
      )}

      {/* ==================================================
          URL INTELLIGENCE
      ================================================== */}

      {urlAnalysis.length > 0 && (
        <DashboardCard
          className="mt-5 result-reveal"
          label="URL INTELLIGENCE"
          icon="⌁"
          accent="yellow"
        >
          <div className="mt-6 space-y-4">
            {urlAnalysis.map((item, index) => {
              const urlScore = Number(item?.score ?? 0);

              const urlTheme =
                urlScore >= 70
                  ? {
                    text: "text-red-400",
                    bg: "bg-red-400/10",
                    border: "border-red-400/15",
                    bar: "bg-red-400",
                  }
                  : urlScore >= 40
                    ? {
                      text: "text-yellow-300",
                      bg: "bg-yellow-400/10",
                      border: "border-yellow-400/15",
                      bar: "bg-yellow-400",
                    }
                    : {
                      text: "text-emerald-400",
                      bg: "bg-emerald-400/10",
                      border: "border-emerald-400/15",
                      bar: "bg-emerald-400",
                    };

              return (
                <div
                  key={`${item?.url || "url"}-${index}`}
                  className="stagger-item security-card rounded-2xl border border-white/[0.05] bg-black/10 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 text-[8px] font-black tracking-[0.2em] text-gray-700">
                        DETECTED URL
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-300">
                          ⌁
                        </div>

                        <div className="min-w-0">
                          <div className="mb-1 text-[8px] font-black tracking-[0.2em] text-gray-700">
                            ANALYZED LINK
                          </div>

                          <div className="break-all font-mono text-sm leading-6 text-gray-300">
                            {item?.url || "Unknown URL"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-fit shrink-0 rounded-full border px-4 py-2 text-[9px] font-black tracking-wider ${urlTheme.border} ${urlTheme.bg} ${urlTheme.text}`}
                    >
                      RISK {urlScore}/100
                    </div>
                  </div>

                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className={`h-full rounded-full ${urlTheme.bar}`}
                      style={{
                        width: `${Math.min(Math.max(urlScore, 0), 100)}%`,
                      }}
                    />
                  </div>

                  {Array.isArray(item?.findings) && item.findings.length > 0 && (
                    <details className="mt-5 group">
                      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition hover:border-yellow-400/15 hover:bg-yellow-400/[0.02]">
                        <span className="text-[9px] font-black tracking-[0.2em] text-gray-500">
                          URL FINDINGS ({item.findings.length})
                        </span>

                        <span className="text-xs text-gray-600 transition-transform duration-300 group-open:rotate-180">
                          ↓
                        </span>
                      </summary>

                      <div className="mt-3 grid gap-2">
                        {item.findings.map((finding, findingIndex) => (
                          <div
                            key={`${finding}-${findingIndex}`}
                            className="stagger-item rounded-xl border border-red-400/10 bg-red-400/[0.035] px-4 py-3 text-[10px] leading-5 text-red-300"
                          >
                            <span className="mr-2 text-red-400">⚠</span>
                            {finding}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {/* ==================================================
          DETECTION REASONS
      ================================================== */}

      {reasons.length > 0 && (
        <DashboardCard
          className="mt-5 result-reveal"
          label="DETECTION REASONS"
          icon="◈"
          accent="emerald"
        >
          <details className="mt-5 group">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-4 transition hover:border-emerald-400/15 hover:bg-emerald-400/[0.02]">
              <div>
                <div className="text-[9px] font-black tracking-[0.2em] text-gray-500">
                  DETECTION SIGNALS
                </div>

                <div className="mt-1 text-xs text-gray-700">
                  {reasons.length} reasons detected
                </div>
              </div>

              <span className="text-xs text-gray-600 transition-transform duration-300 group-open:rotate-180">
                ↓
              </span>
            </summary>

            <div className="mt-3 space-y-1">
              {reasons.map((reason, index) => (
                <div
                  key={`${reason}-${index}`}
                  className="stagger-item group flex items-start gap-4 rounded-xl px-4 py-3 transition hover:bg-white/[0.025]"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.06] text-[10px] text-emerald-400">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="text-sm leading-6 text-gray-500 transition group-hover:text-gray-300">
                    {reason}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </DashboardCard>
      )}

      {/* ==================================================
          ANALYZED MESSAGE
      ================================================== */}

      <DashboardCard
        className="mt-5"
        label="ANALYZED MESSAGE"
        icon="◉"
        accent="emerald"
      >
        <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[9px] font-black tracking-[0.2em] text-gray-700">
              ORIGINAL INPUT
            </span>

            <span className="text-[9px] font-bold text-gray-700">
              {result?.message?.length || 0} CHARACTERS
            </span>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-7 text-gray-400">
            {result?.message || "No message returned by the analysis engine."}
          </p>
        </div>
      </DashboardCard>

      {/* ==================================================
          FINAL ACTION
      ================================================== */}

      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[28px] border border-white/[0.06] bg-white/[0.018] p-6 sm:flex-row">
        <div>
          <div className="text-xs font-bold text-gray-300">
            Think this assessment is wrong?
          </div>

          <div className="mt-1 text-[10px] leading-5 text-gray-700">
            ScamShield provides automated analysis and should be used as a
            security aid, not a guarantee.
          </div>
        </div>

        <button
          onClick={onReset}
          className="button-shine rounded-xl bg-emerald-400 px-6 py-3 text-xs font-black text-black transition hover:bg-emerald-300"
        >
          ANALYZE ANOTHER MESSAGE
        </button>
      </div>
      <button
        onClick={onReset}
        aria-label="Scan another message"
        className="scan-floating-button fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-[#07100d]/90 px-5 py-3 text-xs font-black tracking-wider text-emerald-300 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-[#0a1712] sm:bottom-8 sm:right-8"
      >
        <span className="text-sm">+</span>
        SCAN ANOTHER
      </button>
    </section>
  );
}

function AnimatedNumber({ value, duration = 1200 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const startTime = performance.now();

    let animationFrame;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(target * easedProgress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{displayValue}</>;
}

function ThreatGauge({ risk, theme }) {
  const circumference = 2 * Math.PI * 52;
  const safeRisk = Math.min(Math.max(Number(risk) || 0, 0), 100);

  const offset = circumference - (safeRisk / 100) * circumference;

  return (
    <div className="relative h-52 w-52">
      {/* Outer glow */}
      <div
        className={`absolute inset-3 rounded-full ${theme.soft} blur-2xl opacity-40`}
      />

      {/* Gauge */}
      <svg
        className="relative h-full w-full -rotate-90"
        viewBox="0 0 120 120"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />

        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          className={theme.text}
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className={`risk-number text-7xl font-black tracking-tighter ${theme.text}`}
        >
          <AnimatedNumber value={safeRisk} />
        </div>

        <div className="mt-1 text-[8px] font-bold tracking-[0.25em] text-gray-600">
          / 100
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD CARD
============================================================ */

function DashboardCard({
  children,
  label,
  icon,
  accent = "emerald",
  className = "",
}) {
  const colors = {
    emerald: "text-emerald-400",
    red: "text-red-400",
    yellow: "text-yellow-300",
    cyan: "text-cyan-400",
  };

  return (
    <div
      className={`security-card rounded-[30px] border border-white/[0.06] bg-white/[0.025] p-7 sm:p-8 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className={colors[accent]}>{icon}</span>

        <span
          className={`text-[10px] font-black tracking-[0.28em] ${colors[accent]}`}
        >
          {label}
        </span>
      </div>

      {children}
    </div>
  );
}

/* ============================================================
   TELEMETRY CARD
============================================================ */

function TelemetryCard({ value, label, icon }) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-black/10 p-4 transition hover:border-emerald-400/10 hover:bg-emerald-400/[0.015]">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-700">{icon}</span>

        <span className="text-[8px] font-bold tracking-wider text-gray-700">
          LIVE
        </span>
      </div>

      <div className="mt-3 text-2xl font-black text-gray-200">
        {value}
      </div>

      <div className="mt-1 text-[8px] font-black tracking-[0.15em] text-gray-700">
        {label}
      </div>
    </div>
  );
}

/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({ icon, title, description }) {
  return (
    <div className="security-card group relative overflow-hidden rounded-[26px] border border-white/[0.06] bg-white/[0.025] p-7">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-400/[0.025] blur-3xl transition group-hover:bg-emerald-400/[0.06]" />

      <div className="relative">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/5 text-xl text-emerald-400">
          {icon}
        </div>

        <h3 className="text-lg font-bold">{title}</h3>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   STEP
============================================================ */

function Step({ number, title, text }) {
  return (
    <div className="security-card flex items-start gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.018] p-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] text-[9px] font-black tracking-widest text-emerald-400">
        {number}
      </div>

      <div>
        <h3 className="font-bold">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-gray-600">
          {text}
        </p>
      </div>
    </div>
  );
}