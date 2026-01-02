import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

// 1. Add Interface for Props
interface MarcusProps {
  isSpeaking?: boolean;
  isThinking?: boolean;
  // Allow passing standard props if needed later
  [key: string]: any; 
}

export function Marcus({ isSpeaking = false, isThinking = false, ...props }: MarcusProps) {
  const { scene } = useGLTF("/models/marcus/scene.gltf");
  const groupRef = useRef<THREE.Group>(null);

  // Keep scale as a single source of truth
  const scale = 1.8;

  // Compute how much we need to move the model DOWN so its feet touch Y=0
  const offset = useMemo(() => {
    const temp = scene.clone(true);
    temp.scale.setScalar(scale);
    temp.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(temp);

    // Shift so the lowest point becomes Y=0
    return new THREE.Vector3(0, -box.min.y, 0);
  }, [scene, scale]);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.copy(offset);
  }, [offset]);

  return (
    // RigidBody stays on the floor; the model inside is what we floor-snap
    <RigidBody type="fixed" colliders="hull" position={[0, 0, -2]} {...props}>
      <group ref={groupRef}>
        <primitive object={scene} scale={scale} rotation={[0, Math.PI, 0]} />
        
        {/* --- NEW: VISUAL FEEDBACK (The Halo) --- */}
        {/* Attached to the model group so it moves with him */}
        {(isSpeaking || isThinking) && (
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color={isSpeaking ? "#00ff00" : "#ffff00"} 
              emissive={isSpeaking ? "#00ff00" : "#ffff00"}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        )}

      </group>
    </RigidBody>
  );
}

useGLTF.preload("/models/marcus/scene.gltf");