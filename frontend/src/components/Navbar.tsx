"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import GlobeMenu from "./GlobeMenu";

function FiltersButton() {
  const sp = useSearchParams();
  const router = useRouter();

  const activeCount = ["min_price", "max_price", "room_type", "amenities", "property_type"].filter(
    (k) => sp.get(k),
  ).length;

  const open = () => {
    const q = new URLSearchParams(sp.toString());
    q.set("modal", "filters");
    router.push(`/?${q.toString()}`);
  };

  return (
    <button
      onClick={open}
      className="relative flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
      aria-label="Open filters"
    >
      <SlidersHorizontal size={15} />
      <span className="hidden sm:inline">Filters</span>
      {activeCount > 0 && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#222] text-[10px] font-bold text-white">
          {activeCount}
        </span>
      )}
    </button>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-nav">
      <div className="mx-auto flex max-w-7xl items-center px-6 py-3">

        {/* Left: Logo */}
        <div className="flex flex-1 justify-start">
          <Link href="/" className="flex items-center gap-2 text-rausch">
            <span className="hidden text-xl font-bold sm:inline">MyStay</span>
          </Link>
        </div>

        {/* Centre: Search + Filters */}
        <div className="hidden items-center gap-2 md:flex">
          <Suspense fallback={<div className="h-14 w-80 rounded-full border border-gray-200" />}>
            <SearchBar />
          </Suspense>
          <Suspense fallback={null}>
            <FiltersButton />
          </Suspense>
        </div>

        {/* Right: Globe + User */}
        <div className="flex flex-1 items-center justify-end gap-1">
          <GlobeMenu />
          <UserMenu />
        </div>
      </div>

      {/* Mobile: keep search + filters in same row below */}
      <div className="flex items-center gap-2 px-6 pb-3 md:hidden">
        <Suspense fallback={<div className="h-12 flex-1 rounded-full border border-gray-200" />}>
          <SearchBar />
        </Suspense>
        <Suspense fallback={null}>
          <FiltersButton />
        </Suspense>
      </div>
    </header>
  );
}
