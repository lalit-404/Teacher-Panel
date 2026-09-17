import { useEffect, useState } from "react";

/** Ticks once a second; used for the live clock + to compute "today" reactively. */
export function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
