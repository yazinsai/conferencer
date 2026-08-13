"use client";

import { useEffect } from "react";

/**
 * Drives the marketing surfaces' scroll reveal (design.md § Motion · marketing
 * surfaces, item 4). One component per page, one observer for the whole page, no
 * per-element island.
 *
 * Three decisions worth keeping:
 *
 * 1. **The default is visible.** The server sends `.hm-reveal` with no state
 *    attribute, and the CSS only hides an element once this component has marked
 *    it. So a JS-off reader, a crawler, a print stylesheet and a full-page
 *    screenshot all get the content, and the animation is strictly additive. The
 *    alternative — CSS `animation-timeline: view()` — hides everything below the
 *    fold at all times, because its progress is a function of scroll position
 *    rather than a one-shot. That made `npm run shots` capture a blank page.
 *
 * 2. **Only what is off-screen at mount is marked.** Marking something the reader
 *    is already looking at would make it flash out and back in. Anything already
 *    in view is left alone, which is also why the hero keeps its own `.reveal`
 *    stagger instead of using this.
 *
 * 3. **Sticky.** Once revealed, an element is unobserved and never hidden again,
 *    so scrolling up and down does not re-run the fade.
 */
export function RevealOnce() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver !== "function") return;

    const targets = [...document.querySelectorAll<HTMLElement>(".hm-reveal")];
    const pending = targets.filter((element) => {
      // Anything within a tenth of a viewport of the fold counts as already seen.
      const top = element.getBoundingClientRect().top;
      return top > window.innerHeight * 0.9;
    });
    if (!pending.length) return;

    for (const element of pending) element.dataset.revealState = "pending";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealState = "in";
          observer.unobserve(entry.target);
        }
      },
      // Fires a little before the element's edge arrives, so the fade finishes
      // about when it reaches comfortable reading height.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.02 },
    );

    for (const element of pending) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return null;
}
