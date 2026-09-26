"use client";

import { DayPicker, DateRange } from "react-day-picker";

// Thin wrapper around react-day-picker in range mode with disabled dates.
// Used by both the search bar and the listing booking widget.
export default function DateRangeCalendar({
  range,
  onSelect,
  disabled,
  numberOfMonths = 2,
}: {
  range: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
  numberOfMonths?: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <DayPicker
      mode="range"
      selected={range}
      onSelect={onSelect}
      numberOfMonths={numberOfMonths}
      disabled={[{ before: today }, ...(disabled ? [disabled] : [])]}
      showOutsideDays={false}
    />
  );
}
