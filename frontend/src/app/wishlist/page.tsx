"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { api } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import ListingCard from "@/components/ListingCard";
import { Spinner } from "@/components/Spinner";

export default function WishlistPage() {
  const { currentUser, wishlistIds } = useApp();
  const [items, setItems] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload when identity or the set of favorited ids changes.
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    api.getWishlist(currentUser.id).then(setItems).finally(() => setLoading(false));
  }, [currentUser, wishlistIds.size]);

  if (!currentUser) return <p className="py-40 text-center text-gray-500">Select an account to view saved places.</p>;
  if (loading) return <Spinner className="py-40" />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-semibold">Saved</h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Heart size={48} className="text-gray-300" />
          <p className="text-lg font-medium">No saved stays yet</p>
          <p className="text-gray-500">Tap the heart on any listing to save it here.</p>
          <Link href="/" className="mt-2 rounded-lg bg-[#222] px-5 py-2.5 text-sm font-medium text-white">
            Explore stays
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
