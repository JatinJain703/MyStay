"use client";

import { Minus, Plus } from "lucide-react";

export default function GuestSelector({
  value,
  onChange,
  max = 16,
  min = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium">Guests</p>
        <p className="text-sm text-gray-500">Max {max}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 text-gray-600 transition hover:border-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Decrease guests"
        >
          <Minus size={16} />
        </button>
        <span className="w-6 text-center tabular-nums">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 text-gray-600 transition hover:border-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Increase guests"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
