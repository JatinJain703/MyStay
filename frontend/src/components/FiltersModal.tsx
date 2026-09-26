"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "./Modal";
import { AmenityIcon } from "./amenityIcons";
import type { Amenity } from "@/lib/types";

const ROOM_TYPES = ["Entire place", "Private room"];

export default function FiltersModal({
  open,
  onClose,
  amenities,
}: {
  open: boolean;
  onClose: () => void;
  amenities: Amenity[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [minPrice, setMinPrice] = useState(params.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") ?? "");
  const [roomType, setRoomType] = useState(params.get("room_type") ?? "");
  const [selected, setSelected] = useState<number[]>(
    params.get("amenities")?.split(",").map(Number).filter(Boolean) ?? [],
  );

  const toggleAmenity = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const apply = () => {
    const q = new URLSearchParams(params.toString());
    const set = (k: string, v: string) => (v ? q.set(k, v) : q.delete(k));
    set("min_price", minPrice);
    set("max_price", maxPrice);
    set("room_type", roomType);
    if (selected.length) q.set("amenities", selected.join(","));
    else q.delete("amenities");
    q.delete("page");
    q.delete("modal");
    onClose();
    router.push(`/?${q.toString()}`);
  };

  const clearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setRoomType("");
    setSelected([]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Filters" maxWidth="max-w-2xl">
      {/* Price */}
      <section className="border-b border-gray-200 pb-6">
        <h3 className="mb-3 text-lg font-semibold">Price range</h3>
        <div className="flex items-center gap-4">
          <label className="flex-1">
            <span className="text-xs text-gray-500">Min price</span>
            <div className="mt-1 flex items-center rounded-lg border border-gray-300 px-3">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full py-2 pl-1 outline-none"
              />
            </div>
          </label>
          <span className="mt-5 text-gray-400">—</span>
          <label className="flex-1">
            <span className="text-xs text-gray-500">Max price</span>
            <div className="mt-1 flex items-center rounded-lg border border-gray-300 px-3">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="1000"
                className="w-full py-2 pl-1 outline-none"
              />
            </div>
          </label>
        </div>
      </section>

      {/* Room type */}
      <section className="border-b border-gray-200 py-6">
        <h3 className="mb-3 text-lg font-semibold">Type of place</h3>
        <div className="flex gap-3">
          {["", ...ROOM_TYPES].map((rt) => (
            <button
              key={rt || "any"}
              onClick={() => setRoomType(rt)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                roomType === rt ? "border-[#222] bg-gray-50 font-medium" : "border-gray-300 hover:border-gray-800"
              }`}
            >
              {rt || "Any type"}
            </button>
          ))}
        </div>
      </section>

      {/* Amenities */}
      <section className="py-6">
        <h3 className="mb-3 text-lg font-semibold">Amenities</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {amenities.map((a) => (
            <button
              key={a.id}
              onClick={() => toggleAmenity(a.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                selected.includes(a.id) ? "border-[#222] bg-gray-50" : "border-gray-300 hover:border-gray-800"
              }`}
            >
              <AmenityIcon icon={a.icon} size={18} />
              <span className="truncate">{a.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
        <button onClick={clearAll} className="text-sm font-semibold underline">
          Clear all
        </button>
        <button
          onClick={apply}
          className="rounded-lg bg-[#222] px-6 py-3 font-medium text-white transition hover:bg-black"
        >
          Show results
        </button>
      </div>
    </Modal>
  );
}
