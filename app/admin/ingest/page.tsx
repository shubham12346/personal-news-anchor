"use client";

import { useState } from "react";

export default function IngestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function runIngest() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/ingest", { method: "POST" });
    const data = await res.json();

    setResult(data);
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 48,
        background:
          "radial-gradient(1200px 600px at 10% 10%, #1e1b4b 0%, #0f172a 55%, #020617 100%)",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          background: "#0b1120",
          border: "1px solid #1f2937",
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.45)",
          padding: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            aria-hidden
            style={{
              fontSize: 40,
              background: "#1e1b4b",
              borderRadius: 12,
              padding: "8px 14px",
            }}
          >
            🗞️
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: 32, letterSpacing: -0.5 }}>
              News Ingestion
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 18, color: "#94a3b8" }}>
              Fetch the latest sources, parse updates, and refresh the newsroom.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 28, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button
            onClick={runIngest}
            disabled={loading}
            style={{
              padding: "14px 22px",
              borderRadius: 12,
              border: "none",
              background: loading ? "#4338ca" : "#6366f1",
              color: "#f8fafc",
              fontSize: 18,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 12px 24px rgba(79, 70, 229, 0.35)",
              transition: "transform 150ms ease, box-shadow 150ms ease",
            }}
          >
            {loading ? "Ingesting..." : "Run Ingestion"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 18,
              color: loading ? "#e2e8f0" : "#94a3b8",
              padding: "10px 14px",
              borderRadius: 12,
              background: "#111827",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "2px solid #334155",
                borderTopColor: loading ? "#818cf8" : "#64748b",
                animation: loading ? "spin 1s linear infinite" : "none",
                display: "inline-block",
              }}
            />
            {loading ? "Processing sources and compiling results..." : "Ready to ingest"}
          </div>
        </div>

        {loading && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 10 }}>
              Live progress
            </div>
            <div
              style={{
                height: 12,
                borderRadius: 999,
                background: "#1f2937",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "60%",
                  background:
                    "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.6s ease infinite",
                }}
              />
            </div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 10 }}>
              Latest run
            </div>
            <pre
              style={{
                margin: 0,
                padding: 18,
                background: "#0b1220",
                color: "#cbd5f5",
                borderRadius: 16,
                fontSize: 15,
                lineHeight: 1.6,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
        `}
      </style>
    </div>
  );
}
