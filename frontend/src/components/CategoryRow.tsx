"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2, Trees, Home, Castle, Warehouse, Tent, Hotel, Sparkles, SlidersHorizontal, LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Apartment: Building2,
  Cabin: Trees,
  Loft: Warehouse,
  Villa: Castle,
  Cottage: Home,
  Guesthouse: Tent,
  Townhouse: Hotel,
};

export default function CategoryRow({
  propertyTypes,
  onOpenFilters,
  activeFilterCount,
}: {
  propertyTypes: string[];
  onOpenFilters: () => void;
  activeFilterCount: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("property_type");

  const setType = (type: string | null) => {
    const q = new URLSearchParams(params.toString());
    if (type && type !== active) q.set("property_type", type);
    else q.delete("property_type");
    q.delete("page");
    router.push(`/?${q.toString()}`);
  };

  return (
    <div className="flex items-center gap-4 border-b border-gray-100 bg-white py-3">
      <div className="no-scrollbar flex flex-1 items-center gap-8 overflow-x-auto">
        <CategoryItem label="All" active={!active} onClick={() => setType(null)} Icon={Sparkles} />
        {propertyTypes.map((type) => (
          <CategoryItem
            key={type}
            label={type}
            active={active === type}
            onClick={() => setType(type)}
            Icon={ICONS[type] ?? Home}
          />
        ))}
      </div>

      <button
        onClick={onOpenFilters}
        className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium transition hover:border-gray-800"
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#222] text-xs text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}

function CategoryItem({
  label,
  active,
  onClick,
  Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  Icon: LucideIcon;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-2 text-xs transition ${
        active ? "border-[#222] text-[#222]" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-[#222]"
      }`}
    >
      <Icon size={22} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
