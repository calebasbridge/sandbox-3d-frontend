import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

export function Marcus() {
  // UPDATED PATH
  const { scene } = useGLTF("/models/marcus/scene.gltf");

  return (
    <RigidBody type="fixed" colliders="hull" position={[0, 0, -3]}>
      {/* Rotation: [0, Math.PI, 0] rotates him 180 degrees to face you.
         Scale: Adjust if he looks like a giant or an ant compared to the room.
      */}
      <primitive object={scene} scale={1} rotation={[0, Math.PI, 0]} />
    </RigidBody>
  );
}

useGLTF.preload("/models/marcus/scene.gltf");