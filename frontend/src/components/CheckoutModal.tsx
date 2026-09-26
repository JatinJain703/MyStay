"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import type { ListingDetail, PriceQuote } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { currencyPrecise, formatDateRange } from "@/lib/format";
import Modal from "./Modal";

// Mocked checkout: collects fake card details (never sent anywhere), then
// creates the real booking via the API.
export default function CheckoutModal({
  open,
  onClose,
  listing,
  quote,
  guests,
  checkIn,
  checkOut,
  onConfirmed,
}: {
  open: boolean;
  onClose: () => void;
  listing: ListingDetail;
  quote: PriceQuote;
  guests: number;
  checkIn: string;
  checkOut: string;
  onConfirmed: (bookingId: number) => void;
}) {
  const { currentUser } = useApp();
  const [card, setCard] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const booking = await api.createBooking({
        listing_id: listing.id,
        guest_id: currentUser.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      onConfirmed(booking.id);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Booking failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Confirm and pay" maxWidth="max-w-xl">
      {/* Trip summary */}
      <div className="flex gap-4 border-b border-gray-200 pb-5">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
          {listing.images[0] && (
            <Image src={listing.images[0].url} alt={listing.title} fill className="object-cover" />
          )}
        </div>
        <div className="text-sm">
          <p className="font-medium">{listing.title}</p>
          <p className="text-gray-500">{listing.city}, {listing.country}</p>
          <p className="mt-1 text-gray-500">{formatDateRange(checkIn, checkOut)} · {guests} guest{guests > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2 border-b border-gray-200 py-5 text-sm">
        <Line label={`Nightly × ${quote.nights}`} value={currencyPrecise(quote.subtotal)} />
        <Line label="Cleaning fee" value={currencyPrecise(quote.cleaning_fee)} />
        <Line label="Service fee" value={currencyPrecise(quote.service_fee)} />
        <Line label="Total (USD)" value={currencyPrecise(quote.total)} bold />
      </div>

      {/* Mocked payment */}
      <div className="py-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Lock size={16} /> Pay with card
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">Mocked</span>
        </h3>
        <input
          value={card}
          onChange={(e) => setCard(e.target.value)}
          placeholder="Card number (4242 4242 4242 4242)"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-800"
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <input placeholder="MM / YY" className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-800" />
          <input placeholder="CVV" className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-800" />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          This is a demo — no real payment is processed. Any value works.
        </p>
      </div>

      <button
        onClick={confirm}
        disabled={submitting}
        className="w-full rounded-xl bg-rausch py-3.5 font-semibold text-white transition hover:bg-rauschDark disabled:opacity-60"
      >
        {submitting ? "Confirming…" : `Confirm booking · ${currencyPrecise(quote.total)}`}
      </button>
    </Modal>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t border-gray-200 pt-2 font-semibold" : "text-gray-700"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
