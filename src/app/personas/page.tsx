"use client";

import { Suspense } from "react";
import PersonasContent from "./PersonasContent";

export default function PersonasPage() {
  return (
    <Suspense>
      <PersonasContent />
    </Suspense>
  );
}
