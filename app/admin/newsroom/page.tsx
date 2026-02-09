"use client";

import { useState } from "react";

export default function NewsroomPage() {
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runPipeline() {
    setLoading(true);
    setError("");
    setResult(null);

    if (!email.trim()) {
      setError("Email is required.");
      setLoading(false);
      return;
    }
    if (!interests.trim()) {
      setError("Interests are required.");
      setLoading(false);
      return;
    }

    try {
      const user = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ email }),
      }).then((res) => res.json());

      const res = await fetch("/api/news-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: interests
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          userId: user.id,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to run newsroom pipeline.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>🏛️ Newsroom Pipeline</h2>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
      />
      <input
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        placeholder="Interests (e.g. AI, finance, sports)"
        style={{ width: "100%", padding: 8 }}
      />

      <button onClick={runPipeline} disabled={loading}>
        Generate News
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result && (
        <pre style={{ marginTop: 20 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      {result?.audioUrl && (
        <div style={{ marginTop: 20 }}>
          <audio controls src={result.audioUrl} style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
}
