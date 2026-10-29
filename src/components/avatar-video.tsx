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
  const isHoveredRef = useRef(false);
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

    const requestNextFrame = () => {
      if (!active || !video) return;
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

    const handleFrame = (
      _now: DOMHighResTimeStamp,
      metadata?: { mediaTime: number }
    ) => {
      if (!active || !video) return;

      // While hovered with mouse: loop continuously through 1 -> 2 -> 3 -> 2 -> 1 motion
      if (isHoveredRef.current) {
        if (video.currentTime >= 7.00) {
          video.currentTime = STEPS[0].time; // Loop back to 0.92s cleanly
        }
        if (video.paused) {
          video.play().catch(() => {});
        }
        requestNextFrame();
        return;
      }

      // While not hovered: stop on the exact target resting frame
      const curTime = metadata?.mediaTime ?? video.currentTime;
      if (curTime >= targetTime) {
        video.pause();
        active = false;
        if (onDone) onDone();
        return;
      }

      requestNextFrame();
    };

    video.play().catch(() => {});
    requestNextFrame();

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

  const handlePointerEnter = (e: React.PointerEvent) => {
    // Only engage hover loop for actual mouse pointers (prevents sticking on touchscreens)
    if (e.pointerType === "touch") return;
    const video = videoRef.current;
    if (!video) return;

    isHoveredRef.current = true;
    playUntilTime(STEPS[2].time);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const video = videoRef.current;
    if (!video) return;

    isHoveredRef.current = false;

    // Settle gracefully on the next upcoming resting pose
    const curTime = video.currentTime;
    const nextStepIdx = STEPS.findIndex((s) => s.time > curTime);
    if (nextStepIdx === -1) {
      video.currentTime = STEPS[0].time;
      video.pause();
      setCurrentStep(0);
      return;
    }

    setCurrentStep(nextStepIdx);
    playUntilTime(STEPS[nextStepIdx].time);
  };

  const handleNextPose = () => {
    const video = videoRef.current;
    if (!video) return;

    // A direct click temporarily disables the hover loop so the user can step manually
    isHoveredRef.current = false;

    let nextStep = currentStep + 1;

    // If we reached the end of the return (7.00s), wrap to Step 1 (2.25s)
    if (nextStep >= STEPS.length) {
      video.currentTime = STEPS[0].time;
      nextStep = 1;
    }

    setCurrentStep(nextStep);
    const target = STEPS[nextStep];
    playUntilTime(target.time);
  };

  return (
    <div
      onClick={handleNextPose}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="relative h-full w-full overflow-hidden select-none cursor-pointer group"
      title={`Current: ${activePose.name} (Pose ${activePose.poseId}) — Hover or click to animate`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextPose();
        }
      }}
      aria-label={`Interactive Avatar — ${activePose.name}. Hover or click to animate.`}
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
