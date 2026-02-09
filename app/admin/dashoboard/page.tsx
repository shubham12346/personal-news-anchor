"use client";
import Link from "next/link";
export default function Dashboard() {
    return (
        <div>
           <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Newsroom
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Review and manage newsroom content, approvals, and publishing
                workflows.
              </p>
              <Link
                href="/admin/newsroom"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Go to Newsroom
              </Link>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Search
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Explore saved stories and search across content for quick
                access.
              </p>
              <Link
                href="/admin/search"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Go to Search
              </Link>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Ingest
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Bring in new sources and ingest content for processing and
                review.
              </p>
              <Link
                href="/admin/ingest"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Go to Ingest
              </Link>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Preferences
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Add your interests and tailor the topics you care about.
              </p>
              <Link
                href="/admin/preferences"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Add Preferences
              </Link>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Daily Personalized News
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Catch up with a daily digest curated for your interests.
              </p>
              <Link
                href="/admin/daily-news"
                className="mt-4 inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                View Daily News
              </Link>
            </div>
          </div>
        </div>
    );
}