"use client";

import { Suspense } from "react";
import FonctionnalitesContent from "./FonctionnalitesContent";

export default function FonctionnalitesPage() {
  return (
    <Suspense>
      <FonctionnalitesContent />
    </Suspense>
  );
}
