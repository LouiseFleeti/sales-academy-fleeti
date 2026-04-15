"use client";

import { Suspense } from "react";
import PainPointsContent from "./PainPointsContent";

export default function PainPointsPage() {
  return (
    <Suspense>
      <PainPointsContent />
    </Suspense>
  );
}
