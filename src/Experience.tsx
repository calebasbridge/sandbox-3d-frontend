import { RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, Environment, PointerLockControls, OrbitControls } from '@react-three/drei';

import { Dayroom } from './components/world/dayroom';
import { Marcus } from './components/world/marcus';
import { Bed, Toilet, Table } from './components/world/furniture';

const LAYOUT_CAMERA = true; // NOTE: Set to false when you want first-person mode

export const Experience = () => {
  return (
    <>
      
      {/* DEBUG HELPERS — TEMPORARY */}
      <gridHelper args={[50, 50]} />
      <axesHelper args={[5]} />
      
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
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
      
      <Dayroom />
      
      {/* MARCUS (Anchor Point: 0, 0, -2) */}
      <Marcus />

      <Bed 
        position={[-2.0, 0, -0.1]} 
        rotation={[0, 0, 0]} 
        scale={0.013} 
      />

      <Toilet 
        position={[2.25 , 0, -1.6]} 
        rotation={[0, Math.PI, 0]} 
        scale={1.75} 
      />

      <Table 
        position={[0, 0, -1]} 
        scale={0.015} 
      />
    </>
  );
};

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