"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-bleed muted loop for the landing hero. Pauses and falls back to the
 * poster when the user prefers reduced motion.
 */
export function HeroVideo({
  src,
  poster,
}: {
  src: string;
  poster: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) {
      el.pause();
      return;
    }
    void el.play().catch(() => {
      /* Autoplay can still fail; poster remains visible. */
    });
  }, [reduceMotion]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- static poster; not a content image. */}
      <img
        src={poster}
        alt=""
        width={1280}
        height={720}
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      {!reduceMotion ? (
        <video
          ref={ref}
          className="absolute inset-0 -z-20 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-hidden
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
    </>
  );
}
