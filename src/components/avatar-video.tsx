"use client";

import { useRef, useEffect, useState, useCallback } from "react";

/**
 * InteractiveAvatar
 *
 * Implements a cursor- and touch-controlled interactive avatar using a single pre-rendered video.
 * Dynamic distance-based tracking for both desktop cursor and mobile touch press:
 *   - Inside container bounds: Stays at 50% (looking forward, direct eye contact with subtle warm smile).
 *   - Left of container: Proportional continuous rotation from 50% down to 0% (looking left)
 *     based on the finger/cursor distance to the left edge of the screen.
 *   - Right of container: Proportional continuous rotation from 50% up to 100% (looking right)
 *     based on the finger/cursor distance to the right edge of the screen.
 *   - Releasing touch or leaving window: Smoothly glides back to 50% (direct frontal eye contact).
 *
 * All frames are interpolated smoothly via requestAnimationFrame using frame-rate independent
 * exponential smoothing, ensuring zero jitter, no autoplay, and zero CPU usage when idle.
 */
export function AvatarVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [hasMetadata, setHasMetadata] = useState(false);
  const [hasError, setHasError] = useState(false);

  const durationRef = useRef<number>(0);
  const targetTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const lastRafTimeRef = useRef<number>(0);
  const prefersReducedMotionRef = useRef<boolean>(false);
  const animateScrubRef = useRef<(() => void) | null>(null);

  const cancelAnimation = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const animateScrub = useCallback(() => {
    const video = videoRef.current;
    if (!video || durationRef.current <= 0) return;

    if (prefersReducedMotionRef.current) {
      video.currentTime = targetTimeRef.current;
      cancelAnimation();
      return;
    }

    const now = performance.now();
    const dt = lastRafTimeRef.current > 0 ? Math.min((now - lastRafTimeRef.current) / 1000, 0.08) : 0.016;
    lastRafTimeRef.current = now;

    const current = video.currentTime;
    const target = targetTimeRef.current;
    const diff = target - current;

    // Threshold ~15ms (less than 1 frame at 24fps)
    if (Math.abs(diff) < 0.02) {
      video.currentTime = target;
      cancelAnimation();
      return;
    }

    // Frame-rate independent exponential smoothing (lambda = 12 for responsive, natural human head movement)
    const factor = 1 - Math.exp(-12 * dt);
    const nextTime = current + diff * factor;

    video.currentTime = Math.max(0, Math.min(durationRef.current, nextTime));

    if (animateScrubRef.current) {
      rafIdRef.current = requestAnimationFrame(animateScrubRef.current);
    }
  }, [cancelAnimation]);

  useEffect(() => {
    animateScrubRef.current = animateScrub;
  }, [animateScrub]);

  const setTargetRatio = useCallback(
    (ratio: number) => {
      const duration = durationRef.current;
      if (duration <= 0) return;

      const clampedRatio = Math.max(0, Math.min(1, ratio));
      targetTimeRef.current = clampedRatio * duration;

      if (rafIdRef.current === null) {
        lastRafTimeRef.current = performance.now();
        rafIdRef.current = requestAnimationFrame(animateScrub);
      }
    },
    [animateScrub]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotionRef.current = mediaQuery.matches;
      const onMotionChange = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
      };
      mediaQuery.addEventListener("change", onMotionChange);
      return () => mediaQuery.removeEventListener("change", onMotionChange);
    }
  }, []);

  // Window-level tracking for both desktop cursor and mobile touch press
  useEffect(() => {
    if (!hasMetadata) return;

    const handlePosition = (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      // Inside container: strictly 50% (direct frontal eye contact with smile)
      const isInside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (isInside) {
        setTargetRatio(0.5);
      } else if (clientX < rect.left) {
        // Left side: map distance from container left edge to screen left edge into [0.5 -> 0.0]
        const maxDistLeft = Math.max(rect.left, 80);
        const dist = rect.left - clientX;
        const norm = Math.min(1, Math.max(0, dist / maxDistLeft));
        setTargetRatio(0.5 - 0.5 * norm);
      } else if (clientX > rect.right) {
        // Right side: map distance from container right edge to screen right edge into [0.5 -> 1.0]
        const maxDistRight = Math.max(window.innerWidth - rect.right, 80);
        const dist = clientX - rect.right;
        const norm = Math.min(1, Math.max(0, dist / maxDistRight));
        setTargetRatio(0.5 + 0.5 * norm);
      } else {
        // Directly vertical (above/below the container column)
        setTargetRatio(0.5);
      }
    };

    // Desktop pointer movement
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // Touch handled by touch events
      handlePosition(e.clientX, e.clientY);
    };

    const handleMouseLeaveDoc = () => {
      setTargetRatio(0.5);
    };

    // Mobile touch tracking: detect where the finger is pressing across the screen
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      // Finger released: return smoothly to frontal smile
      setTargetRatio(0.5);
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("mouseleave", handleMouseLeaveDoc);

    // Passive touch listeners to track finger position without blocking native page scroll
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handleMouseLeaveDoc);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      cancelAnimation();
    };
  }, [hasMetadata, setTargetRatio, cancelAnimation]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) {
      setHasError(true);
      return;
    }

    const duration = video.duration;
    durationRef.current = duration;

    const midPoint = duration / 2;
    targetTimeRef.current = midPoint;
    video.currentTime = midPoint;
    video.pause();

    setHasMetadata(true);
  };

  const handleClick = () => {
    const duration = durationRef.current;
    if (duration <= 0) return;

    const current = targetTimeRef.current;
    const mid = duration / 2;

    if (Math.abs(current - mid) < 0.1) {
      setTargetRatio(0);
    } else if (Math.abs(current) < 0.1) {
      setTargetRatio(1);
    } else {
      setTargetRatio(0.5);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onPointerEnter={() => setTargetRatio(0.5)}
      className="relative h-full w-full overflow-hidden select-none cursor-pointer group bg-zinc-950"
      title="Interactive Avatar — Head rotation tracks cursor or mobile touch position"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="Interactive Avatar. Move cursor or press on mobile to control head rotation."
    >
      <video
        ref={videoRef}
        src="/videos/avatar.mp4"
        poster="/images/avatar/pose-1.jpg"
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover select-none pointer-events-none transition-opacity duration-300 ${
          hasError ? "opacity-0" : "opacity-100"
        }`}
      />

      {hasError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/avatar/pose-1.jpg"
          alt="Adrian Costa"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
