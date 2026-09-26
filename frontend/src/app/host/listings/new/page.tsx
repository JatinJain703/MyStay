"use client";

import { useApp } from "@/lib/app-context";
import ListingForm from "@/components/ListingForm";
import HostGate from "@/components/HostGate";

export default function NewListingPage() {
  const { currentUser } = useApp();
  return (
    <HostGate>
      {currentUser && <ListingForm />}
    </HostGate>
  );
}
