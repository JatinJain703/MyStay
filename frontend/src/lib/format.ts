// Formatting + date helpers used across the UI.
import { format, parseISO, differenceInCalendarDays } from "date-fns";

export function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function currencyPrecise(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function fromISODate(s: string): Date {
  return parseISO(s);
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return differenceInCalendarDays(checkOut, checkIn);
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  const ci = parseISO(checkIn);
  const co = parseISO(checkOut);
  const sameMonth = ci.getMonth() === co.getMonth() && ci.getFullYear() === co.getFullYear();
  return sameMonth
    ? `${format(ci, "MMM d")} – ${format(co, "d, yyyy")}`
    : `${format(ci, "MMM d")} – ${format(co, "MMM d, yyyy")}`;
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}

export function memberSince(iso: string): string {
  return format(parseISO(iso), "MMMM yyyy");
}
