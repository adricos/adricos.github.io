"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * clamped),
    Math.round(c1[1] + (c2[1] - c1[1]) * clamped),
    Math.round(c1[2] + (c2[2] - c1[2]) * clamped),
  ];
}

function getSkyAtmosphere(hour: number) {
  const h = ((hour % 24) + 24) % 24;

  let topColor: [number, number, number];
  let bottomColor: [number, number, number];
  let skyOverlayAlpha = 0;

  if (h >= 21 || h < 5.0) {
    // Pure Night Sky (Full Milky Way Visibility)
    topColor = [3, 7, 18];
    bottomColor = [10, 15, 30];
    skyOverlayAlpha = 0;
  } else if (h >= 5.0 && h < 7.5) {
    // Dawn / Sunrise: Golden horizon breaks, stars fade
    const progress = (h - 5.0) / 2.5;
    topColor = lerpColor([3, 7, 18], [2, 132, 199], progress);
    bottomColor = lerpColor([15, 23, 42], [234, 88, 12], Math.min(1, progress * 1.3));
    if (progress > 0.5) {
      bottomColor = lerpColor([234, 88, 12], [251, 146, 60], (progress - 0.5) / 0.5);
    }
    skyOverlayAlpha = Math.min(0.9, progress * 1.1);
  } else if (h >= 7.5 && h < 17.0) {
    // Full Daylight: Rich, pleasant azure sky (prevents text washout)
    topColor = [2, 132, 199];
    bottomColor = [56, 189, 248];
    skyOverlayAlpha = 0.92;
  } else {
    // Dusk / Sunset
    const progress = (h - 17.0) / 4.0;
    topColor = lerpColor([2, 132, 199], [3, 7, 18], progress);
    if (progress < 0.5) {
      bottomColor = lerpColor([56, 189, 248], [225, 29, 72], progress * 2);
    } else {
      bottomColor = lerpColor([225, 29, 72], [15, 23, 42], (progress - 0.5) * 2);
    }
    skyOverlayAlpha = Math.max(0, 0.92 - progress * 1.1);
  }

  return { topColor, bottomColor, skyOverlayAlpha };
}

export function CelestialNightSky() {
  const router = useRouter();
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const hourRef = useRef<number>(22.5); // Night over Rosario
  const isAdvancingRef = useRef<boolean>(false);
  const advanceDurationRef = useRef<number>(0);
  const hasTriggeredDayRef = useRef<boolean>(false);
  const [isWarping, setIsWarping] = useState<boolean>(false);

  // Listen to spiral hover events to cycle celestial hours until dawn
  useEffect(() => {
    const handleStart = () => {
      isAdvancingRef.current = true;
    };

    const handleEnd = () => {
      isAdvancingRef.current = false;
      advanceDurationRef.current = 0;
    };

    window.addEventListener("celestial-time-advance-start", handleStart);
    window.addEventListener("celestial-time-advance-end", handleEnd);

    return () => {
      window.removeEventListener("celestial-time-advance-start", handleStart);
      window.removeEventListener("celestial-time-advance-end", handleEnd);
    };
  }, []);

  // Three.js 360° Milky Way Skybox
  useEffect(() => {
    const container = threeMountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 2000);
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // High-resolution Milky Way Skybox
    const textureLoader = new THREE.TextureLoader();
    const milkyWayGeo = new THREE.SphereGeometry(600, 60, 40);
    const milkyWayTex = textureLoader.load("/images/space/milkyway.png");
    milkyWayTex.colorSpace = THREE.SRGBColorSpace;
    const milkyWayMat = new THREE.MeshBasicMaterial({
      map: milkyWayTex,
      side: THREE.BackSide,
      color: 0xeeeeee,
    });
    const milkyWayMesh = new THREE.Mesh(milkyWayGeo, milkyWayMat);
    // Align celestial sphere with the South Celestial Pole (Rosario -33° Lat)
    milkyWayMesh.rotation.x = 0.58; // ~33° elevation of South Celestial Pole
    scene.add(milkyWayMesh);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    let lastTime = performance.now();

    const animateThree = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Diurnal rotation of the Milky Way with dramatic warp speed acceleration
      if (isAdvancingRef.current) {
        // Warp multiplier builds exponentially from 1.0 up to 12.0!
        const warpMultiplier =
          1.0 + Math.pow(advanceDurationRef.current * 1.5, 2.2);
        milkyWayMesh.rotation.y += 0.35 * warpMultiplier * dt;

        // Optical warp stretch: camera FOV widens as warp engages
        const targetFov = 55 + Math.min(26, warpMultiplier * 2.2);
        camera.fov += (targetFov - camera.fov) * 0.1;
        camera.updateProjectionMatrix();
      } else {
        milkyWayMesh.rotation.y += 0.006 * dt;
        if (camera.fov > 55.2) {
          camera.fov += (55 - camera.fov) * 0.1;
          camera.updateProjectionMatrix();
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animateThree);
    };

    animationFrameId = requestAnimationFrame(animateThree);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      milkyWayGeo.dispose();
      milkyWayMat.dispose();
      milkyWayTex.dispose();
    };
  }, []);

  // 2D Overlay Canvas for Dynamic Atmospheric Glow (Dawn / Sunrise / Sunset)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Radial Hyperspace Warp Stars
    interface WarpStar {
      x: number;
      y: number;
      z: number;
      pz: number;
    }
    const warpStars: WarpStar[] = [];
    for (let i = 0; i < 110; i++) {
      warpStars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000 + 1,
        pz: 1000,
      });
    }

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Advance celestial time with warp velocity acceleration
      if (isAdvancingRef.current) {
        advanceDurationRef.current += dt;
        const warpMultiplier =
          1.0 + Math.pow(advanceDurationRef.current * 1.5, 2.2);
        const hoursPerSec = 0.9 * warpMultiplier;
        hourRef.current = (hourRef.current + dt * hoursPerSec) % 24;

        // When morning daylight is reached, trigger warp into the secret vector arcade
        if (
          !hasTriggeredDayRef.current &&
          hourRef.current >= 7.5 &&
          hourRef.current <= 15.0
        ) {
          hasTriggeredDayRef.current = true;
          setIsWarping(true);
          router.push("/galaga");
        }
      } else {
        advanceDurationRef.current = 0;
      }

      ctx.clearRect(0, 0, width, height);

      const { topColor, bottomColor, skyOverlayAlpha } = getSkyAtmosphere(hourRef.current);

      // Atmospheric Sky Overlay (fades in as dawn approaches and daylight breaks)
      if (skyOverlayAlpha > 0.01) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(
          0,
          `rgba(${topColor[0]}, ${topColor[1]}, ${topColor[2]}, ${skyOverlayAlpha.toFixed(3)})`
        );
        skyGrad.addColorStop(
          1,
          `rgba(${bottomColor[0]}, ${bottomColor[1]}, ${bottomColor[2]}, ${skyOverlayAlpha.toFixed(3)})`
        );
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Render Hyperspace Warp Speed Lines when accelerating
      if (advanceDurationRef.current > 0.3) {
        const cx = width / 2;
        const cy = height / 2;
        const warpSpeed = Math.min(75, Math.pow(advanceDurationRef.current, 2.3) * 14);
        const streakAlpha = Math.min(0.85, (advanceDurationRef.current - 0.3) * 0.7);

        ctx.lineWidth = 1.6;
        ctx.strokeStyle = `rgba(255, 255, 255, ${streakAlpha.toFixed(2)})`;

        for (let i = 0; i < warpStars.length; i++) {
          const ws = warpStars[i];
          ws.pz = ws.z;
          ws.z -= warpSpeed;

          if (ws.z <= 0) {
            ws.z = 1000;
            ws.pz = 1000;
            ws.x = (Math.random() - 0.5) * 2000;
            ws.y = (Math.random() - 0.5) * 2000;
          }

          const k = 320 / ws.z;
          const px = ws.x * k + cx;
          const py = ws.y * k + cy;

          const pk = 320 / ws.pz;
          const prevX = ws.x * pk + cx;
          const prevY = ws.y * pk + cy;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(px, py);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [router]);

  return (
    <>
      {/* 360° Real Milky Way Skybox Container */}
      <div
        ref={threeMountRef}
        className="pointer-events-none fixed inset-0 -z-20 h-full w-full overflow-hidden"
        aria-hidden="true"
      />

      {/* 2D Atmosphere Overlay (fades in dawn / daylight on spiral hover) */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
        aria-hidden="true"
      />

      {/* Solid Daybreak Hyperspace Warp Transition Overlay (z-[100] covers entire screen, preventing any flash of main page) */}
      {isWarping && (
        <div
          className="fixed inset-0 z-[100] pointer-events-auto bg-white transition-opacity duration-300 opacity-100"
          aria-hidden="true"
        />
      )}
    </>
  );
}
