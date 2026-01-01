import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export function Marcus() {
  const { scene } = useGLTF("/models/marcus/scene.gltf");

  return (
    // CHANGED: type="fixed" (He won't fall)
    // CHANGED: position=[0, 0, 0] (Start at center, we can move him later)
    <RigidBody type="fixed" colliders="hull" position={[0, 0.1, -2]}>
      
      {/* Visual Model */}
      <primitive object={scene} scale={1} rotation={[0, Math.PI, 0]} />

      {/* Debug Box - Keep this for one more run to spot him easily */}
      <mesh position={[0, 1, 0]}>
         <boxGeometry args={[0.5, 0.5, 0.5]} />
         <meshStandardMaterial color="red" wireframe />
      </mesh>

    </RigidBody>
  );
}

useGLTF.preload("/models/marcus/scene.gltf");