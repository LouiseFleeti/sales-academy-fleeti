"use client";

import { Suspense } from "react";
import SolutionsContent from "./SolutionsContent";

export default function SolutionsPage() {
  return (
    <Suspense>
      <SolutionsContent />
    </Suspense>
  );
}
