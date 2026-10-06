"use client";

import { useEffect, useState } from "react";

/**
 * IST clock — live Delhi time in the footer coordinates.
 * Decorative orientation detail; updates every 30 seconds.
 */
export function IstClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    const update = () => setNow(fmt.format(new Date()));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;
  return (
    <span className="meta text-faint">
      {" "}— <time dateTime={now}>{now} IST</time>
    </span>
  );
}
