import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export function Dayroom() {
  // UPDATED PATH: Pointing to the specific .gltf file inside the folder
  const { scene } = useGLTF("/models/dayroom/scene.gltf");

  return (
    <RigidBody 
      type="fixed" 
      colliders="trimesh" // Keeps the walls solid
    >
      {/* Scale Note: Downloaded assets vary wildly in size. 
         If the room is tiny, change scale to 10 or 100.
         If it's huge, try 0.1. 
         Start with 1.
      */}
      <primitive object={scene} scale={1} position={[0, -1, 0]} />
    </RigidBody>
  );
}

useGLTF.preload("/models/dayroom/scene.gltf");