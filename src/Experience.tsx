import { RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, Environment, PointerLockControls } from '@react-three/drei';

// --- IMPORTS ---
// Updated to PascalCase (Dayroom, Marcus, Furniture) to match your filenames
import { Dayroom } from './components/world/dayroom';
import { Marcus } from './components/world/marcus';
import { Bed, Toilet, Table } from './components/world/furniture';

export const Experience = () => {
  return (
    <>
      {/* 1. Lighting & Atmosphere */}
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      
      {/* 2. Controls */}
      {/* Click screen to lock mouse. ESC to unlock. */}
      <PointerLockControls />

      {/* 3. The Player */}
      <Player />
      
      {/* 4. The World Assets */}
      <Dayroom />
      <Marcus />

      {/* 5. Furniture Placement */}
      {/* You can adjust these numbers [x, y, z] to move items around */}
      
      {/* Bed: Placing it to the left side of the cell/room */}
      <Bed position={[-1.5, 0, -3]} />

      {/* Toilet: Placing it to the right side */}
      <Toilet position={[1.5, 0, -3]} />

      {/* Table: Placing it in the open area closer to the camera */}
      <Table position={[0, 0, 1]} />
    </>
  );
};

// --- PLAYER CONTROLLER (Unchanged) ---
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

    // C. Apply velocity relative to where you are looking
    const linvel = body.current.linvel();
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // Flatten vector so you don't fly up when looking up
    cameraDirection.y = 0;
    cameraDirection.normalize();

    // Calculate movement vector
    const moveVector = new THREE.Vector3(direction.x, 0, direction.z);
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(cameraDirection.x, cameraDirection.z));

    if (direction.length() > 0) {
        const euler = new THREE.Euler(0, camera.rotation.y, 0);
        const finalDir = direction.clone().applyEuler(euler);
        body.current.setLinvel({ x: finalDir.x, y: linvel.y, z: finalDir.z }, true);
    } else {
        body.current.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
    }

    // D. Sync Camera
    const translation = body.current.translation();
    state.camera.position.set(translation.x, translation.y + 1.6, translation.z); 
  });

  return (
    <RigidBody ref={body} colliders="hull" restitution={0.2} friction={1} lockRotations position={[0, 2, 4]}>
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1, 4]} />
      </mesh>
    </RigidBody>
  );
};