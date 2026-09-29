"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";

/**
 * Contact link with conversion tracking. Fires a contact_click event
 * (mailto vs tel) so lead actions are measurable in Vercel Analytics.
 */
export function ContactLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const kind = href.startsWith("tel:") ? "phone" : "email";
  return (
    <a
      href={href}
      data-cursor="OPEN"
      className={className}
      onClick={() => track("contact_click", { channel: kind })}
    >
      {children}
    </a>
  );
}
