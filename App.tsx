import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { InteractionMode } from './types';
import { COLORS, CONFIG } from './constants';

import BackgroundMusic from './components/BackgroundMusic';
import HandInteraction from './components/HandInteraction';
import PinkTreeParticles from './components/particles/PinkTreeParticles';
import SnowParticles from './components/particles/SnowParticles';
import BaseRings from './components/particles/BaseRings';
import TopStar from './components/particles/TopStar';

const App: React.FC = () => {
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('normal');

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <BackgroundMusic />
      <HandInteraction onModeChange={setInteractionMode} />
      
      <Canvas 
        camera={{ position: [0, 8, 24], fov: 45 }} 
        gl={{ 
          antialias: false, 
          powerPreference: "high-performance", 
          alpha: false, 
          stencil: false, 
          depth: true 
        }} 
        dpr={[1, 2]}
      >
        <color attach="background" args={[COLORS.background]} />
        <Suspense fallback={null}>
          <PinkTreeParticles explosionValue={0} />
          <TopStar /> 
          <BaseRings />
          <SnowParticles mode={interactionMode} />
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          
          {/* Scene Controls & Effects */}
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={5} 
            maxDistance={30} 
            maxPolarAngle={Math.PI / 2 - 0.05}
            autoRotate 
            autoRotateSpeed={
              interactionMode === 'rotateLeft' ? -8.0 : 
              interactionMode === 'rotateRight' ? 8.0 : 
              interactionMode === 'fast' ? 2.0 : 
              interactionMode === 'frozen' ? 0 : 0.5
            }
            target={[0, CONFIG.treeHeight / 2, 0]}
          />
          <EffectComposer disableNormalPass>
            <Bloom 
              intensity={CONFIG.bloomStrength} 
              luminanceThreshold={CONFIG.bloomThreshold} 
              luminanceSmoothing={0.9} 
              mipmapBlur 
              radius={CONFIG.bloomRadius} 
            />
            <ToneMapping exposure={1.2} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default App;