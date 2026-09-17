import { useEffect, useState } from "react";

export function usePagination(items, pageSize, resetKey) {
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pageItems = items.slice(page * pageSize, page * pageSize + pageSize);

  return {
    page,
    totalPages,
    pageItems,
    next: () => setPage((p) => Math.min(p + 1, totalPages - 1)),
    prev: () => setPage((p) => Math.max(p - 1, 0)),
  };
}
