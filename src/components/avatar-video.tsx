"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface PoseTarget {
  name: string;
  time: number;
}

// Focused purely on the 3 consistent head-and-shoulders poses
const POSES: PoseTarget[] = [
  { name: "Front Neutral", time: 0.92 },
  { name: "Slight Left", time: 2.25 },
  { name: "Slight Right", time: 3.62 },
];

export function AvatarVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentPoseIdx, setCurrentPoseIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const cleanupWatchRef = useRef<(() => void) | null>(null);

  // Frame-accurate stopping helper using requestVideoFrameCallback (exact vsync timing)
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

    // Initial page load: Plays smoothly into Pose 1 (Front Neutral) and settles
    playUntilTime(POSES[0].time, () => {
      setCurrentPoseIdx(0);
    });

    return () => {
      if (cleanupWatchRef.current) {
        cleanupWatchRef.current();
      }
    };
  }, [playUntilTime]);

  const handleNextPose = () => {
    const video = videoRef.current;
    if (!video || isFading) return;

    const nextIdx = (currentPoseIdx + 1) % POSES.length;
    setCurrentPoseIdx(nextIdx);
    const targetPose = POSES[nextIdx];

    // If moving forward (Neutral -> Left -> Right), animate continuously through the video motion
    if (targetPose.time > video.currentTime && targetPose.time - video.currentTime < 2.0) {
      playUntilTime(targetPose.time);
    } else {
      // When cycling from Pose 3 (Right) back to Pose 1 (Front), execute a smooth cross-dissolve
      setIsFading(true);
      setTimeout(() => {
        video.currentTime = 0.0;
        playUntilTime(POSES[0].time, () => {
          setIsFading(false);
        });

        // Safety fallback to restore opacity
        setTimeout(() => setIsFading(false), 250);
      }, 200);
    }
  };

  return (
    <div
      onClick={handleNextPose}
      className="relative h-full w-full overflow-hidden select-none cursor-pointer group"
      title={`Pose: ${POSES[currentPoseIdx].name} — Click to switch pose`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextPose();
        }
      }}
      aria-label={`Interactive Avatar — ${POSES[currentPoseIdx].name}. Click to change pose.`}
    >
      <video
        ref={videoRef}
        src="/videos/avatar.mp4"
        poster="/images/avatar/pose-1.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        className={`h-full w-full object-cover transition-opacity duration-300 ease-in-out ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
