'use client';

import dynamic from 'next/dynamic';
import Configurator from '@/components/Configurator';

// Dynamically import Scene (uses WebGL) with SSR disabled
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

export default function HomePage() {
  return (
    <main className="app-layout">
      <Scene />
      <Configurator />
    </main>
  );
}
