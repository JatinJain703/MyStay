"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import type { ListingDetail, PriceQuote, DateRange as ApiRange } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { currency, currencyPrecise, toISODate, fromISODate } from "@/lib/format";
import { useClickOutside } from "@/lib/useClickOutside";
import DateRangeCalendar from "./DateRangeCalendar";
import GuestSelector from "./GuestSelector";
import CheckoutModal from "./CheckoutModal";

// Turn booked ranges [check_in, check_out) into a matcher that disables those nights.
function buildDisabledMatcher(ranges: ApiRange[]) {
  const blocked = ranges.map((r) => ({
    from: fromISODate(r.check_in),
    // check_out is the departure day → the last blocked night is the day before.
    to: new Date(fromISODate(r.check_out).getTime() - 86400000),
  }));
  return (date: Date) =>
    blocked.some((b) => date >= stripTime(b.from) && date <= stripTime(b.to));
}

function stripTime(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export default function BookingWidget({ listing }: { listing: ListingDetail }) {
  const { currentUser } = useApp();
  const router = useRouter();
  const [bookedRanges, setBookedRanges] = useState<ApiRange[]>([]);
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [showCal, setShowCal] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [checkout, setCheckout] = useState(false);

  const calRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);
  useClickOutside(calRef, () => setShowCal(false));
  useClickOutside(guestRef, () => setShowGuests(false));

  useEffect(() => {
    api.getAvailability(listing.id).then((a) => setBookedRanges(a.booked_ranges)).catch(() => {});
  }, [listing.id]);

  const disabled = useMemo(() => buildDisabledMatcher(bookedRanges), [bookedRanges]);

  // Fetch a fresh price quote whenever a complete range is chosen.
  useEffect(() => {
    if (range?.from && range?.to) {
      api
        .getQuote(listing.id, toISODate(range.from), toISODate(range.to))
        .then(setQuote)
        .catch(() => setQuote(null));
    } else {
      setQuote(null);
    }
  }, [range, listing.id]);

  const onReserve = () => {
    if (!currentUser) return toast.error("Pick an account from the menu first");
    if (!range?.from || !range?.to) {
      setShowCal(true);
      return toast.error("Select your dates");
    }
    if (guests > listing.max_guests) return toast.error(`Max ${listing.max_guests} guests`);
    setCheckout(true);
  };

  const rangeLabel = range?.from && range?.to
    ? `${toISODate(range.from)} → ${toISODate(range.to)}`
    : "Add dates";

  return (
    <div className="sticky top-28 rounded-2xl border border-gray-200 p-6 shadow-card">
      <div className="mb-4 flex items-baseline justify-between">
        <p>
          <span className="text-2xl font-semibold">{currency(listing.price_per_night)}</span>
          <span className="text-gray-600"> night</span>
        </p>
        {listing.avg_rating > 0 && (
          <span className="inline-flex items-center gap-1 text-sm">
            <Star size={14} className="fill-current" />
            {listing.avg_rating.toFixed(2)} · {listing.review_count} reviews
          </span>
        )}
      </div>

      {/* Date + guest selectors */}
      <div className="rounded-xl border border-gray-400">
        <div className="relative" ref={calRef}>
          <button
            onClick={() => { setShowCal((s) => !s); setShowGuests(false); }}
            className="grid w-full grid-cols-2 divide-x divide-gray-400 text-left"
          >
            <span className="px-3 py-2.5">
              <span className="block text-[10px] font-bold uppercase">Check-in</span>
              <span className="text-sm text-gray-600">
                {range?.from ? toISODate(range.from) : "Add date"}
              </span>
            </span>
            <span className="px-3 py-2.5">
              <span className="block text-[10px] font-bold uppercase">Checkout</span>
              <span className="text-sm text-gray-600">
                {range?.to ? toISODate(range.to) : "Add date"}
              </span>
            </span>
          </button>
          {showCal && (
            <div className="absolute right-0 top-full z-20 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
              <DateRangeCalendar range={range} onSelect={setRange} disabled={disabled} />
              <div className="mt-2 flex justify-between">
                <button onClick={() => setRange(undefined)} className="text-sm font-medium underline">
                  Clear
                </button>
                <button
                  onClick={() => setShowCal(false)}
                  className="rounded-lg bg-[#222] px-4 py-1.5 text-sm text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative border-t border-gray-400" ref={guestRef}>
          <button
            onClick={() => { setShowGuests((s) => !s); setShowCal(false); }}
            className="w-full px-3 py-2.5 text-left"
          >
            <span className="block text-[10px] font-bold uppercase">Guests</span>
            <span className="text-sm text-gray-600">{guests} guest{guests > 1 ? "s" : ""}</span>
          </button>
          {showGuests && (
            <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
              <GuestSelector value={guests} onChange={setGuests} max={listing.max_guests} />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onReserve}
        className="mt-4 w-full rounded-xl bg-rausch py-3.5 font-semibold text-white transition hover:bg-rauschDark"
      >
        Reserve
      </button>
      <p className="mt-2 text-center text-sm text-gray-500">You won&apos;t be charged yet</p>

      {/* Price breakdown */}
      {quote && (
        <div className="mt-5 space-y-3 text-[15px]">
          <Row
            label={`${currency(quote.nightly_rate)} × ${quote.nights} night${quote.nights > 1 ? "s" : ""}`}
            value={currencyPrecise(quote.subtotal)}
          />
          <Row label="Cleaning fee" value={currencyPrecise(quote.cleaning_fee)} />
          <Row label="Service fee" value={currencyPrecise(quote.service_fee)} />
          <div className="border-t border-gray-200 pt-3">
            <Row label="Total" value={currencyPrecise(quote.total)} bold />
          </div>
        </div>
      )}

      {checkout && quote && range?.from && range?.to && currentUser && (
        <CheckoutModal
          open={checkout}
          onClose={() => setCheckout(false)}
          listing={listing}
          quote={quote}
          guests={guests}
          checkIn={toISODate(range.from)}
          checkOut={toISODate(range.to)}
          onConfirmed={(bookingId) => {
            setCheckout(false);
            toast.success("Booking confirmed!");
            router.push(`/trips?highlight=${bookingId}`);
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : "text-gray-700"}`}>
      <span className={bold ? "" : "underline"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
