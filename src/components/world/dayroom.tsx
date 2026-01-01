import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export function Dayroom() {
  const { scene } = useGLTF("/models/dayroom/scene.gltf");

  // A wrapper group lets us offset the imported scene without mutating
  // the original GLTF root in unexpected ways.
  const groupRef = useRef<THREE.Group>(null);

  // Keep scale in one place so the anchoring math matches what you see.
  const scale = 1;

  // Compute the offset we need to apply so:
  // - floor touches Y=0
  // - model is centered on X=0
  const offset = useMemo(() => {
    // Clone so we can safely compute bounds with scale applied
    const temp = scene.clone(true);
    temp.scale.setScalar(scale);

    // Make sure matrices are up to date
    temp.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(temp);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // To put floor at Y=0, we need to move up by -box.min.y
    // To center X, we move by -center.x
    // Z: leave as-is for now (we can anchor Z later once you pick a "front" reference)
    return new THREE.Vector3(-center.x, -box.min.y, 0);
  }, [scene, scale]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(offset);
  }, [offset]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <group ref={groupRef}>
        <primitive object={scene} scale={scale} />
      </group>
    </RigidBody>
  );
}

useGLTF.preload("/models/dayroom/scene.gltf");
