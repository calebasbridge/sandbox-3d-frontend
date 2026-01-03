import { useEffect, useRef } from "react";
import { useFBX, useAnimations } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

interface MarcusProps {
  isSpeaking?: boolean;
  isThinking?: boolean;
  complianceScore?: number; // Pass the score to drive emotion
  [key: string]: any;
}

export function Marcus({ 
  isSpeaking = false, 
  isThinking = false, 
  complianceScore = 50, // Default to Neutral
  ...props 
}: MarcusProps) {
  
  const groupRef = useRef<THREE.Group>(null);

  // 1. LOAD THE ASSETS (Body + Animations)
  // We load the body from 'idle'
  const idle = useFBX("/models/marcus/idle.fbx");
  
  // We load other clips solely for their animation data
  const talking = useFBX("/models/marcus/talking.fbx");
  const angry = useFBX("/models/marcus/angry.fbx");
  const yelling = useFBX("/models/marcus/yelling.fbx");

  // 2. EXTRACT ANIMATIONS
  // Mixamo usually names the animation inside the file "mixamo.com". 
  // We rename them here to avoid conflicts.
  idle.animations[0].name = "Idle";
  talking.animations[0].name = "Talking";
  angry.animations[0].name = "Angry";
  yelling.animations[0].name = "Yelling";

  // Combine all clips into one list
  const allAnimations = [
    idle.animations[0],
    talking.animations[0],
    angry.animations[0],
    yelling.animations[0]
  ];

  // 3. SETUP ANIMATION MIXER
  const { actions } = useAnimations(allAnimations, groupRef);

  // 4. LOGIC ENGINE: Decide which animation to play
  useEffect(() => {
    // Reset all animations when state changes slightly
    const playAnim = (name: string) => {
        actions[name]?.reset().fadeIn(0.5).play();
        // Stop others? usually actions handle blending, but we can enforce it:
        Object.keys(actions).forEach(key => {
            if(key !== name) actions[key]?.fadeOut(0.5);
        });
    };

    if (isSpeaking) {
        // If speaking, override everything with "Talking"
        playAnim("Talking");
    } else if (complianceScore < 30) {
        // High tension/Angry
        playAnim("Angry"); // Or "Yelling" if you want extreme
    } else {
        // Default State
        playAnim("Idle");
    }

    // Cleanup on unmount
    return () => {
        Object.keys(actions).forEach(key => actions[key]?.fadeOut(0.5));
    };
  }, [actions, isSpeaking, complianceScore]);

  // Scale Adjustment (FBX units can be huge, usually need 0.01 or similar)
  // You might need to tweak this number depending on the raw file
  const scale = 0.01; 

  return (
    <RigidBody type="fixed" colliders="hull" position={[0, 0, 2]} {...props}>
      <group ref={groupRef}>
        {/* Render ONLY the Idle mesh (which now contains all animations) */}
        <primitive object={idle} scale={scale} rotation={[0, Math.PI, 0]} />
        
        {/* Visual Halo (Kept for debugging clarity) */}
        {(isSpeaking || isThinking) && (
          <mesh position={[0, 180, 0]}> {/* Adjusted Y for FBX scale */}
            <sphereGeometry args={[10, 16, 16]} /> 
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

// Preload to prevent pop-in
useFBX.preload("/models/marcus/idle.fbx");
useFBX.preload("/models/marcus/talking.fbx");
useFBX.preload("/models/marcus/angry.fbx");