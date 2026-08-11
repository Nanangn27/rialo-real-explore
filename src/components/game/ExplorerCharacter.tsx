import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group, Mesh } from "three";
import { useDeviceProfile, usePageVisible, type DeviceProfile } from "@/game/useDeviceProfile";

/**
 * Drives the on-demand render loop at a capped frame rate and stops entirely
 * when the tab is hidden, so mobile browsers don't burn battery in background.
 */
function FrameLimiter({ fps, active }: { fps: number; active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = 0;
    const interval = 1000 / fps;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < interval) return;
      last = t;
      invalidate();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps, active, invalidate]);
  return null;
}

/**
 * Lightweight low-poly explorer avatar built from primitives (no model download).
 * Idle bob when still, marching limbs when GPS movement is detected.
 */
function ExplorerRig({ walking, profile }: { walking: boolean; profile: DeviceProfile }) {
  const root = useRef<Group>(null);
  const legL = useRef<Mesh>(null);
  const legR = useRef<Mesh>(null);
  const armL = useRef<Mesh>(null);
  const armR = useRef<Mesh>(null);
  const seg = profile.segments;
  const motion = profile.reducedMotion ? 0.35 : 1;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = walking ? 7 : 1.4;
    const swing = (walking ? 0.7 : 0.08) * motion;
    if (root.current) {
      root.current.position.y =
        (walking ? Math.abs(Math.sin(t * speed)) * 0.06 : Math.sin(t * 1.6) * 0.04) * motion;
      root.current.rotation.y =
        (walking ? Math.sin(t * speed * 0.5) * 0.08 : Math.sin(t * 0.6) * 0.25) * motion;
    }
    const phase = Math.sin(t * speed) * swing;
    if (legL.current) legL.current.rotation.x = phase;
    if (legR.current) legR.current.rotation.x = -phase;
    if (armL.current) armL.current.rotation.x = -phase * 0.8;
    if (armR.current) armR.current.rotation.x = phase * 0.8;
  });

  return (
    <group ref={root} position={[0, -0.35, 0]} scale={1.05}>
      {/* backpack */}
      <mesh position={[0, 0.5, -0.24]}>
        <boxGeometry args={[0.36, 0.4, 0.18]} />
        <meshStandardMaterial color="#1b1c1f" roughness={0.6} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 0.52, 0]}>
        <capsuleGeometry args={[0.22, 0.34, 4, seg.capsule]} />
        <meshStandardMaterial color="#2f6df6" roughness={0.4} metalness={0.15} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.98, 0]}>
        <sphereGeometry args={[0.21, seg.sphere, seg.sphere]} />
        <meshStandardMaterial color="#f2c8a2" roughness={0.7} />
      </mesh>
      {/* explorer cap */}
      <mesh position={[0, 1.11, 0]}>
        <cylinderGeometry args={[0.235, 0.235, 0.08, seg.cylinder]} />
        <meshStandardMaterial color="#18e39a" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.06, 0.18]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.34, 0.04, 0.2]} />
        <meshStandardMaterial color="#18e39a" roughness={0.4} />
      </mesh>
      {/* arms */}
      <mesh ref={armL} position={[-0.3, 0.62, 0]}>
        <capsuleGeometry args={[0.075, 0.3, 4, Math.max(6, seg.capsule - 2)]} />
        <meshStandardMaterial color="#2453c9" roughness={0.5} />
      </mesh>
      <mesh ref={armR} position={[0.3, 0.62, 0]}>
        <capsuleGeometry args={[0.075, 0.3, 4, Math.max(6, seg.capsule - 2)]} />
        <meshStandardMaterial color="#2453c9" roughness={0.5} />
      </mesh>
      {/* legs */}
      <mesh ref={legL} position={[-0.12, 0.16, 0]}>
        <capsuleGeometry args={[0.085, 0.28, 4, Math.max(6, seg.capsule - 2)]} />
        <meshStandardMaterial color="#23262d" roughness={0.6} />
      </mesh>
      <mesh ref={legR} position={[0.12, 0.16, 0]}>
        <capsuleGeometry args={[0.085, 0.28, 4, Math.max(6, seg.capsule - 2)]} />
        <meshStandardMaterial color="#23262d" roughness={0.6} />
      </mesh>
      {/* soft ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[0.34, seg.circle]} />
        <meshBasicMaterial color="#0b1b33" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

export function ExplorerCharacter({ walking }: { walking: boolean }) {
  const profile = useDeviceProfile();
  const visible = usePageVisible();

  return (
    <Canvas
      frameloop="demand"
      dpr={profile.dpr}
      gl={{
        antialias: profile.antialias,
        alpha: true,
        powerPreference: profile.tier === "high" ? "high-performance" : "low-power",
      }}
      camera={{ position: [0, 0.9, 3.1], fov: 34 }}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <FrameLimiter fps={profile.targetFps} active={visible} />
      <ambientLight intensity={profile.richLighting ? 1.15 : 1.45} />
      <directionalLight position={[3, 6, 4]} intensity={1.5} />
      {profile.richLighting && (
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#bfe3ff" />
      )}
      <ExplorerRig walking={walking} profile={profile} />
    </Canvas>
  );
}
