"use client";

import { Suspense } from "react";
import EnjeuxContent from "./EnjeuxContent";

export default function EnjeuxPage() {
  return (
    <Suspense>
      <EnjeuxContent />
    </Suspense>
  );
}
