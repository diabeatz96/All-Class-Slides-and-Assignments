// The same useFetch from Week 7. Not one line changed.
// The only difference is the URL we hand it.

import { useState, useEffect } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (alive) setData(json);
      } catch (e) {
        if (alive) setError(e.message === "Failed to fetch" ? "Cannot reach the server. Is it running on port 3000?" : e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [url, tick]);

  return { data, loading, error, refetch: () => setTick((t) => t + 1) };
}
