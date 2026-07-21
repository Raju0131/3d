'use client';

import { useRef, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  OrbitControls,
  Bounds,
} from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import Sneaker from './Sneaker';
import Loader from './Loader';

// ---------------------------------------------------------------------------
// Error boundary for the 3D model
// ---------------------------------------------------------------------------
import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <group>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 0.4, 1.5]} />
            <meshStandardMaterial color="#e0d5c9" roughness={0.7} />
          </mesh>
        </group>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Fallback shown inside <Suspense> while model loads
// ---------------------------------------------------------------------------
function SuspenseFallback() {
  return (
    <mesh>
      <boxGeometry args={[1.2, 0.35, 1.6]} />
      <meshStandardMaterial color="#e8e4df" wireframe transparent opacity={0.3} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// AutoRotateControls — pauses on interaction, resumes after 3 s
// Camera and distance tuned for a model normalized to ~2 units centered at origin.
// ---------------------------------------------------------------------------
function AutoRotateControls() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    if (controlsRef.current) controlsRef.current.autoRotate = false;
  }, []);

  const handleEnd = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      if (controlsRef.current) controlsRef.current.autoRotate = true;
    }, 3000);
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 0, 0]}
      enablePan={false}
      minDistance={2}
      maxDistance={8}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 1.8}
      autoRotate
      autoRotateSpeed={0.5}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  );
}

// ---------------------------------------------------------------------------
// Scene
// Camera positioned for a ~2 unit model centered at origin.
// - fov 40 at distance ~4 frames a 2-unit object comfortably
// - y=0.3 gives a slight upward angle (product shot feel)
// ---------------------------------------------------------------------------
export default function Scene() {
  return (
    <div className="scene-wrapper" id="scene-canvas-wrapper">
      <Canvas
        dpr={[1, 1.5]}
        shadows
        camera={{ position: [3, 1.2, 3], fov: 35 }}
        gl={{ preserveDrawingBuffer: true }}
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={['#f8f6f3']} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={20}
          shadow-camera-near={0.1}
          shadow-bias={-0.001}
        />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />

        {/* Environment */}
        <Environment preset="city" />

        {/* Ground shadows — positioned at the bottom of a 2-unit object centered at origin
            The model is centered at origin so its bottom is at roughly y = -1.
            ContactShadows sit just below that. */}
        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.4}
          blur={2}
          scale={6}
          far={4}
        />

        {/* Model with error boundary + suspense
            Bounds is a safety net after normalization, with a gentle margin */}
        <Suspense fallback={<SuspenseFallback />}>
          <ModelErrorBoundary>
            <Bounds fit clip observe margin={1.2}>
              <Sneaker />
            </Bounds>
          </ModelErrorBoundary>
        </Suspense>

        {/* Controls */}
        <AutoRotateControls />
      </Canvas>

      {/* HTML-based loader overlay (outside Canvas) */}
      <Loader />
    </div>
  );
}
