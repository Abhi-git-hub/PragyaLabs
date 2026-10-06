"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * FAQ accordion — honest answers, interactive. Framer-motion height
 * animation with instant open/close under reduced motion.
 * Heading level stays h2: search hierarchy unchanged.
 */
export function FaqAccordion({ faq }: { faq: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <div className="max-w-[880px]">
      {faq.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="border-t border-line last:border-b">
            <h2 className="text-lg text-bone">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors hover:text-cyan"
              >
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className={`meta shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45 text-cyan" : "text-faint"}`}
                >
                  +
                </span>
              </button>
            </h2>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[62ch] pb-7 leading-relaxed text-muted">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
