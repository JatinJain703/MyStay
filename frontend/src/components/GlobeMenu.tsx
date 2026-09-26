"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { useClickOutside } from "@/lib/useClickOutside";

// Globe button — nav links + host actions.
export default function GlobeMenu() {
  const { currentUser, becomeHost } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useClickOutside(ref, () => setOpen(false));

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full p-2 transition hover:bg-gray-100"
        aria-label="Navigation menu"
      >
        <Globe size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-2xl">
          <Item onClick={() => go("/")}>Discover</Item>
          <Item onClick={() => go("/trips")}>Bookings</Item>
          <Item onClick={() => go("/wishlist")}>Saved</Item>

          <div className="my-1 border-t border-gray-100" />

          {currentUser?.role === "host" ? (
            <>
              <Item onClick={() => go("/host")}>My Properties</Item>
              <Item onClick={() => go("/host/listings/new")}>Add Property</Item>
            </>
          ) : (
            <Item
              onClick={() => {
                becomeHost();
                setOpen(false);
              }}
            >
              List Your Space
            </Item>
          )}
        </div>
      )}
    </div>
  );
}

function Item({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="block w-full px-4 py-2.5 text-left text-sm transition hover:bg-gray-50"
    >
      {children}
    </button>
  );
}
