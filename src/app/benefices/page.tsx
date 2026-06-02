"use client";

import { Suspense } from "react";
import BeneficesContent from "./BeneficesContent";

export default function BeneficesPage() {
  return (
    <Suspense>
      <BeneficesContent />
    </Suspense>
  );
}
