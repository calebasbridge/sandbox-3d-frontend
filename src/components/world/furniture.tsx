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

// 3. THE TABLE (Centered + Floor-snapped)
export function Table({ position, rotation = [0, 0, 0], scale = 1 }: FurnitureProps) {
  const { scene } = useGLTF("/models/table/scene.gltf");
  const groupRef = useRef<THREE.Group>(null);

  const offset = useMemo(() => {
    const temp = scene.clone(true);
    temp.scale.setScalar(scale);
    temp.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(temp);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // center X/Z + snap bottom to Y=0
    return new THREE.Vector3(-center.x, -box.min.y, -center.z);
  }, [scene, scale]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(offset);
  }, [offset]);

  useEffect(() => {
    // Force table materials to be fully opaque
    scene.traverse((obj) => {
      if (!(obj as any).isMesh) return;

      const mesh = obj as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      materials.forEach((mat) => {
        if (!mat) return;

        // Optional: only affect things that look like the tabletop by name
        // If this doesn't work (names differ), comment out the next 3 lines to affect the whole table.
        // const name = `${mesh.name} ${mat.name}`.toLowerCase();
        // if (!name.includes("top") && !name.includes("table")) return;

        mat.transparent = false;
        mat.opacity = 1;
        // These two help avoid weird blending artifacts in some GLTFs
        mat.depthWrite = true;
        mat.alphaTest = 0;

        mat.needsUpdate = true;
      });
    });
  }, [scene]);


  return (
    <RigidBody type="fixed" colliders="hull" position={position} rotation={rotation}>
      <group ref={groupRef}>
        <primitive object={scene} scale={scale} />
      </group>
    </RigidBody>
  );
}