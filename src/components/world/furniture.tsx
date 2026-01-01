import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

interface FurnitureProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number; // Added optional scale prop
}

// 1. THE BED
export function Bed({ position, rotation = [0, 0, 0], scale = 1 }: FurnitureProps) {
  const { scene } = useGLTF("/models/bed/scene.gltf"); 
  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <primitive object={scene} scale={scale} /> 
    </RigidBody>
  );
}

// 2. THE TOILET (Clean Version - No Red Box)
export function Toilet({ position, rotation = [0, 0, 0], scale = 1 }: FurnitureProps) {
  const { scene } = useGLTF("/models/toilet/scene.gltf");
  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <primitive object={scene} scale={scale} />
    </RigidBody>
  );
}

// 3. THE TABLE
export function Table({ position, rotation = [0, 0, 0], scale = 1 }: FurnitureProps) {
  const { scene } = useGLTF("/models/table/scene.gltf");
  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <primitive object={scene} scale={scale} />
    </RigidBody>
  );
}