import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { InteractionMode } from '../types';

interface HandInteractionProps {
  onModeChange: (mode: InteractionMode) => void;
}

const HandInteraction: React.FC<HandInteractionProps> = ({ onModeChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Initializing...');
  const [currentMode, setCurrentMode] = useState<InteractionMode>('normal');

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;
    let lastVideoTime = -1;

    const setup = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: "user" }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', () => {
              setStatus('Active');
              predict();
            });
          }
        }
      } catch (err) {
        setStatus('Camera Blocked');
        console.error(err);
      }
    };

    const predict = () => {
      if (videoRef.current && handLandmarker) {
        const startTimeMs = performance.now();
        if (videoRef.current.currentTime !== lastVideoTime) {
          lastVideoTime = videoRef.current.currentTime;
          try {
            const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
            let newMode: InteractionMode = 'normal';
            
            if (results.landmarks && results.landmarks.length > 0) {
              const landmarks = results.landmarks[0];
              const wristX = landmarks[0].x;
              const wristY = landmarks[0].y;
              const tips = [4, 8, 12, 16, 20];
              let totalDist = 0;
              
              tips.forEach(tipIdx => {
                const dx = landmarks[tipIdx].x - landmarks[0].x;
                const dy = landmarks[tipIdx].y - landmarks[0].y;
                totalDist += Math.sqrt(dx * dx + dy * dy);
              });

              // Gesture Logic
              if (totalDist / 5 > 0.35) newMode = 'frozen';
              else if (wristY > 0.7) newMode = 'fast';
              else if (wristX < 0.3) newMode = 'rotateLeft';
              else if (wristX > 0.7) newMode = 'rotateRight';
            }
            
            setCurrentMode(newMode);
            onModeChange(newMode);
          } catch (e) {
            // Ignore temporary detection errors
          }
        }
        animationFrameId = requestAnimationFrame(predict);
      }
    };

    setup();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (handLandmarker) handLandmarker.close();
    };
  }, [onModeChange]);

  const getModeLabel = (mode: InteractionMode) => {
    switch(mode) {
      case 'frozen': return '❄️ FREEZE ❄️';
      case 'fast': return '⚡ FAST ⚡';
      case 'rotateLeft': return '🔄 ROTATE LEFT';
      case 'rotateRight': return 'ROTATE RIGHT 🔄';
      default: return 'NORMAL';
    }
  };

  return (
    <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-2xl ${currentMode !== 'normal' ? 'border-cyan-400 scale-105' : 'border-white/20'}`}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-48 h-36 object-cover transform scale-x-[-1] bg-black/50" 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md py-2 text-center">
          <span className={`text-xs font-bold font-mono tracking-wider ${currentMode !== 'normal' ? 'text-cyan-300' : 'text-white/70'}`}>
            {status === 'Active' ? getModeLabel(currentMode) : status}
          </span>
        </div>
      </div>
      {status === 'Active' && (
        <div className="flex flex-col gap-1 text-[10px] text-white/40 font-mono ml-1">
          <div className={currentMode === 'frozen' ? 'text-cyan-300' : ''}>• Open Hand: Freeze</div>
          <div className={currentMode === 'fast' ? 'text-cyan-300' : ''}>• Hand Down: Speed Up</div>
          <div className={currentMode === 'rotateLeft' ? 'text-cyan-300' : ''}>• Hand Left: Rotate Left</div>
        </div>
      )}
    </div>
  );
};

export default HandInteraction;