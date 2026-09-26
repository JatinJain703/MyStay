import { Star } from "lucide-react";

export default function StarRating({
  rating,
  count,
  size = 14,
  showCount = true,
}: {
  rating: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}) {
  if (!rating) {
    return <span className="text-sm text-gray-500">New</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star size={size} className="fill-current text-[#222]" />
      <span className="font-medium">{rating.toFixed(2)}</span>
      {showCount && count !== undefined && (
        <span className="text-gray-500">({count})</span>
      )}
    </span>
  );
}
