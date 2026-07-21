'use client';

import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function Loader() {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!active && progress === 100) {
      // Fade out over 600ms, then unmount
      setOpacity(0);
      const timer = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  if (!visible) return null;

  return (
    <div
      className="loader-overlay"
      style={{ opacity }}
    >
      <div className="loader-content">
        <div className="loader-brand">SNEAKER LAB</div>
        <div className="loader-bar-track">
          <div
            className="loader-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="loader-percentage">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}
