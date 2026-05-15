"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GRID_SIZE = 40;
const DOT_COUNT = GRID_SIZE * GRID_SIZE;
const SPACING = 0.5;
const PERIOD = 12; // seconds for one full sine cycle
const AMPLITUDE = 0.08;

function DotGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Pause when tab not visible
  useEffect(() => {
    const handler = () => {
      pausedRef.current = document.visibilityState !== "visible";
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // Create the tiny sphere geometry and material once
  const geometry = useMemo(() => new THREE.SphereGeometry(0.02, 6, 6), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#a78bfa"),
        transparent: true,
        opacity: 0.06,
      }),
    []
  );

  // Pre-compute base positions
  const basePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const offset = ((GRID_SIZE - 1) * SPACING) / 2;
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        positions.push([
          i * SPACING - offset,
          j * SPACING - offset,
          0,
        ]);
      }
    }
    return positions;
  }, []);

  // Initialize instance matrices
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    basePositions.forEach(([x, y, z], idx) => {
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [basePositions]);

  // Animate: sine wave drift
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    if (pausedRef.current || reducedMotionRef.current) return;

    const t = clock.getElapsedTime();
    const dummy = new THREE.Object3D();

    basePositions.forEach(([x, y], idx) => {
      const wave = Math.sin((t / PERIOD) * Math.PI * 2 + x * 0.8 + y * 0.6);
      dummy.position.set(x, y, wave * AMPLITUDE);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(idx, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, DOT_COUNT]}
    />
  );
}

export default function DottedSurface() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{
          position: [0, -2, 14],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
        }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <DotGrid />
      </Canvas>
    </div>
  );
}
