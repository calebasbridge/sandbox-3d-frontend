import { Canvas } from '@react-three/fiber';
import { KeyboardControls, PointerLockControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Experience } from './Experience';
import { Suspense } from 'react';

// Define the WASD key map
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'jump', keys: ['Space'] },
];

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      {/* 1. The 3D Canvas */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ fov: 45, position: [0, 0, 0] }}>
          
          {/* 2. Physics World (Gravity enabled) */}
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              <Experience />
            </Physics>
          </Suspense>

          {/* 3. Helper: Locks mouse to screen when you click */}
          <PointerLockControls />
          
        </Canvas>
      </KeyboardControls>

      {/* 4. UI Overlay (Crosshair) */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: '10px', height: '10px', background: 'white',
        borderRadius: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', opacity: 0.7
      }} />
      
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', fontFamily: 'monospace' }}>
        CLICK TO START <br/> WASD to Move
      </div>
    </div>
  );
}