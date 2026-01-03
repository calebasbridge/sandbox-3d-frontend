import { RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, Environment, PointerLockControls, OrbitControls } from '@react-three/drei';

// ✅ FIX: Explicit "type" import prevents the import error
import type { BrainState } from './hooks/useNeuralBrain';

import { Dayroom } from './components/world/dayroom';
import { Marcus } from './components/world/marcus';
import { Bed, Toilet, Table } from './components/world/furniture';

const LAYOUT_CAMERA = true; 

// ✅ FIX: Add complianceScore to props (Prepared for Mixamo)
interface ExperienceProps {
  brainStatus: BrainState;
  complianceScore?: number; 
}

export const Experience = ({ brainStatus, complianceScore = 50 }: ExperienceProps) => {
  
  const isThinking = brainStatus === 'thinking';
  const isSpeaking = brainStatus === 'speaking';

  return (
    <>
      {/* Lighting & Environment */}
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      
      {/* Camera Logic */}
      {LAYOUT_CAMERA ? (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={0.5}
          maxDistance={60}
          maxPolarAngle={Math.PI * 0.49}
        />
      ) : (
        <>
          <PointerLockControls />
          <Player />
        </>
      )}
      
      {/* The Environment */}
      <Dayroom />
      
      {/* The Antagonist */}
      {/* NOTE: The 'isSpeaking' error will vanish once you update Marcus.tsx */}
      <Marcus 
        isSpeaking={isSpeaking} 
        isThinking={isThinking} 
        complianceScore={complianceScore}
        position={[0, 0, 4]} // Brought closer to camera
        rotation={[0, Math.PI / -2, 0]} // Rotated to face player
      />

      {/* Furniture */}
      <Bed 
        position={[-2.16, 0, -0.1]} 
        rotation={[0, 0, 0]} 
        scale={0.011} 
      />

      <Toilet 
        position={[2.4 , 0, -1.85]} 
        rotation={[0, Math.PI, 0]} 
        scale={1.25} 
      />

      <Table 
        position={[0, 0, 6.5]}
        rotation={[0, 0, 0]} 
        scale={0.006} 
      />
    </>
  );
};

// --- PLAYER COMPONENT (Standard FPS Controller) ---
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
      const { forward, backward, left, right } = getKeys();
      frontVector.set(0, 0, Number(backward) - Number(forward));
      sideVector.set(Number(left) - Number(right), 0, 0);
      direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed);
      const linvel = body.current.linvel();
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();
      const moveVector = new THREE.Vector3(direction.x, 0, direction.z);
      moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(cameraDirection.x, cameraDirection.z));
      if (direction.length() > 0) {
          const euler = new THREE.Euler(0, camera.rotation.y, 0);
          const finalDir = direction.clone().applyEuler(euler);
          body.current.setLinvel({ x: finalDir.x, y: linvel.y, z: finalDir.z }, true);
      } else {
          body.current.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
      }
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