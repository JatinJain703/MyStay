"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import type { Amenity, ListingDetail, ListingFormData } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { useApp } from "@/lib/app-context";

const PROPERTY_TYPES = ["Apartment", "Cabin", "Loft", "Villa", "Cottage", "Guesthouse", "Townhouse"];
const ROOM_TYPES = ["Entire place", "Private room"];

const EMPTY: ListingFormData = {
  title: "", description: "", property_type: "Apartment", room_type: "Entire place",
  city: "", country: "", address: "", latitude: 0, longitude: 0, price_per_night: 100,
  max_guests: 2, bedrooms: 1, beds: 1, bathrooms: 1, image_urls: [""], amenity_ids: [],
};

export default function ListingForm({ existing }: { existing?: ListingDetail }) {
  const router = useRouter();
  const { currentUser } = useApp();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [form, setForm] = useState<ListingFormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getAmenities().then(setAmenities).catch(() => {});
  }, []);

  // Prefill when editing.
  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title, description: existing.description,
        property_type: existing.property_type, room_type: existing.room_type,
        city: existing.city, country: existing.country, address: existing.address ?? "",
        latitude: existing.latitude, longitude: existing.longitude,
        price_per_night: existing.price_per_night, max_guests: existing.max_guests,
        bedrooms: existing.bedrooms, beds: existing.beds, bathrooms: existing.bathrooms,
        image_urls: existing.images.map((i) => i.url).length ? existing.images.map((i) => i.url) : [""],
        amenity_ids: existing.amenities.map((a) => a.id),
      });
    }
  }, [existing]);

  const set = <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setImage = (i: number, url: string) =>
    setForm((f) => ({ ...f, image_urls: f.image_urls.map((u, idx) => (idx === i ? url : u)) }));
  const addImage = () => setForm((f) => ({ ...f, image_urls: [...f.image_urls, ""] }));
  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, image_urls: f.image_urls.filter((_, idx) => idx !== i) }));

  const toggleAmenity = (id: number) =>
    setForm((f) => ({
      ...f,
      amenity_ids: f.amenity_ids.includes(id)
        ? f.amenity_ids.filter((x) => x !== id)
        : [...f.amenity_ids, id],
    }));

  const submit = async () => {
    if (!currentUser) return toast.error("Select a host account first");
    if (!form.title || !form.city || !form.country) return toast.error("Fill in title, city and country");
    const payload = { ...form, image_urls: form.image_urls.filter((u) => u.trim()) };
    setSaving(true);
    try {
      if (existing) {
        await api.updateListing(existing.id, payload, currentUser.id);
        toast.success("Listing updated");
      } else {
        await api.createListing(payload, currentUser.id);
        toast.success("Listing published");
      }
      router.push("/host");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const input = "w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-gray-800";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-semibold">{existing ? "Edit listing" : "Create a new listing"}</h1>

      <div className="space-y-6">
        <Field label="Title">
          <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Cozy loft near the harbor" />
        </Field>

        <Field label="Description">
          <textarea className={input} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe your place…" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Property type">
            <select className={input} value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>
              {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Room type">
            <select className={input} value={form.room_type} onChange={(e) => set("room_type", e.target.value)}>
              {ROOM_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="City"><input className={input} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="Country"><input className={input} value={form.country} onChange={(e) => set("country", e.target.value)} /></Field>
        </div>

        <Field label="Address (optional)">
          <input className={input} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude"><input type="number" step="any" className={input} value={form.latitude} onChange={(e) => set("latitude", Number(e.target.value))} /></Field>
          <Field label="Longitude"><input type="number" step="any" className={input} value={form.longitude} onChange={(e) => set("longitude", Number(e.target.value))} /></Field>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Price / night"><input type="number" className={input} value={form.price_per_night} onChange={(e) => set("price_per_night", Number(e.target.value))} /></Field>
          <Field label="Max guests"><input type="number" className={input} value={form.max_guests} onChange={(e) => set("max_guests", Number(e.target.value))} /></Field>
          <Field label="Bedrooms"><input type="number" className={input} value={form.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} /></Field>
          <Field label="Beds"><input type="number" className={input} value={form.beds} onChange={(e) => set("beds", Number(e.target.value))} /></Field>
        </div>
        <Field label="Bathrooms">
          <input type="number" step="0.5" className={`${input} max-w-[160px]`} value={form.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} />
        </Field>

        {/* Photos via URL */}
        <div>
          <p className="mb-2 font-medium">Photos (image URLs)</p>
          <div className="space-y-3">
            {form.image_urls.map((url, i) => (
              <div key={i} className="flex items-center gap-3">
                {url ? (
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* plain img avoids next/image remote-domain config for arbitrary hosts */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded-lg bg-gray-100" />
                )}
                <input className={input} value={url} onChange={(e) => setImage(i, e.target.value)} placeholder="https://…" />
                <button onClick={() => removeImage(i)} className="rounded-lg p-2 text-gray-400 hover:text-rausch">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addImage} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-rausch">
            <Plus size={16} /> Add another photo
          </button>
        </div>

        {/* Amenities */}
        <div>
          <p className="mb-2 font-medium">Amenities</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {amenities.map((a) => (
              <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={form.amenity_ids.includes(a.id)} onChange={() => toggleAmenity(a.id)} />
                {a.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={submit} disabled={saving} className="rounded-xl bg-rausch px-8 py-3 font-semibold text-white transition hover:bg-rauschDark disabled:opacity-60">
            {saving ? "Saving…" : existing ? "Save changes" : "Publish listing"}
          </button>
          <button onClick={() => router.back()} className="rounded-xl border border-gray-300 px-6 py-3 font-medium transition hover:border-gray-800">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
