"use client";

import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Amenity } from "@/lib/types";
import ExploreGrid from "@/components/ExploreGrid";
import { Spinner } from "@/components/Spinner";

export default function HomePage() {
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    api.getPropertyTypes().then(setPropertyTypes).catch(() => {});
    api.getAmenities().then(setAmenities).catch(() => {});
  }, []);

  return (
    <Suspense fallback={<Spinner className="py-40" />}>
      <ExploreGrid propertyTypes={propertyTypes} amenities={amenities} />
    </Suspense>
  );
}
