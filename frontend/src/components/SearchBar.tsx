"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useClickOutside } from "@/lib/useClickOutside";
import { toISODate, fromISODate, formatDateRange } from "@/lib/format";
import DateRangeCalendar from "./DateRangeCalendar";
import GuestSelector from "./GuestSelector";

type Panel = "where" | "dates" | "who" | null;

export default function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState<Panel>(null);
  const [location, setLocation] = useState(params.get("location") ?? "");
  const [guests, setGuests] = useState(Number(params.get("guests")) || 1);
  const initialRange: DateRange | undefined =
    params.get("check_in") && params.get("check_out")
      ? { from: fromISODate(params.get("check_in")!), to: fromISODate(params.get("check_out")!) }
      : undefined;
  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  useClickOutside(ref, () => setOpen(null));

  const submit = () => {
    const q = new URLSearchParams();
    if (location.trim()) q.set("location", location.trim());
    if (range?.from) q.set("check_in", toISODate(range.from));
    if (range?.to) q.set("check_out", toISODate(range.to));
    if (guests > 1) q.set("guests", String(guests));
    setOpen(null);
    router.push(`/?${q.toString()}`);
  };

  const datesLabel =
    range?.from && range?.to ? formatDateRange(toISODate(range.from), toISODate(range.to)) : "Any week";

  const seg = "flex flex-col justify-center px-6 py-2 text-left transition rounded-full hover:bg-gray-100";

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
        <button className={seg} onClick={() => setOpen(open === "where" ? null : "where")}>
          <span className="text-xs font-semibold">Where</span>
          <span className="text-sm text-gray-500">{location || "Search destinations"}</span>
        </button>
        <span className="h-8 w-px bg-gray-200" />
        <button className={seg} onClick={() => setOpen(open === "dates" ? null : "dates")}>
          <span className="text-xs font-semibold">When</span>
          <span className="text-sm text-gray-500">{datesLabel}</span>
        </button>
        <span className="h-8 w-px bg-gray-200" />
        <button className={`${seg} pr-2`} onClick={() => setOpen(open === "who" ? null : "who")}>
          <span className="text-xs font-semibold">Who</span>
          <span className="text-sm text-gray-500">
            {guests > 1 ? `${guests} guests` : "Add guests"}
          </span>
        </button>
        <button
          onClick={submit}
          className="mr-2 flex items-center gap-2 rounded-full bg-rausch px-4 py-3 text-white transition hover:bg-rauschDark"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>

      {/* Popovers */}
      {open === "where" && (
        <Popover>
          <label className="text-xs font-semibold">Where to?</label>
          <input
            autoFocus
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="City or country"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-800"
          />
        </Popover>
      )}

      {open === "dates" && (
        <Popover center>
          <DateRangeCalendar range={range} onSelect={setRange} />
          <div className="mt-2 flex justify-end">
            <button onClick={() => setRange(undefined)} className="text-sm font-medium underline">
              Clear dates
            </button>
          </div>
        </Popover>
      )}

      {open === "who" && (
        <Popover right>
          <GuestSelector value={guests} onChange={setGuests} />
          <button
            onClick={submit}
            className="mt-3 w-full rounded-lg bg-rausch py-3 font-medium text-white transition hover:bg-rauschDark"
          >
            Search
          </button>
        </Popover>
      )}
    </div>
  );
}

function Popover({
  children,
  center,
  right,
}: {
  children: React.ReactNode;
  center?: boolean;
  right?: boolean;
}) {
  const pos = center ? "left-1/2 -translate-x-1/2" : right ? "right-0" : "left-0";
  return (
    <div className={`absolute top-[64px] z-40 ${pos} rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl`}>
      {children}
    </div>
  );
}
