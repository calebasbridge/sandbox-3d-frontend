import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';

// 1. Logic Imports
import { useNeuralBrain } from './hooks/useNeuralBrain';

// 2. Scene Imports
import { Experience } from './Experience'; 
// import { HUD } from './components/HUD'; // Commented out until we refactor it to accept brain props

// 3. Control Map - Removed "Space" (Jump) so it can be used for "Talk"
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
];

function App() {
  // --- A. BRAIN INITIALIZATION ---
  const { 
    status, 
    startRecording, 
    stopRecording, 
    complianceScore,
    errorMessage 
  } = useNeuralBrain({ 
    // ⚠️ TODO: Replace this string with your actual Cloudflare Worker URL from Phase 2
    workerUrl: 'https://sandbox-3d-brain.caleb-a71.workers.dev' 
  });

  // --- B. INTERACTION LOGIC (Spacebar Toggle) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is holding the key down (auto-repeat)
      if (e.repeat) return; 

      if (e.code === 'Space') {
        if (status === 'idle' || status === 'error') {
          console.log("🎤 Mic Toggled ON");
          startRecording();
        } else if (status === 'recording') {
          console.log("📨 Mic Toggled OFF - Sending to Brain");
          stopRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, startRecording, stopRecording]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'black' }}>
      
      {/* --- C. 2D HUD LAYER (Overlay) --- */}
      {/* Replacing the external HUD component temporarily to ensure visibility */}
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 10, 
        color: 'white', 
        fontFamily: 'monospace',
        pointerEvents: 'none' // Lets clicks pass through to the 3D scene
      }}>
        <h2 style={{ margin: 0 }}>Compliance: {complianceScore}%</h2>
        
        {/* Status Indicator */}
        <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>
          STATUS: 
          <span style={{ 
            color: status === 'recording' ? '#ff4444' : status === 'error' ? 'orange' : '#00ff00',
            fontWeight: 'bold',
            marginLeft: '10px'
          }}>
            {status === 'recording' ? '● REC (LIVE)' : status.toUpperCase()}
          </span>
        </p>

        {/* Instructions */}
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: 'rgba(0,0,0,0.5)', 
          borderLeft: '4px solid white' 
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Controls:</p>
          <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '0.8rem', opacity: 0.8 }}>
            <li><strong>W/A/S/D:</strong> Move</li>
            <li><strong>Click:</strong> Lock Mouse</li>
            <li><strong>Space:</strong> Toggle Mic (On/Off)</li>
          </ul>
        </div>

        {errorMessage && (
          <div style={{ marginTop: '20px', color: '#ff4444', fontWeight: 'bold' }}>
            ⚠️ Error: {errorMessage}
          </div>
        )}
      </div>

      {/* --- D. 3D SCENE LAYER --- */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ fov: 45, position: [0, 5, 10] }}>
          <Suspense fallback={null}>
            <Physics>
              {/* Passing the Brain Status down so Marcus can react */}
              <Experience brainStatus={status} />
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
    </div>
  );
}

export default App;