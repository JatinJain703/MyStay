"use client";

import { MapPin } from "lucide-react";

// Lightweight, key-free map: an OpenStreetMap embed centered on the listing
// with a marker. Satisfies the "static/basic map is fine" requirement.
export default function StaticMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const d = 0.02;
  const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <section className="border-t border-gray-200 py-10">
      <h2 className="mb-4 text-2xl font-semibold">Where you&apos;ll be</h2>
      <div className="relative overflow-hidden rounded-2xl border border-gray-200">
        <iframe
          title="Listing location"
          src={src}
          className="h-[360px] w-full"
          loading="lazy"
        />
      </div>
      <p className="mt-3 flex items-center gap-2 text-gray-700">
        <MapPin size={18} /> {label}
      </p>
    </section>
  );
}
