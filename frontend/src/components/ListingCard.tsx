"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { useApp } from "@/lib/app-context";
import { currency } from "@/lib/format";
import StarRating from "./StarRating";

const FALLBACK = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

export default function ListingCard({ listing }: { listing: ListingCardType }) {
  const { wishlistIds, toggleWishlist, currentUser } = useApp();
  const [idx, setIdx] = useState(0);
  const images = listing.images.length ? listing.images : [{ id: 0, url: FALLBACK, position: 0 }];
  const isFav = wishlistIds.has(listing.id);

  const nav = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + dir + images.length) % images.length);
  };

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-100">
        <Image
          src={images[idx].url}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />

        {/* Favorite */}
        {currentUser && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(listing.id);
            }}
            className="absolute right-3 top-3 transition hover:scale-110"
            aria-label="Save"
          >
            <Heart
              size={24}
              className={isFav ? "fill-rausch text-rausch" : "fill-black/40 text-white"}
            />
          </button>
        )}

        {/* Carousel controls (hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => nav(e, -1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 opacity-0 shadow transition group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => nav(e, 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1 opacity-0 shadow transition group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    i === idx ? "bg-white" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-medium text-[#222]">
            {listing.city}, {listing.country}
          </h3>
          <StarRating rating={listing.avg_rating} count={listing.review_count} showCount={false} />
        </div>
        <p className="clamp-2 text-sm text-gray-500">{listing.title}</p>
        <p className="mt-1 text-sm">
          <span className="font-semibold">{currency(listing.price_per_night)}</span>
          <span className="text-gray-600"> night</span>
        </p>
      </div>
    </Link>
  );
}
