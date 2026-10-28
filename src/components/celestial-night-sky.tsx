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
  const hasTriggeredDayRef = useRef<boolean>(false);
  const [isWarping, setIsWarping] = useState<boolean>(false);

  // Listen to spiral hover events to cycle celestial hours until dawn
  useEffect(() => {
    const handleStart = () => {
      isAdvancingRef.current = true;
    };

    const handleEnd = () => {
      isAdvancingRef.current = false;
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

      // Diurnal rotation of the Milky Way around Earth's axis
      if (isAdvancingRef.current) {
        milkyWayMesh.rotation.y += (2.6 / 24) * Math.PI * 2 * dt;
      } else {
        milkyWayMesh.rotation.y += 0.006 * dt;
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

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Advance celestial time when hovering the spiral
      if (isAdvancingRef.current) {
        const hoursPerSec = 3.0;
        hourRef.current = (hourRef.current + dt * hoursPerSec) % 24;

        // When morning daylight is reached, trigger warp into the secret vector arcade
        if (
          !hasTriggeredDayRef.current &&
          hourRef.current >= 7.5 &&
          hourRef.current <= 15.0
        ) {
          hasTriggeredDayRef.current = true;
          setIsWarping(true);
          setTimeout(() => {
            router.push("/galaga");
          }, 350);
        }
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

      {/* Daybreak Hyperspace Warp Transition Overlay */}
      {isWarping && (
        <div
          className="fixed inset-0 z-50 pointer-events-none bg-sky-100 dark:bg-white animate-pulse transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
    </>
  );
}
