// Maps amenity icon keys (from the backend) to lucide-react icons.
import {
  Wifi, CookingPot, Car, Waves, Bath, Wind, Flame, WashingMachine,
  Tv, Dumbbell, Umbrella, Plug, Laptop, PawPrint, Beef, Home, Snowflake, LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  kitchen: CookingPot,
  parking: Car,
  pool: Waves,
  hottub: Bath,
  ac: Snowflake,
  heating: Wind,
  washer: WashingMachine,
  dryer: WashingMachine,
  tv: Tv,
  fireplace: Flame,
  gym: Dumbbell,
  beach: Umbrella,
  ev: Plug,
  workspace: Laptop,
  pets: PawPrint,
  bbq: Beef,
  balcony: Home,
};

export function AmenityIcon({ icon, size = 22 }: { icon: string | null; size?: number }) {
  const Icon = (icon && MAP[icon]) || Home;
  return <Icon size={size} className="text-[#222]" />;
}
