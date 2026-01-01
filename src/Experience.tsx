import { RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, Environment } from '@react-three/drei';

// --- NEW IMPORTS ---
// Ensure you have created these files in src/components/world/ as discussed
import { Dayroom } from './components/world/dayroom';
import { Marcus } from './components/world/marcus';

export const Experience = () => {
  return (
    <>
      {/* 1. Lighting & Atmosphere */}
      {/* 'preset="city"' provides quick, realistic reflection/lighting for GLTF models */}
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

      {/* 2. The Player (You) - Logic Preserved */}
      <Player />

      {/* 3. The World (Assets) */}
      {/* Replaces the manual 'group' and boxGeometry */}
      <Dayroom />
      <Marcus />
    </>
  );
};

// --- Sub-Component: The Player Controller ---
// (Preserved exactly as provided to maintain your current movement logic)
const Player = () => {
  const body = useRef<any>(null);
  const [, getKeys] = useKeyboardControls();
  const { camera } = useThree();
  
  const speed = 5;
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();

  useFrame((state) => {
    if (!body.current) return;

    // A. Get keyboard state
    const { forward, backward, left, right } = getKeys();

    // B. Calculate movement
    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed);

    // C. Apply velocity
    const linvel = body.current.linvel();
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // Helper to move relative to camera look direction
    const theta = Math.atan2(cameraDirection.x, cameraDirection.z);
    
    // Calculate new X and Z velocities
    const x = direction.x * Math.cos(theta) + direction.z * Math.sin(theta);
    const z = direction.z * Math.cos(theta) - direction.x * Math.sin(theta);

    body.current.setLinvel({ x: x, y: linvel.y, z: z }, true);

    // D. Sync Camera
    const translation = body.current.translation();
    state.camera.position.set(translation.x, translation.y + 1.6, translation.z); 
  });

  return (
    // Adjusted spawn position (0,2,4) to ensure you don't spawn trapped inside a wall
    <RigidBody ref={body} colliders="hull" restitution={0.2} friction={1} lockRotations position={[0, 2, 4]}>
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1, 4]} />
      </mesh>
    </RigidBody>
  );
};