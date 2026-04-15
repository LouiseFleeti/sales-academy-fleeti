"use client";

import { Suspense } from "react";
import CapacitesContent from "./CapacitesContent";

export default function CapacitesPage() {
  return (
    <Suspense>
      <CapacitesContent />
    </Suspense>
  );
}
