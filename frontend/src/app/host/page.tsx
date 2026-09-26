"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Home, CalendarDays, DollarSign } from "lucide-react";
import type { ListingCard, BookingWithGuest } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { currency, currencyPrecise, formatDateRange } from "@/lib/format";
import HostGate from "@/components/HostGate";
import { Spinner } from "@/components/Spinner";

function Dashboard() {
  const { currentUser } = useApp();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [bookings, setBookings] = useState<BookingWithGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "bookings">("listings");

  const load = () => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([api.hostListings(currentUser.id), api.hostBookings(currentUser.id)])
      .then(([l, b]) => { setListings(l); setBookings(b); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [currentUser]);

  const remove = async (id: number) => {
    if (!currentUser) return;
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await api.deleteListing(id, currentUser.id);
      toast.success("Listing deleted");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    }
  };

  if (loading) return <Spinner className="py-40" />;

  const confirmedRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">My Properties</h1>
        <Link href="/host/listings/new" className="flex items-center gap-2 rounded-xl bg-rausch px-5 py-2.5 font-medium text-white transition hover:bg-rauschDark">
          <Plus size={18} /> New listing
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat icon={<Home size={20} />} label="Listings" value={String(listings.length)} />
        <Stat icon={<CalendarDays size={20} />} label="Bookings" value={String(bookings.length)} />
        <Stat icon={<DollarSign size={20} />} label="Revenue (mock)" value={currency(confirmedRevenue)} />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-gray-200">
        {(["listings", "bookings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 pb-3 text-sm font-medium capitalize transition ${
              tab === t ? "border-[#222] text-[#222]" : "border-transparent text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "listings" ? (
        listings.length === 0 ? (
          <Empty text="No listings yet. Create your first one!" />
        ) : (
          <div className="space-y-4">
            {listings.map((l) => (
              <div key={l.id} className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4">
                <Link href={`/listings/${l.id}`} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                  {l.images[0] && <Image src={l.images[0].url} alt={l.title} fill className="object-cover" />}
                </Link>
                <div className="flex-1">
                  <Link href={`/listings/${l.id}`} className="font-medium hover:underline">{l.title}</Link>
                  <p className="text-sm text-gray-500">{l.city}, {l.country} · {currency(l.price_per_night)}/night</p>
                  <p className="text-sm text-gray-500">
                    {bookings.filter((b) => b.listing_id === l.id && b.status !== "cancelled").length} active booking(s)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/host/listings/${l.id}/edit`} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm transition hover:border-gray-800">
                    <Pencil size={15} /> Edit
                  </Link>
                  <button onClick={() => remove(l.id)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-rausch transition hover:border-rausch">
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <Empty text="No bookings on your listings yet." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-medium">{b.guest.name}</td>
                  <td className="px-4 py-3">
                    <Link href={`/listings/${b.listing_id}`} className="hover:underline">#{b.listing_id}</Link>
                  </td>
                  <td className="px-4 py-3">{formatDateRange(b.check_in, b.check_out)}</td>
                  <td className="px-4 py-3">{b.guests}</td>
                  <td className="px-4 py-3">{currencyPrecise(b.total_price)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      b.status === "confirmed" ? "bg-green-100 text-green-700"
                      : b.status === "cancelled" ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                    }`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 p-5">
      <div className="rounded-xl bg-gray-100 p-3 text-gray-700">{icon}</div>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">{text}</div>;
}

export default function HostPage() {
  return (
    <HostGate>
      <Dashboard />
    </HostGate>
  );
}
