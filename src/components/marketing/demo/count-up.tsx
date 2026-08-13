"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A figure that counts up the first time it is scrolled into view.
 *
 * design.md § Motion · marketing surfaces, item 9. Three rules the naive version of
 * this gets wrong:
 *
 *   · it renders the **final** value on the server, so the number is correct with
 *     scripting off and never flashes a zero;
 *   · a value that is not a number — an em dash, when this instance's database is
 *     empty — is left alone rather than animated to nothing;
 *   · the figure is set in tabular numerals by its caller, so the column cannot
 *     change width while it runs, and reduced motion skips straight to the end.
 */
export function CountUp({ value, duration = 700 }: { value: string; duration?: number }) {
  const target = Number(value);
  const animatable = value !== "" && Number.isFinite(target) && target > 0;
  const [shown, setShown] = useState(value);
  const node = useRef<HTMLSpanElement | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (!animatable || ran.current) return;
    const element = node.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || ran.current) return;
        ran.current = true;
        observer.disconnect();

        const started = performance.now();
        let frame = 0;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - started) / duration);
          // Matches --ease-out's feel closely enough for a number, and costs
          // nothing: the figure decelerates into its final value.
          const eased = 1 - Math.pow(1 - progress, 3);
          setShown(String(Math.round(target * eased)));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [animatable, duration, target]);

  return <span ref={node}>{shown}</span>;
}
