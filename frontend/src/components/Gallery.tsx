"use client";

import { useState } from "react";
import Image from "next/image";
import { Grip, ChevronLeft, ChevronRight } from "lucide-react";
import type { ListingImage } from "@/lib/types";
import Modal from "./Modal";

// Airbnb-style detail gallery: a hero grid of up to 5 photos + a "show all"
// lightbox that pages through every image.
export default function Gallery({ images, title }: { images: ListingImage[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const photos = images.length ? images : [];

  if (!photos.length) {
    return <div className="aspect-[2/1] w-full rounded-xl bg-gray-200" />;
  }

  const grid = photos.slice(0, 5);

  return (
    <>
      <div className="relative grid h-[300px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl md:h-[420px]">
        {grid.map((img, i) => (
          <button
            key={img.id}
            onClick={() => { setIdx(i); setOpen(true); }}
            className={`relative overflow-hidden ${
              i === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
            } ${grid.length < 5 && i === 0 ? "col-span-4" : ""}`}
          >
            <Image
              src={img.url}
              alt={`${title} photo ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition hover:brightness-90"
            />
          </button>
        ))}
        <button
          onClick={() => { setIdx(0); setOpen(true); }}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-gray-800 bg-white px-3 py-1.5 text-sm font-medium shadow transition hover:bg-gray-50"
        >
          <Grip size={16} /> Show all photos
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} maxWidth="max-w-4xl">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src={photos[idx].url}
            alt={`${title} photo ${idx + 1}`}
            fill
            className="rounded-lg object-contain"
          />
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            onClick={() => setIdx((i) => (i - 1 + photos.length) % photos.length)}
            className="rounded-full border border-gray-300 p-2 hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            {idx + 1} / {photos.length}
          </span>
          <button
            onClick={() => setIdx((i) => (i + 1) % photos.length)}
            className="rounded-full border border-gray-300 p-2 hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </Modal>
    </>
  );
}
