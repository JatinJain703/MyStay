"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Users, BedDouble, Bath, DoorOpen, Share, Heart } from "lucide-react";
import type { ListingDetail } from "@/lib/types";
import { api } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { memberSince } from "@/lib/format";
import Gallery from "@/components/Gallery";
import BookingWidget from "@/components/BookingWidget";
import ReviewsSection from "@/components/ReviewsSection";
import StaticMap from "@/components/StaticMap";
import { AmenityIcon } from "@/components/amenityIcons";
import { Spinner } from "@/components/Spinner";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { wishlistIds, toggleWishlist, currentUser } = useApp();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .getListing(Number(id))
      .then(setListing)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-3 py-40">
        <p className="text-xl font-medium">Listing not found</p>
        <button onClick={() => router.push("/")} className="text-rausch underline">
          Back to explore
        </button>
      </div>
    );
  }

  if (!listing) return <Spinner className="py-40" />;

  const isFav = wishlistIds.has(listing.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <div className="flex items-center gap-4 text-sm">
          <button className="flex items-center gap-1.5 underline">
            <Share size={16} /> Share
          </button>
          {currentUser && (
            <button
              onClick={() => toggleWishlist(listing.id)}
              className="flex items-center gap-1.5 underline"
            >
              <Heart size={16} className={isFav ? "fill-rausch text-rausch" : ""} />
              {isFav ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-700">
        {listing.avg_rating > 0 && (
          <>
            <Star size={14} className="fill-current" />
            <span className="font-medium">{listing.avg_rating.toFixed(2)}</span>
            <span>· {listing.review_count} reviews ·</span>
          </>
        )}
        <span className="font-medium underline">
          {listing.city}, {listing.country}
        </span>
      </div>

      <Gallery images={listing.images} title={listing.title} />

      {/* Body */}
      <div className="grid grid-cols-1 gap-12 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Overview + host */}
          <div className="flex items-start justify-between border-b border-gray-200 pb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {listing.room_type} in {listing.city}, hosted by {listing.host.name}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-gray-600">
                <span className="inline-flex items-center gap-1"><Users size={16} /> {listing.max_guests} guests</span>·
                <span className="inline-flex items-center gap-1"><DoorOpen size={16} /> {listing.bedrooms} bedrooms</span>·
                <span className="inline-flex items-center gap-1"><BedDouble size={16} /> {listing.beds} beds</span>·
                <span className="inline-flex items-center gap-1"><Bath size={16} /> {listing.bathrooms} baths</span>
              </p>
              {listing.host.is_superhost && (
                <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                  ⭐ Superhost
                </span>
              )}
            </div>
            {listing.host.photo_url && (
              <div className="text-center">
                <Image
                  src={listing.host.photo_url}
                  alt={listing.host.name}
                  width={56}
                  height={56}
                  className="rounded-full"
                />
                <p className="mt-1 text-xs text-gray-500">Since {memberSince(listing.host.created_at)}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="border-b border-gray-200 py-6">
            <p className="whitespace-pre-line leading-relaxed text-gray-800">{listing.description}</p>
          </div>

          {/* Amenities */}
          <div className="border-b border-gray-200 py-6">
            <h2 className="mb-4 text-xl font-semibold">What this place offers</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {listing.amenities.map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <AmenityIcon icon={a.icon} />
                  <span className="text-gray-800">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking widget */}
        <div className="lg:col-span-1">
          <BookingWidget listing={listing} />
        </div>
      </div>

      <StaticMap lat={listing.latitude} lng={listing.longitude} label={listing.address || `${listing.city}, ${listing.country}`} />

      {/* Host details */}
      <div className="border-b border-gray-200 py-8">
        <h2 className="mb-5 text-xl font-semibold">About your host</h2>
        <div className="flex items-start gap-6">
          {listing.host.photo_url && (
            <div className="shrink-0 text-center">
              <Image
                src={listing.host.photo_url}
                alt={listing.host.name}
                width={72}
                height={72}
                className="rounded-full"
              />
              {listing.host.is_superhost && (
                <p className="mt-1.5 text-xs font-semibold text-gray-600">Superhost</p>
              )}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold">{listing.host.name}</p>
            <p className="text-sm text-gray-500">Member since {memberSince(listing.host.created_at)}</p>
            {listing.host.is_superhost && (
              <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                ⭐ Superhost
              </span>
            )}
            {listing.host.bio && (
              <p className="mt-3 leading-relaxed text-gray-700">{listing.host.bio}</p>
            )}
          </div>
        </div>
      </div>

      <ReviewsSection listingId={listing.id} initialReviews={listing.reviews} avgRating={listing.avg_rating} />

    </div>
  );
}
