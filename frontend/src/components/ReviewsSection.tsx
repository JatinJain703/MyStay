"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types";
import { api, ApiError } from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { formatShortDate } from "@/lib/format";

export default function ReviewsSection({
  listingId,
  initialReviews,
  avgRating,
}: {
  listingId: number;
  initialReviews: Review[];
  avgRating: number;
}) {
  const { currentUser } = useApp();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!currentUser) return toast.error("Select an account to review");
    if (comment.trim().length < 3) return toast.error("Write a few words");
    setSubmitting(true);
    try {
      const created = await api.createReview(listingId, currentUser.id, rating, comment.trim());
      setReviews((prev) => [created, ...prev.filter((r) => r.author.id !== currentUser.id)]);
      setComment("");
      toast.success("Review posted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not post review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-gray-200 py-10">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold">
        <Star size={22} className="fill-current" />
        {avgRating > 0 ? `${avgRating.toFixed(2)} · ` : ""}
        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
      </h2>

      {/* Add review */}
      <div className="mb-8 rounded-2xl border border-gray-200 p-5">
        <p className="mb-2 font-medium">Leave a review</p>
        <div className="mb-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
            >
              <Star
                size={24}
                className={n <= (hover || rating) ? "fill-rausch text-rausch" : "text-gray-300"}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Share your experience…"
          className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-gray-800"
        />
        <button
          onClick={submit}
          disabled={submitting}
          className="mt-3 rounded-lg bg-[#222] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post review"}
        </button>
      </div>

      {/* List */}
      <div className="grid gap-8 md:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.id}>
            <div className="flex items-center gap-3">
              {r.author.photo_url && (
                <Image src={r.author.photo_url} alt={r.author.name} width={40} height={40} className="rounded-full" />
              )}
              <div>
                <p className="font-medium">{r.author.name}</p>
                <p className="text-xs text-gray-500">{formatShortDate(r.created_at)}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} size={12} className="fill-current" />
              ))}
            </div>
            <p className="mt-2 text-[15px] text-gray-700">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-500">No reviews yet — be the first!</p>}
      </div>
    </section>
  );
}
