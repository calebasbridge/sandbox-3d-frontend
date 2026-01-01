import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export function Marcus() {
  const { scene } = useGLTF("/models/marcus/scene.gltf");

  return (
    // FIXED: Position Y=0 drops him to floor. Z=-2 puts him inside the cell.
    <RigidBody type="fixed" colliders="hull" position={[0, 0, -2]}>
      
      {/* FIXED: Scale 1.8 makes him roughly 6ft tall relative to the door */}
      <primitive object={scene} scale={1.8} rotation={[0, Math.PI, 0]} />

    </RigidBody>
  );
}

useGLTF.preload("/models/marcus/scene.gltf");