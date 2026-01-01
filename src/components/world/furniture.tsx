import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

interface FurnitureProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number; // Added optional scale prop
}

// 1. THE BED (Centered + Floor-snapped)
export function Bed({ position, rotation = [0, 0, 0], scale = 1 }: FurnitureProps) {
  const { scene } = useGLTF("/models/bed/scene.gltf");
  const groupRef = useRef<THREE.Group>(null);

  const offset = useMemo(() => {
    const temp = scene.clone(true);
    temp.scale.setScalar(scale);
    temp.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(temp);

    // Center it on X/Z so "position" means "place bed here"
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Floor snap so it sits on Y=0
    const minY = box.min.y;

    // Move model so its center is at (0, ?, 0) and its bottom is at Y=0
    return new THREE.Vector3(-center.x, -minY, -center.z);
  }, [scene, scale]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(offset);
  }, [offset]);

  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <group ref={groupRef}>
        <primitive object={scene} scale={scale} />
      </group>
    </RigidBody>
  );
}

// 2. THE TOILET (Floor-snapped)
export function Toilet({ position, rotation = [0, 0, 0], scale = 1 }: FurnitureProps) {
  const { scene } = useGLTF("/models/toilet/scene.gltf");
  const groupRef = useRef<THREE.Group>(null);

  const offset = useMemo(() => {
    const temp = scene.clone(true);
    temp.scale.setScalar(scale);
    temp.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(temp);
    return new THREE.Vector3(0, -box.min.y, 0);
  }, [scene, scale]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(offset);
  }, [offset]);

  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <group ref={groupRef}>
        <primitive object={scene} scale={scale} />
      </group>
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