'use client';

import dynamic from 'next/dynamic';
import Configurator from '@/components/Configurator';

// Scene uses WebGL, so it is client-only and code-split away from the panel.
//
// `loading` is not decoration: without a placeholder the scene's flex slot
// does not exist until the 3D chunk arrives, so the desktop panel renders
// against the left edge and then jumps to the right when the canvas mounts.
// An empty .scene-wrapper holds the same box from the first paint.
const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
  loading: () => <div className="scene-wrapper" aria-hidden="true" />,
});

export default function HomePage() {
  return (
    <main className="app-layout">
      <Scene />
      <Configurator />
    </main>
  );
}
