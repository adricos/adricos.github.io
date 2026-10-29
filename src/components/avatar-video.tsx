"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface PoseTarget {
  name: string;
  time: number;
}

const POSES: PoseTarget[] = [
  { name: "Front Neutral", time: 0.92 },
  { name: "Slight Left", time: 2.25 },
  { name: "Slight Right", time: 3.62 },
  { name: "Looking Upward", time: 4.92 },
  { name: "Arms Crossed", time: 6.62 },
  { name: "Front Smile", time: 7.75 },
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

    // Use requestVideoFrameCallback for exact hardware decoder frame synchronization
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

    // Initial page load: Play the full natural video sequence, landing on Pose 6 (Front Smile)
    playUntilTime(POSES[POSES.length - 1].time, () => {
      setCurrentPoseIdx(POSES.length - 1);
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

    // If moving forward in time from current position, animate continuously through the transition
    if (targetPose.time > video.currentTime && targetPose.time - video.currentTime < 2.5) {
      playUntilTime(targetPose.time);
    } else {
      // If looping back or seeking, execute a graceful cross-fade dissolve to eliminate harsh cuts
      setIsFading(true);
      setTimeout(() => {
        video.currentTime = targetPose.time;
        video.pause();

        const handleSeeked = () => {
          setIsFading(false);
        };
        video.addEventListener("seeked", handleSeeked, { once: true });

        // Fallback in case seek event resolves quickly
        setTimeout(() => setIsFading(false), 200);
      }, 200);
    }
  };

  return (
    <div
      onClick={handleNextPose}
      className="relative h-full w-full overflow-hidden select-none cursor-pointer group"
      title={`Pose: ${POSES[currentPoseIdx].name} — Click to animate to next pose`}
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
