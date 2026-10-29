"use client";

import { useRef, useEffect } from "react";

export function AvatarVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Guarantee properties for mobile WebKit & Blink
    video.muted = true;
    video.playsInline = true;

    const handleEnded = () => {
      video.pause();
    };

    video.addEventListener("ended", handleEnded);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay might be restricted in low-power modes; poster is displayed
      });
    }

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  return (
    <video
      ref={videoRef}
      src="/videos/avatar.mp4"
      poster="/images/avatar-final.jpg"
      autoPlay
      muted
      playsInline
      preload="auto"
      aria-label="Adrian Costa"
      onClick={handleReplay}
      className="h-full w-full object-cover select-none"
    />
  );
}
