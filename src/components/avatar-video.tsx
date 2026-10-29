"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface StepTarget {
  poseId: number;
  name: string;
  time: number;
}

// Seamless 1 -> 2 -> 3 -> 2 -> 1 video timeline (169 frames @ 24fps, 7.04s)
// Pose 1 (Center Front) -> Pose 2 (Left) -> Pose 3 (Right) -> Pose 2 (Left) -> Pose 1 (Center Front)
const STEPS: StepTarget[] = [
  { poseId: 1, name: "Front Neutral", time: 0.92 },
  { poseId: 2, name: "Slight Left", time: 2.25 },
  { poseId: 3, name: "Slight Right", time: 3.96 },
  { poseId: 2, name: "Slight Left (Return)", time: 5.67 },
  { poseId: 1, name: "Front Neutral (Return)", time: 7.00 },
];

export function AvatarVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const cleanupWatchRef = useRef<(() => void) | null>(null);

  const activePose = STEPS[currentStep];

  // Frame-accurate stopping helper using requestVideoFrameCallback
  const playUntilTime = useCallback((targetTime: number, onDone?: () => void) => {
    const video = videoRef.current;
    if (!video) return;

    if (cleanupWatchRef.current) {
      cleanupWatchRef.current();
      cleanupWatchRef.current = null;
    }

    let active = true;

    const handleFrame = (
      _now: DOMHighResTimeStamp,
      metadata?: { mediaTime: number }
    ) => {
      if (!active || !video) return;
      const curTime = metadata?.mediaTime ?? video.currentTime;

      if (curTime >= targetTime) {
        video.pause();
        active = false;
        if (onDone) onDone();
        return;
      }

      if ("requestVideoFrameCallback" in video) {
        (
          video as HTMLVideoElement & {
            requestVideoFrameCallback: (
              cb: (now: DOMHighResTimeStamp, meta: { mediaTime: number }) => void
            ) => number;
          }
        ).requestVideoFrameCallback(handleFrame);
      } else {
        requestAnimationFrame(() => handleFrame(performance.now()));
      }
    };

    video.play().catch(() => {});

    if ("requestVideoFrameCallback" in video) {
      (
        video as HTMLVideoElement & {
          requestVideoFrameCallback: (
            cb: (now: DOMHighResTimeStamp, meta: { mediaTime: number }) => void
          ) => number;
        }
      ).requestVideoFrameCallback(handleFrame);
    } else {
      requestAnimationFrame(() => handleFrame(performance.now()));
    }

    cleanupWatchRef.current = () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    // Initial page load: Plays into Pose 1 (0.92s) and settles
    playUntilTime(STEPS[0].time, () => {
      setCurrentStep(0);
    });

    return () => {
      if (cleanupWatchRef.current) {
        cleanupWatchRef.current();
      }
    };
  }, [playUntilTime]);

  const handleNextPose = () => {
    const video = videoRef.current;
    if (!video) return;

    let nextStep = currentStep + 1;

    // If we were at the end of the return (Pose 1 at 7.00s), wrap to Step 1 (Pose 2 at 2.25s)
    if (nextStep >= STEPS.length) {
      // 7.00s and 0.92s are identical Pose 1 frames, so reset time cleanly with zero visual jump
      video.currentTime = STEPS[0].time;
      nextStep = 1;
    }

    setCurrentStep(nextStep);
    const target = STEPS[nextStep];

    // Every step moves forward in video time with real 24fps motion
    playUntilTime(target.time);
  };

  return (
    <div
      onClick={handleNextPose}
      className="relative h-full w-full overflow-hidden select-none cursor-pointer group"
      title={`Current: ${activePose.name} (Pose ${activePose.poseId}) — Click to cycle (1 ➔ 2 ➔ 3 ➔ 2 ➔ 1)`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextPose();
        }
      }}
      aria-label={`Interactive Avatar — ${activePose.name}. Click to cycle pose.`}
    >
      <video
        ref={videoRef}
        src="/videos/avatar.mp4"
        poster="/images/avatar/pose-1.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover select-none"
      />
    </div>
  );
}
