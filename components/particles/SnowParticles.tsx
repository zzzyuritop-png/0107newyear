import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, CONFIG } from '../../constants';
import { InteractionMode } from '../../types';

const SnowParticles: React.FC<{ mode: InteractionMode }> = ({ mode }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const boxSize = 30;
  const count = CONFIG.snowCount;
  
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count); 
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * boxSize;
      positions[i * 3 + 1] = (Math.random() - 0.5) * boxSize;
      positions[i * 3 + 2] = (Math.random() - 0.5) * boxSize;
      velocities[i] = Math.random() * 0.05 + 0.02; 
    }
    return { positions, velocities };
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;
    let speedMultiplier = 1.0;
    if (mode === 'frozen') speedMultiplier = 0;
    else if (mode === 'fast') speedMultiplier = 4.0;
    
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    
    for (let i = 0; i < count; i++) {
      let y = posAttr.getY(i);
      y -= velocities[i] * speedMultiplier;
      if (y < -boxSize / 2) y = boxSize / 2;
      else if (y > boxSize / 2) y = -boxSize / 2;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={`void main() { vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_PointSize = 60.0 / -mvPosition.z; gl_Position = projectionMatrix * mvPosition; }`}
        fragmentShader={`uniform vec3 uColor; void main() { float r = distance(gl_PointCoord, vec2(0.5)); if (r > 0.5) discard; float alpha = 1.0 - smoothstep(0.3, 0.5, r); gl_FragColor = vec4(uColor, alpha * 0.8); }`}
        uniforms={{ uColor: { value: COLORS.snow } }} 
        transparent 
        depthWrite={false} 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default SnowParticles;