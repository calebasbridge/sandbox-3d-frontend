import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';

// -----------------------------------------------------------------------------
// IMPORTS
// -----------------------------------------------------------------------------
// 1. The Visual Interface (HUD)
import { HUD } from './components/HUD';

// 2. The 3D World
// FIX APPLIED HERE: Added curly braces { } because Experience is a named export.
import { Experience } from './Experience'; 

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'jump', keys: ['Space'] },
];

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
function App() {
  return (
    // PARENT CONTAINER: Holds both the 2D HUD and the 3D Canvas
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'black' }}>
      
      {/* 1. THE HEAD-UP DISPLAY (2D Layer) */}
      <HUD />

      {/* 2. THE 3D WORLD (Canvas Layer) */}
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