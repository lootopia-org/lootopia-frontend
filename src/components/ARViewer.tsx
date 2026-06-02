'use client';

import React, { useEffect, useRef } from 'react';

interface ARViewerProps {
  modelUrl?: string;
  imageUrl?: string;
  markerUrl?: string;
  onLoad?: () => void;
  className?: string;
}

export const ARViewer: React.FC<ARViewerProps> = ({
  modelUrl,
  imageUrl,
  markerUrl,
  onLoad,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadARJS = async () => {
      if (!containerRef.current) return;

      // Load A-Frame first
      const aframeScript = document.createElement('script');
      aframeScript.src = 'https://aframe.io/releases/1.4.2/aframe.min.js';
      aframeScript.async = true;
      document.head.appendChild(aframeScript);

      aframeScript.onload = () => {
        // Then load AR.js
        const arScript = document.createElement('script');
        arScript.src = 'https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.5/aframe/aframe-ar.min.js';
        arScript.async = true;
        document.head.appendChild(arScript);

        arScript.onload = () => {
          // Create A-Frame scene
          const scene = document.createElement('a-scene');
          scene.setAttribute('embedded', '');
          scene.setAttribute('arjs', 'sourceType: webcam; debugUIEnabled: false;');

          // Add camera
          const camera = document.createElement('a-camera');
          camera.setAttribute('position', '0 0 0');
          camera.setAttribute('user-height', '0');
          scene.appendChild(camera);

          if (modelUrl) {
            const model = document.createElement('a-gltf-model');
            model.setAttribute('src', modelUrl);
            model.setAttribute('position', '0 0 -3');
            model.setAttribute('scale', '1 1 1');
            model.setAttribute('rotation', '0 0 0');
            scene.appendChild(model);
          }

          containerRef.current?.appendChild(scene);
          onLoad?.();
        };
      };
    };

    loadARJS();
  }, [modelUrl, onLoad]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-black rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};
