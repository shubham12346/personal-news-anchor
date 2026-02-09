"use client";

import { Broadcast } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";

export default function Listen() {
    const [audioUrl, setAudioUrl] = useState("");
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingBroadcasts, setIsLoadingBroadcasts] = useState(false);
    const [error, setError] = useState("");
    const [selectedBroadcastId, setSelectedBroadcastId] = useState("");
    const [selectedAudioUrl, setSelectedAudioUrl] = useState("");
    const [articles, setArticles] = useState<
        Array<{ title: string; source: string | null; url?: string | null }>
    >([]);
    const [isLoadingArticles, setIsLoadingArticles] = useState(false);
    const [articlesError, setArticlesError] = useState("");

    const email = useMemo(() => {
        if (typeof window === "undefined") return "";
        return sessionStorage.getItem("email") ?? "";
    }, []);
    const dateFormatter = useMemo(
        () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
        []
    );

    const generate = async () => {
        if (!email) return;
        setError("");
        setIsGenerating(true);
        try {
            const interests = sessionStorage.getItem("interests")?.split(",");
            const userId = sessionStorage.getItem("userId");
            console.log(interests);
            if (!interests) {
                throw new Error("Interests are required.");
            }
            const res = await fetch("/api/news-room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ interests, userId }),
            });
            if (!res.ok) {
                throw new Error("Failed to generate audio.");
            }
            const data = await res.json();
            setAudioUrl(data.audioUrl ?? "");
            setBroadcasts([...broadcasts, data]);
            fetchBroadcasts();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsGenerating(false);
        }
    };
    const fetchBroadcasts = async () => {

        setIsLoadingBroadcasts(true);
        try {
            const res = await fetch(`/broadcast?email=${encodeURIComponent(email)}`);
            if (!res.ok) {
                throw new Error("Failed to load broadcasts.");
            }
            const data = await res.json();
            setBroadcasts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoadingBroadcasts(false);
        }
    };

    const fetchArticles = async () => {
        if (typeof window === "undefined") return;
        setIsLoadingArticles(true);
        setArticlesError("");
        try {
            const interests = sessionStorage
                .getItem("interests")
                ?.split(",")
                .map((item) => item.trim())
                .filter(Boolean);
            if (!interests || interests.length === 0) {
                setArticles([]);
                return;
            }
            const res = await fetch("/api/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: interests.join(", ") }),
            });
            if (!res.ok) {
                throw new Error("Failed to load articles.");
            }
            const data = await res.json();
            setArticles(Array.isArray(data.sources) ? data.sources : []);
        } catch (err) {
            setArticlesError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoadingArticles(false);
        }
    };
    useEffect(() => {
        if (!email) return;
        
        fetchBroadcasts();
        fetchArticles();
    }, [email]);

    const handleSelectBroadcast = (broadcast: Broadcast) => {
        setSelectedBroadcastId(broadcast.id);
        setSelectedAudioUrl(broadcast.audioUrl ?? "");
    };
    
    
    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-100">
            <div className="w-full px-6 py-12 lg:px-10">
                <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="w-full lg:w-1/5 overflow-y-auto h-screen">
                        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                    Articles
                                </h2>
                                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                    {articles.length}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                Stories matched to your interests.
                            </p>
                            <div className="mt-4 flex flex-col gap-3">
                                {!email && (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Set your email to load articles.
                                    </p>
                                )}
                                {articlesError && (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {articlesError}
                                    </p>
                                )}
                                {isLoadingArticles && (
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Loading articles...
                                    </p>
                                )}
                                {!isLoadingArticles && articles.length === 0 && email && !articlesError && (
                                    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                                        No articles found for your interests yet.
                                    </div>
                                )}
                                {articles.map((article) => (
                                    <div
                                        key={`${article.title}-${article.source ?? "source"}`}
                                        className="rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                                    >
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            {article.title}
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                            <span>{article.source ?? "Unknown source"}</span>
                                            {article.url && (
                                                <a
                                                    href={article.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
                                                >
                                                    Official site
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                    <div className="flex w-full flex-col gap-8 lg:w-4/5">
                        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
                            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                Listen
                            </h1>
                            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
                                Generate your latest audio briefing and play it back here.
                            </p>
                            {!email && (
                                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                                    Set your email first to generate a broadcast.
                                </p>
                            )}
                            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                                <button
                                    className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                                    onClick={generate}
                                    disabled={!email || isGenerating}
                                >
                                    {isGenerating ? "Generating..." : "Generate"}
                                </button>
                                <div className="flex flex-col gap-2">
                                    {error && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    )}
                                    {isLoadingBroadcasts && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Loading broadcasts...
                                        </p>
                                    )}
                                </div>
                            </div>
                            {audioUrl && (
                                <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                                    <audio src={audioUrl} controls className="w-full" />
                                </div>
                            )}
                        </div>
                        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                        Your broadcasts
                                    </h2>
                                    <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                                        Pick a broadcast from your history and play it instantly.
                                    </p>
                                </div>
                                <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                                    {broadcasts.length} total
                                </span>
                            </div>
                            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)]">
                                <div className="flex flex-col gap-4">
                                    {broadcasts.length === 0 && !isLoadingBroadcasts && (
                                        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-base text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
                                            No broadcasts yet. Generate one to see it here.
                                        </div>
                                    )}
                                    {broadcasts.map((broadcast) => {
                                        const createdAt = broadcast.createdAt
                                            ? dateFormatter.format(new Date(broadcast.createdAt))
                                            : "Unknown date";
                                        const isSelected = broadcast.id === selectedBroadcastId;
                                        return (
                                            <button
                                                key={broadcast.id}
                                                type="button"
                                                onClick={() => handleSelectBroadcast(broadcast)}
                                                className={`group flex w-full flex-col gap-3 rounded-2xl border px-5 py-4 text-left transition ${
                                                    isSelected
                                                        ? "border-zinc-900 bg-zinc-50 shadow-sm dark:border-zinc-200 dark:bg-zinc-900/50"
                                                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                                            Broadcast {createdAt}
                                                        </p>
                                                        <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                            {broadcast.script}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                            broadcast.audioUrl
                                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                                                                : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
                                                        }`}
                                                    >
                                                        {broadcast.audioUrl ? "Audio ready" : "No audio"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        {broadcast.userId}
                                                    </span>
                                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                        {isSelected ? "Selected" : "Select to play"}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex h-full flex-col gap-5 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                                    <div>
                                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                                            Now playing
                                        </h3>
                                        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                                            Select a broadcast to start listening.
                                        </p>
                                    </div>
                                    {selectedAudioUrl ? (
                                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                                            <audio src={selectedAudioUrl} controls className="w-full" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-6 text-center text-base text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
                                            <span className="font-medium">No broadcast selected</span>
                                            <span className="text-sm">
                                                Choose a broadcast from the list to play audio.
                                            </span>
                                        </div>
                                    )}
                                    {selectedBroadcastId && !selectedAudioUrl && (
                                        <p className="text-sm text-amber-600 dark:text-amber-300">
                                            This broadcast does not have audio attached yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );                                                                                                                      
}