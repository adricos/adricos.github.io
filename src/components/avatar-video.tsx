"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface PoseTarget {
  id: number;
  name: string;
  time: number;
}

// Pose 3 extended to 3.95s for a longer, more relaxed hold looking to the right
const POSE_MAP: Record<number, PoseTarget> = {
  1: { id: 1, name: "Front Neutral", time: 0.92 },
  2: { id: 2, name: "Slight Left", time: 2.25 },
  3: { id: 3, name: "Slight Right", time: 3.95 },
};

// Ping-pong sequence: 1 -> 2 -> 3 -> 2 -> (loops back to 1)
const SEQUENCE: number[] = [1, 2, 3, 2];

export function AvatarVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [seqIdx, setSeqIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const cleanupWatchRef = useRef<(() => void) | null>(null);

  const currentPose = POSE_MAP[SEQUENCE[seqIdx]];

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

    // Initial load: plays smoothly into Pose 1 (Front Neutral) and holds
    playUntilTime(POSE_MAP[1].time, () => {
      setSeqIdx(0);
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

    const nextSeqIdx = (seqIdx + 1) % SEQUENCE.length;
    setSeqIdx(nextSeqIdx);
    const targetPose = POSE_MAP[SEQUENCE[nextSeqIdx]];

    // Moving forward on the timeline (1 -> 2, 2 -> 3): animate continuously via video motion
    if (targetPose.time > video.currentTime && targetPose.time - video.currentTime < 2.5) {
      playUntilTime(targetPose.time);
    } else {
      // Moving backward (3 -> 2, 2 -> 1): execute a smooth 200ms cross-dissolve to eliminate hard snaps
      setIsFading(true);
      setTimeout(() => {
        video.currentTime = targetPose.time;
        video.pause();

        const handleSeeked = () => {
          setIsFading(false);
        };
        video.addEventListener("seeked", handleSeeked, { once: true });

        // Safety fallback to restore opacity
        setTimeout(() => setIsFading(false), 200);
      }, 180);
    }
  };

  return (
    <div
      onClick={handleNextPose}
      className="relative h-full w-full overflow-hidden select-none cursor-pointer group"
      title={`Pose ${currentPose.id}: ${currentPose.name} — Click to cycle (${SEQUENCE.map(
        (id, idx) => (idx === seqIdx ? `[${id}]` : id)
      ).join(" → ")})`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNextPose();
        }
      }}
      aria-label={`Interactive Avatar — ${currentPose.name}. Click to change pose.`}
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
