"use client";

import { useRef, useEffect, useState } from "react";

interface PoseInfo {
  id: number;
  name: string;
  time: number;
  image: string;
}

const POSES: PoseInfo[] = [
  { id: 1, name: "Front Neutral", time: 0.92, image: "/images/avatar/pose-1.jpg" },
  { id: 2, name: "Slight Left", time: 2.25, image: "/images/avatar/pose-2.jpg" },
  { id: 3, name: "Slight Right", time: 3.29, image: "/images/avatar/pose-3.jpg" },
  { id: 4, name: "Looking Upward", time: 4.92, image: "/images/avatar/pose-4.jpg" },
  { id: 5, name: "Arms Crossed", time: 6.62, image: "/images/avatar/pose-5.jpg" },
  { id: 6, name: "Front Smile", time: 7.46, image: "/images/avatar/pose-6.jpg" },
];

export function AvatarVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [prevImage, setPrevImage] = useState("/images/avatar/pose-1.jpg");
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    // Initial load: play intro and settle gracefully on pose 1
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }

    const timer = setTimeout(() => {
      video.pause();
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  const handleNextPose = () => {
    const video = videoRef.current;
    if (!video || isFading) return;

    // Snapshot previous pose image to prevent any black flash
    setPrevImage(POSES[currentIdx].image);
    setIsFading(true);

    const nextIdx = (currentIdx + 1) % POSES.length;
    const nextPose = POSES[nextIdx];

    // Smooth 220ms cross-dissolve to the next golden stable pose
    setTimeout(() => {
      video.currentTime = nextPose.time;
      video.pause();
      setCurrentIdx(nextIdx);

      const handleSeeked = () => {
        setIsFading(false);
      };

      video.addEventListener("seeked", handleSeeked, { once: true });

      // Fallback timeout in case onseeked is delayed
      setTimeout(() => {
        setIsFading(false);
      }, 150);
    }, 200);
  };

  return (
    <div
      onClick={handleNextPose}
      className="relative h-full w-full overflow-hidden select-none cursor-pointer group"
      title={`Pose: ${POSES[currentIdx].name} — Click to switch pose`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextPose();
        }
      }}
      aria-label={`Interactive Avatar — ${POSES[currentIdx].name}. Click to change pose.`}
    >
      {/* Underlying cross-fade snapshot layer (guarantees seamless dissolve without black flash) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={prevImage}
        alt="Avatar previous pose"
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      />

      {/* Main video layer with silky CSS cross-dissolve */}
      <video
        ref={videoRef}
        src="/videos/avatar.mp4"
        poster="/images/avatar/pose-1.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        className={`relative z-10 h-full w-full object-cover transition-opacity duration-300 ease-in-out ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
