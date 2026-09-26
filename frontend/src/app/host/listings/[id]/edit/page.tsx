"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ListingDetail } from "@/lib/types";
import { api } from "@/lib/api";
import ListingForm from "@/components/ListingForm";
import HostGate from "@/components/HostGate";
import { Spinner } from "@/components/Spinner";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetail | null>(null);

  useEffect(() => {
    api.getListing(Number(id)).then(setListing).catch(() => {});
  }, [id]);

  return (
    <HostGate>
      {listing ? <ListingForm existing={listing} /> : <Spinner className="py-40" />}
    </HostGate>
  );
}
