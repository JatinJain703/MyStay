"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UserCircle, Check } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { useClickOutside } from "@/lib/useClickOutside";

// Person button — shows ONLY mock auth (switch account).
export default function UserMenu() {
  const { users, currentUser, switchUser } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-gray-200 p-0.5 transition hover:shadow-md"
      >
        {currentUser?.photo_url ? (
          <Image
            src={currentUser.photo_url}
            alt={currentUser.name}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <UserCircle size={32} className="text-gray-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-40 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-2xl">
          {currentUser && (
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-semibold">{currentUser.name}</p>
              <p className="text-xs capitalize text-gray-500">{currentUser.role}</p>
            </div>
          )}

          {/* Mock auth: switch identity only */}
          <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Switch Profile
          </p>
          <div className="max-h-64 overflow-y-auto">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => { switchUser(u.id); setOpen(false); }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition hover:bg-gray-50"
              >
                {u.photo_url && (
                  <Image src={u.photo_url} alt={u.name} width={28} height={28} className="rounded-full" />
                )}
                <span className="flex-1">
                  {u.name}
                  <span className="ml-1 text-xs capitalize text-gray-400">· {u.role}</span>
                </span>
                {currentUser?.id === u.id && <Check size={16} className="text-rausch" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
