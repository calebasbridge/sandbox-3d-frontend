import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

// 1. THE BED COMPONENT
export function Bed({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) {
  // Ensure this path matches your folder: /public/models/bed/scene.gltf
  const { scene } = useGLTF("/models/bed/scene.gltf"); 
  return (
    // SCALE: Set to 0.015 (1/100th size) to fix the "Giant Furniture" bug
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <primitive object={scene} scale={0.015} /> 
    </RigidBody>
  );
}

// 2. THE TOILET COMPONENT
export function Toilet({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) {
  const { scene } = useGLTF("/models/toilet/scene.gltf");
  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <primitive object={scene} scale={0.015} />
    </RigidBody>
  );
}

// 3. THE TABLE COMPONENT
export function Table({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) {
  const { scene } = useGLTF("/models/table/scene.gltf");
  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <primitive object={scene} scale={0.015} />
    </RigidBody>
  );
}