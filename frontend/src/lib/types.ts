// Shared API types — mirror the FastAPI Pydantic response models.

export type UserRole = "guest" | "host";

export interface User {
  id: number;
  name: string;
  email: string;
  photo_url: string | null;
  bio: string | null;
  role: UserRole;
  is_superhost: boolean;
  created_at: string;
}

export interface HostPublic {
  id: number;
  name: string;
  photo_url: string | null;
  is_superhost: boolean;
  bio: string | null;
  created_at: string;
}

export interface ListingImage {
  id: number;
  url: string;
  position: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
}

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  country: string;
  property_type: string;
  price_per_night: number;
  avg_rating: number;
  review_count: number;
  latitude: number;
  longitude: number;
  images: ListingImage[];
}

export interface Review {
  id: number;
  listing_id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: User;
}

export interface ListingDetail {
  id: number;
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  city: string;
  country: string;
  address: string | null;
  latitude: number;
  longitude: number;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  host: HostPublic;
  images: ListingImage[];
  amenities: Amenity[];
  reviews: Review[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  page_size: number;
}

export interface DateRange {
  check_in: string;
  check_out: string;
}

export interface Availability {
  listing_id: number;
  booked_ranges: DateRange[];
}

export interface PriceQuote {
  nightly_rate: number;
  nights: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nightly_rate: number;
  nights: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: "confirmed" | "cancelled" | "completed";
  created_at: string;
}

export interface BookingWithListing extends Booking {
  listing: ListingCard;
}

export interface BookingWithGuest extends Booking {
  guest: User;
}

export interface ListingFormData {
  title: string;
  description: string;
  property_type: string;
  room_type: string;
  city: string;
  country: string;
  address?: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  image_urls: string[];
  amenity_ids: number[];
}
