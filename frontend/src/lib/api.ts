// Typed API client. Every call goes through `request`, which injects the
// mocked identity header (X-User-Id) and normalizes error handling.

import type {
  User, ListingCard, ListingDetail, Amenity, Page, Availability,
  PriceQuote, Booking, BookingWithListing, BookingWithGuest, Review, ListingFormData,
} from "./types";

// Empty base → same-origin relative calls (e.g. /api/listings). Next.js rewrites
// (see next.config.mjs) proxy these to the backend server-side. Override with
// NEXT_PUBLIC_API_URL only if you want the browser to hit the backend directly.
const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export interface SearchParams {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  room_type?: string;
  amenities?: number[];
  min_rating?: number;
  sort?: string;
  page?: number;
  page_size?: number;
}

function toQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      if (v.length) q.set(k, v.join(","));
    } else {
      q.set(k, String(v));
    }
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function request<T>(path: string, options: RequestInit = {}, userId?: number): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (userId) headers["X-User-Id"] = String(userId);

  const res = await fetch(`${BASE}${path}`, { ...options, headers, cache: "no-store" });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {
      /* non-json error */
    }
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const api = {
  // Users / identity
  listUsers: () => request<User[]>("/api/users"),
  becomeHost: (id: number) => request<User>(`/api/users/${id}/become-host`, { method: "POST" }),

  // Listings
  searchListings: (params: SearchParams) =>
    request<Page<ListingCard>>(`/api/listings${toQuery(params as Record<string, unknown>)}`),
  getListing: (id: number) => request<ListingDetail>(`/api/listings/${id}`),
  getAvailability: (id: number) => request<Availability>(`/api/listings/${id}/availability`),
  getQuote: (id: number, checkIn: string, checkOut: string) =>
    request<PriceQuote>(`/api/listings/${id}/quote?check_in=${checkIn}&check_out=${checkOut}`),
  getAmenities: () => request<Amenity[]>("/api/amenities"),
  getPropertyTypes: () => request<string[]>("/api/property-types"),

  createListing: (data: ListingFormData, userId: number) =>
    request<ListingDetail>("/api/listings", { method: "POST", body: JSON.stringify({ ...data, host_id: userId }) }, userId),
  updateListing: (id: number, data: Partial<ListingFormData>, userId: number) =>
    request<ListingDetail>(`/api/listings/${id}`, { method: "PUT", body: JSON.stringify(data) }, userId),
  deleteListing: (id: number, userId: number) =>
    request<void>(`/api/listings/${id}`, { method: "DELETE" }, userId),

  // Reviews
  getReviews: (id: number) => request<Review[]>(`/api/listings/${id}/reviews`),
  createReview: (id: number, authorId: number, rating: number, comment: string) =>
    request<Review>(`/api/listings/${id}/reviews`, {
      method: "POST",
      body: JSON.stringify({ author_id: authorId, rating, comment }),
    }),

  // Bookings
  createBooking: (payload: { listing_id: number; guest_id: number; check_in: string; check_out: string; guests: number }) =>
    request<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(payload) }),
  myTrips: (guestId: number) => request<BookingWithListing[]>(`/api/bookings?guest_id=${guestId}`),
  getBooking: (id: number) => request<BookingWithListing>(`/api/bookings/${id}`),
  cancelBooking: (id: number) => request<Booking>(`/api/bookings/${id}/cancel`, { method: "PATCH" }),

  // Wishlist
  getWishlist: (userId: number) => request<ListingCard[]>(`/api/wishlist?user_id=${userId}`),
  getWishlistIds: (userId: number) => request<number[]>(`/api/wishlist/ids?user_id=${userId}`),
  toggleWishlist: (userId: number, listingId: number) =>
    request<{ listing_id: number; favorited: boolean }>("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, listing_id: listingId }),
    }),

  // Host dashboard
  hostListings: (hostId: number) => request<ListingCard[]>(`/api/host/${hostId}/listings`),
  hostBookings: (hostId: number) => request<BookingWithGuest[]>(`/api/host/${hostId}/bookings`),
};
