"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { MapPin, Calendar } from "lucide-react";
import type { BookingWithListing } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { currencyPrecise, formatDateRange } from "@/lib/format";
import { Spinner } from "@/components/Spinner";

function TripsInner() {
  const { currentUser } = useApp();
  const params = useSearchParams();
  const highlight = Number(params.get("highlight"));
  const [trips, setTrips] = useState<BookingWithListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!currentUser) return;
    setLoading(true);
    api.myTrips(currentUser.id).then(setTrips).finally(() => setLoading(false));
  };

  useEffect(load, [currentUser]);

  const cancel = async (id: number) => {
    try {
      await api.cancelBooking(id);
      toast.success("Booking cancelled");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not cancel");
    }
  };

  if (!currentUser) return <p className="py-40 text-center text-gray-500">Select an account to view your bookings.</p>;
  if (loading) return <Spinner className="py-40" />;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = trips.filter((t) => t.status === "confirmed" && t.check_out >= today);
  const past = trips.filter((t) => !(t.status === "confirmed" && t.check_out >= today));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-semibold">Bookings</h1>

      {trips.length === 0 && (
        <div className="rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-lg font-medium">No bookings yet — time to plan your next adventure!</p>
          <p className="mt-1 text-gray-500">Time to dust off your bags and start planning.</p>
          <Link href="/" className="mt-4 inline-block rounded-lg bg-[#222] px-5 py-2.5 text-sm font-medium text-white">
            Start searching
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <Section title="Upcoming">
          {upcoming.map((t) => (
            <TripCard key={t.id} trip={t} highlight={t.id === highlight} onCancel={cancel} />
          ))}
        </Section>
      )}
      {past.length > 0 && (
        <Section title="Where you've been">
          {past.map((t) => (
            <TripCard key={t.id} trip={t} highlight={t.id === highlight} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TripCard({
  trip,
  highlight,
  onCancel,
}: {
  trip: BookingWithListing;
  highlight: boolean;
  onCancel?: (id: number) => void;
}) {
  const img = trip.listing.images[0]?.url;
  const statusColor =
    trip.status === "confirmed" ? "bg-green-100 text-green-700"
    : trip.status === "cancelled" ? "bg-red-100 text-red-600"
    : "bg-gray-100 text-gray-600";

  return (
    <div
      className={`flex gap-4 overflow-hidden rounded-2xl border p-4 transition ${
        highlight ? "border-rausch ring-2 ring-rausch/30" : "border-gray-200"
      }`}
    >
      <Link href={`/listings/${trip.listing.id}`} className="relative h-32 w-44 shrink-0 overflow-hidden rounded-xl">
        {img && <Image src={img} alt={trip.listing.title} fill className="object-cover" />}
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/listings/${trip.listing.id}`} className="font-semibold hover:underline">
              {trip.listing.title}
            </Link>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={14} /> {trip.listing.city}, {trip.listing.country}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor}`}>
            {trip.status}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1 text-sm text-gray-700">
          <Calendar size={14} /> {formatDateRange(trip.check_in, trip.check_out)} · {trip.guests} guest{trip.guests > 1 ? "s" : ""}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold">{currencyPrecise(trip.total_price)}</span>
          {onCancel && trip.status === "confirmed" && (
            <button
              onClick={() => onCancel(trip.id)}
              className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium transition hover:border-gray-800"
            >
              Cancel booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<Spinner className="py-40" />}>
      <TripsInner />
    </Suspense>
  );
}
