"use client";
import { useState } from "react";

export default function Dashboard() {
    const [email, setEmail] = useState("");
    const [interests, setInterests] = useState("");
    const [broadcastId, setBroadcastId] = useState("");
    const [script, setScript] = useState("");
    const [audioUrl, setAudioUrl] = useState("");

    const generateNews = async () => {
        const user = await fetch("/api/user", {
            method: "POST",
            body: JSON.stringify({ email }),
        }).then((r) => r.json());

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

        setScript(data.final ?? "");
        setBroadcastId(data.broadcastId ?? "");
        setAudioUrl(data.audioUrl ?? "");
    };

    const generateAudio = async () => {
        const res = await fetch("/api/tts", {
          method: "POST",
          body: JSON.stringify({ broadcastId }),
        });
    
        const data = await res.json();
        setAudioUrl(data.audioUrl);
    };

    
    return (
        <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                <header className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Personal News Dashboard
                    </h1>
                    <p className="text-sm text-slate-400">
                        Generate a custom broadcast script and audio preview.
                    </p>
                </header>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/20">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Email
                    </label>
                    <input
                        placeholder="you@example.com"
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Interests
                    </label>
                    <input
                        placeholder="tech, finance, sports"
                        onChange={(e) => setInterests(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            onClick={generateNews}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                        >
                            Generate News
                        </button>

                        {broadcastId && (
                            <button
                                onClick={generateAudio}
                                className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500/60"
                            >
                                Generate Audio
                            </button>
                        )}
                    </div>
                </div>

                <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                        Script Output
                    </h2>
                    <pre className="max-h-80 overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200">
                        {script || "Generate the news to see the script here."}
                    </pre>
                </section>

                {audioUrl && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                            Audio Preview
                        </h2>
                        <audio
                            controls
                            src={audioUrl}
                            className="mt-4 w-full"
                        ></audio>
                    </div>
                )}
            </div>
        </div>
    );
}