'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserAndPreferences = async (emailValue: string) => {
    const user = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({ email: emailValue }),
    }).then((r) => r.json());

    setUserId(user.id);

    const preference = await fetch(`/api/preference?userId=${user.id}`).then(
      (r) => r.json(),
    );

    if (preference?.interests) {
      const normalized = Array.isArray(preference.interests)
        ? preference.interests.join(", ")
        : String(preference.interests);
      setInterests(normalized);
    }
  };

  const login = async () => {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await fetchUserAndPreferences(email);

      setIsLoggedIn(true);
      sessionStorage.setItem("email", email);
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const router = useRouter();
  const [interests, setInterests] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    if (!storedEmail) {
      return;
    }

    setEmail(storedEmail);
    setIsLoggedIn(true);
    void fetchUserAndPreferences(storedEmail);
  }, []);

  const save = async () => {
    const resolvedUserId =
      userId ??
      (await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ email }),
      }).then((r) => r.json())).id;

    setUserId(resolvedUserId);

    await fetch("/api/preference", {
      method: "POST",
      body: JSON.stringify({
        userId: resolvedUserId,
        interests: interests
          .split(",")
          .map((interest) => interest.trim())
          .filter(Boolean),
      }),
    });
   sessionStorage.setItem("interests", interests);
   sessionStorage.setItem("userId", resolvedUserId);
    router.push(`/listen`);
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16">
        {!isLoggedIn ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to access your newsroom tools and personalized briefings.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
              />
              {error ? (
                <span className="text-xs text-red-600 dark:text-red-400">
                  {error}
                </span>
              ) : null}
              <button
                type="button"
                onClick={login}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              Your Interests
            </h2>
            <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
              Add topics separated by commas so we can personalize your briefings.
            </p>
            <div className="mt-6 flex flex-col gap-4">
              <input
                value={interests}
                placeholder="tech, finance, sports"
                onChange={(e) => setInterests(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-lg text-zinc-900 shadow-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-700"
              />
              <button
                type="button"
                onClick={save}
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-3 text-lg font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
