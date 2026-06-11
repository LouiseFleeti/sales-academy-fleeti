"use client";

import { Suspense } from "react";
import HomeContent from "./HomeContent";

export default function RdvPage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
