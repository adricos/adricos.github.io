"use client";

import { useRef, useEffect, useState } from "react";

interface PoseSlice {
  id: number;
  name: string;
  transStart: number; // Transition departure timestamp
  holdTime: number;   // Stable pose hold timestamp
}

// Exact pose slices and transition cues
const POSE_SLICES: PoseSlice[] = [
  { id: 1, name: "Front Neutral", transStart: 0.0, holdTime: 1.0 },
  { id: 2, name: "Slight Turn Left", transStart: 1.0, holdTime: 2.0 },
  { id: 3, name: "Slight Turn Right", transStart: 2.3, holdTime: 3.4 },
  { id: 4, name: "Looking Upward/Away", transStart: 3.7, holdTime: 4.7 },
  { id: 5, name: "Arms Crossed", transStart: 5.0, holdTime: 6.2 },
  { id: 6, name: "Return to Front", transStart: 6.6, holdTime: 7.8 },
];

export function AvatarVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentPoseIdx, setCurrentPoseIdx] = useState<number>(0);
  const targetStopRef = useRef<number | null>(POSE_SLICES[0].holdTime);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    // Timeupdate listener: pauses cleanly at the targeted pose hold frame
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

    // Initial load: plays Pose 1 (0.0s) and pauses at Pose 1 hold (1.0s)
    targetStopRef.current = POSE_SLICES[0].holdTime;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be restricted in low-power modes; poster is displayed
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

    const nextIdx = (currentPoseIdx + 1) % POSE_SLICES.length;
    setCurrentPoseIdx(nextIdx);

    const nextPose = POSE_SLICES[nextIdx];

    if (nextIdx === 0) {
      // Loop from Pose 6 back to Pose 1
      video.currentTime = 0.0;
    } else {
      // Ensure smooth transition departure from preceding pose boundary
      if (video.currentTime < nextPose.transStart || video.currentTime > nextPose.holdTime) {
        video.currentTime = nextPose.transStart;
      }
    }

    targetStopRef.current = nextPose.holdTime;
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
      title={`Current: ${POSE_SLICES[currentPoseIdx].name} — Click to switch pose`}
      aria-label={`Interactive Adrian Costa Avatar — ${POSE_SLICES[currentPoseIdx].name}. Click to change pose.`}
      onClick={handleNextPose}
      className="h-full w-full object-cover select-none cursor-pointer"
    />
  );
}
