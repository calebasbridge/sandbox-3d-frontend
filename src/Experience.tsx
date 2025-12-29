import { RigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, Environment } from '@react-three/drei';

export const Experience = () => {
  return (
    <>
      {/* 1. Lighting & Atmosphere */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <color attach="background" args={['#111']} />

      {/* 2. The Player (You) */}
      <Player />

      {/* 3. The Jail Cell (Built with Code) */}
      <group position={[0, 0, -5]}>
        
        {/* Floor */}
        <RigidBody type="fixed" friction={1}>
          <mesh rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        </RigidBody>

        {/* Back Wall */}
        <RigidBody type="fixed">
          <mesh position={[0, 2.5, -5]} receiveShadow>
            <boxGeometry args={[10, 5, 1]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </RigidBody>

        {/* Side Walls */}
        <RigidBody type="fixed">
          <mesh position={[-5, 2.5, 0]} rotation-y={Math.PI / 2}>
            <boxGeometry args={[10, 5, 1]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </RigidBody>
        <RigidBody type="fixed">
          <mesh position={[5, 2.5, 0]} rotation-y={Math.PI / 2}>
            <boxGeometry args={[10, 5, 1]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </RigidBody>

        {/* The Bars (Front) */}
        <RigidBody type="fixed">
             {/* We create a loop of bars */}
            {[-2, -1, 0, 1, 2].map((x) => (
              <mesh key={x} position={[x, 2.5, 5]}>
                <cylinderGeometry args={[0.1, 0.1, 5]} />
                <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
              </mesh>
            ))}
        </RigidBody>

        {/* The Inmate (Jones) */}
        <RigidBody type="fixed" position={[0, 1, -3]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.4, 1.2, 4, 8]} />
            <meshStandardMaterial color="orange" />
          </mesh>
           {/* Head */}
           <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.3]} />
            <meshStandardMaterial color="#dcb" />
           </mesh>
        </RigidBody>

      </group>
    </>
  );
};

// --- Sub-Component: The Player Controller ---
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
    
    const theta = Math.atan2(cameraDirection.x, cameraDirection.z);
    const x = direction.x * Math.cos(theta) + direction.z * Math.sin(theta);
    const z = direction.z * Math.cos(theta) - direction.x * Math.sin(theta);

    body.current.setLinvel({ x: x, y: linvel.y, z: z }, true);

    // D. Sync Camera
    const translation = body.current.translation();
    state.camera.position.set(translation.x, translation.y + 1.6, translation.z); // Eye height 1.6m
  });

  return (
    <RigidBody ref={body} colliders="hull" restitution={0.2} friction={1} lockRotations position={[0, 2, 8]}>
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1, 4]} />
      </mesh>
    </RigidBody>
  );
};