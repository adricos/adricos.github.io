"use client";

import { useRef, useEffect, useState } from "react";

// Distinct poses generated in gemini_generated_video_ee2d00ce.mp4 (10.01s @ 24fps)
const POSES = [
  { name: "Front Neutral", start: 0.0, stop: 1.3 },
  { name: "Slight Left", start: 1.3, stop: 2.6 },
  { name: "Slight Right", start: 2.6, stop: 4.1 },
  { name: "Looking Away", start: 4.1, stop: 5.3 },
  { name: "Arms Crossed", start: 5.3, stop: 7.6 },
  { name: "Return Front", start: 7.6, stop: 9.6 },
];

export function AvatarVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentPoseIdx, setCurrentPoseIdx] = useState<number>(0);
  const targetStopRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Guarantee properties for mobile WebKit & Blink
    video.muted = true;
    video.playsInline = true;

    // Timeupdate listener to hold cleanly at the stable end of the targeted pose
    const handleTimeUpdate = () => {
      if (targetStopRef.current !== null && video.currentTime >= targetStopRef.current) {
        video.pause();
        targetStopRef.current = null;
      }
    };

    const handleEnded = () => {
      video.pause();
      targetStopRef.current = null;
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Initial load: Play sequence
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be deferred on low-power mode; poster is displayed
      });
    }

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleNextPose = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextIdx = (currentPoseIdx + 1) % POSES.length;
    setCurrentPoseIdx(nextIdx);

    const targetPose = POSES[nextIdx];
    video.currentTime = targetPose.start;
    targetStopRef.current = targetPose.stop;
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
      title="Click avatar to change pose"
      aria-label="Interactive Adrian Costa Avatar — Click to change pose"
      onClick={handleNextPose}
      className="h-full w-full object-cover select-none cursor-pointer"
    />
  );
}
