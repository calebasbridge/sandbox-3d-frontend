import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';

// 1. The Visual Interface (HUD)
import { HUD } from './components/HUD';

// 2. The 3D World
import { Experience } from './Experience'; 

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'jump', keys: ['Space'] },
];

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'black' }}>
      
      {/* 2D HUD Layer */}
      <HUD />

      {/* 3D Canvas Layer */}
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ fov: 45, position: [0, 5, 10] }}>
          <Suspense fallback={null}>
            <Physics>
              <Experience />
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
    </div>
  );
}

export default App;