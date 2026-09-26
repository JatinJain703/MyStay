"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchX } from "lucide-react";
import { api, SearchParams } from "@/lib/api";
import type { ListingCard as ListingCardType, Amenity } from "@/lib/types";
import ListingCard from "./ListingCard";
import FiltersModal from "./FiltersModal";
import { CardSkeleton } from "./Spinner";

const PAGE_SIZE = 12;

function paramsToSearch(sp: URLSearchParams, page: number): SearchParams {
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  return {
    location: sp.get("location") ?? undefined,
    check_in: sp.get("check_in") ?? undefined,
    check_out: sp.get("check_out") ?? undefined,
    guests: num("guests"),
    min_price: num("min_price"),
    max_price: num("max_price"),
    property_type: sp.get("property_type") ?? undefined,
    room_type: sp.get("room_type") ?? undefined,
    amenities: sp.get("amenities")?.split(",").map(Number).filter(Boolean),
    sort: sp.get("sort") ?? undefined,
    page,
    page_size: PAGE_SIZE,
  };
}

export default function ExploreGrid({
  propertyTypes,
  amenities,
}: {
  propertyTypes: string[];
  amenities: Amenity[];
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const key = sp.toString();

  const [items, setItems] = useState<ListingCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  // Open FiltersModal when Navbar sets ?modal=filters in the URL.
  const filtersOpen = sp.get("modal") === "filters";
  const closeFilters = () => {
    const q = new URLSearchParams(sp.toString());
    q.delete("modal");
    router.replace(`/?${q.toString()}`);
  };

  // Count active advanced filters for the badge.
  const activeFilterCount = ["min_price", "max_price", "room_type", "amenities"].filter((k) =>
    sp.get(k),
  ).length;

  // Reset + load first page whenever filters change.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    api
      .searchListings(paramsToSearch(new URLSearchParams(key), 1))
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => !cancelled && setItems([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [key]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || items.length >= total) return;
    setLoadingMore(true);
    const next = page + 1;
    api
      .searchListings(paramsToSearch(new URLSearchParams(key), next))
      .then((res) => {
        setItems((prev) => [...prev, ...res.items]);
        setPage(next);
      })
      .finally(() => setLoadingMore(false));
  }, [loadingMore, loading, items.length, total, page, key]);

  // Infinite scroll via IntersectionObserver.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), {
      rootMargin: "400px",
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <div className="mx-auto max-w-7xl px-6">
      <FiltersModal open={filtersOpen} onClose={closeFilters} amenities={amenities} />

      {!loading && (
        <p className="pt-6 text-sm text-gray-500">
          {total} stay{total !== 1 ? "s" : ""}
          {sp.get("location") ? ` in ${sp.get("location")}` : ""}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 py-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <SearchX size={48} className="text-gray-300" />
          <p className="text-lg font-medium">No stays match your search</p>
          <p className="text-gray-500">Try changing your dates, filters, or destination.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 py-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          {loadingMore && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 pb-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}
          <div ref={sentinel} className="h-10" />
          {items.length >= total && total > PAGE_SIZE && (
            <p className="pb-10 text-center text-sm text-gray-400">You&apos;ve seen it all</p>
          )}
        </>
      )}
    </div>
  );
}
