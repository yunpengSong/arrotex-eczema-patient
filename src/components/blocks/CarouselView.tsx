"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Client-side carousel: a scroll-snap track with prev/next arrows and
// pagination dots. The slides themselves are rendered on the server and
// passed in as children.
export default function CarouselView({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  // Wraps around: one slide before the first goes to the last and vice versa
  const go = (dir: number) => {
    const track = trackRef.current;
    if (!track || count === 0) return;
    const max = count - 1;
    let next = Math.round(track.scrollLeft / track.clientWidth) + dir;
    if (next < 0) next = max;
    if (next > max) next = 0;
    goTo(next);
  };

  // Follow manual scrolling (touch/swipe) to keep the dots in sync
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      setActive(Math.round(track.scrollLeft / track.clientWidth));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="carousel-view">
      <button
        type="button"
        className="carousel-arrow"
        aria-label="Previous"
        onClick={() => go(-1)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 5l-7 7 7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="carousel-track" ref={trackRef}>
        {children}
      </div>

      <button
        type="button"
        className="carousel-arrow"
        aria-label="Next"
        onClick={() => go(1)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="carousel-dots">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            className={`carousel-dot${i === active ? " active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
