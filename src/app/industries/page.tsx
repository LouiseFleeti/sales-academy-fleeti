"use client";

import { Suspense } from "react";
import IndustriesContent from "./IndustriesContent";

export default function IndustriesPage() {
  return (
    <Suspense>
      <IndustriesContent />
    </Suspense>
  );
}
