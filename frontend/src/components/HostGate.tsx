"use client";

import { useApp } from "@/lib/app-context";
import { Spinner } from "./Spinner";

// Guards host-only pages. Non-hosts get a one-click "become a host" prompt
// (the mocked role switch), keeping the guest-vs-host distinction explicit.
export default function HostGate({ children }: { children: React.ReactNode }) {
  const { currentUser, loading, becomeHost } = useApp();

  if (loading) return <Spinner className="py-40" />;

  if (!currentUser) {
    return <p className="py-40 text-center text-gray-500">Select an account from the menu to continue.</p>;
  }

  if (currentUser.role !== "host") {
    return (
      <div className="flex flex-col items-center gap-4 py-40 text-center">
        <h1 className="text-2xl font-semibold">List your space</h1>
        <p className="max-w-sm text-gray-500">
          You&apos;re signed in as a guest. Switch to host mode to create and manage listings.
        </p>
        <button
          onClick={becomeHost}
          className="rounded-xl bg-rausch px-6 py-3 font-semibold text-white transition hover:bg-rauschDark"
        >
          List your space
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
