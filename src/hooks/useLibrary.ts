"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function useLibrary<T extends { id: string }>(apiEndpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Load all items
  useEffect(() => {
    setLoading(true);
    fetch(apiEndpoint)
      .then((r) => r.json())
      .then((data: T[] | { error: string }) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [apiEndpoint]);

  // Sync selection with URL
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && items.length > 0) {
      const found = items.find((i) => i.id === id);
      if (found) setSelectedItem(found);
    }
  }, [searchParams, items]);

  const selectItem = useCallback(
    (id: string) => {
      const found = items.find((i) => i.id === id);
      if (found) {
        setSelectedItem(found);
        router.push(`${pathname}?id=${id}`, { scroll: false });
      }
    },
    [items, pathname, router]
  );

  return { items, loading, selectedItem, selectItem, detailLoading };
}
