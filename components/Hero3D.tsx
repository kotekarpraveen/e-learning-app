
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Stars, Text, Environment, ContactShadows, Cylinder, Box, Sphere, Torus, Octahedron, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// 1. Sleek Tech Book
const TechBook = ({ position, rotation, color, args }: any) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Cover / Spine */}
      <Box args={args}>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      </Box>
      {/* Pages */}
      <Box args={[args[0] - 0.1, args[1] - 0.02, args[2] - 0.05]} position={[0.06, 0, 0]}>
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </Box>
      {/* Glowing Strip on Spine */}
      <Box args={[0.02, args[1], args[2] - 0.2]} position={[-args[0]/2 - 0.01, 0, 0]}>
         <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </Box>
    </group>
  );
};

// 2. Digital Core (The Interpreter)
const DigitalCore = ({ position }: { position: [number, number, number] }) => {
    const groupRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
            groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
        }
        if (ringRef.current) {
            ringRef.current.rotation.z -= 0.01;
        }
    });

    return (
        <group position={position} ref={groupRef}>
            {/* Crystalline Nucleus */}
            <Icosahedron args={[0.8, 0]}>
                <meshPhysicalMaterial 
                    color="#6366f1" 
                    roughness={0.2} 
                    metalness={0.8} 
                    transmission={0.1}
                    emissive="#4f46e5"
                    emissiveIntensity={0.5}
                    flatShading
                />
            </Icosahedron>
            
            {/* Processing Rings */}
            <group rotation={[Math.PI / 3, 0, 0]}>
                <Torus args={[2.2, 0.02, 32, 100]}>
                    <meshBasicMaterial color="#a5b4fc" transparent opacity={0.4} />
                </Torus>
                {/* Data Packet */}
                <Sphere args={[0.15]} position={[2.2, 0, 0]}>
                    <meshBasicMaterial color="#fbbf24" toneMapped={false} />
                </Sphere>
            </group>
            
            <group rotation={[-Math.PI / 3, 0, 0]}>
                <Torus args={[2.2, 0.02, 32, 100]}>
                    <meshBasicMaterial color="#a5b4fc" transparent opacity={0.4} />
                </Torus>
                <Sphere args={[0.15]} position={[-2.2, 0, 0]}>
                    <meshBasicMaterial color="#ec4899" toneMapped={false} />
                </Sphere>
            </group>

            {/* Binary Data Ring */}
            <group rotation={[0, 0, Math.PI / 2]} ref={ringRef}>
                <Torus args={[2.5, 0.01, 16, 100]}>
                    <meshBasicMaterial color="#34d399" transparent opacity={0.3} />
                </Torus>
                {[...Array(8)].map((_, i) => (
                    <Box key={i} args={[0.1, 0.3, 0.05]} position={[2.5 * Math.cos(i * Math.PI/4), 2.5 * Math.sin(i * Math.PI/4), 0]} rotation={[0, 0, i * Math.PI/4]}>
                        <meshBasicMaterial color="#34d399" />
                    </Box>
                ))}
            </group>
        </group>
    )
}

// 3. Graduation Cap (Achievement)
const GradCap = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position}>
             <Box args={[2.2, 0.15, 2.2]} rotation={[0, Math.PI / 4, 0]}>
                <meshStandardMaterial color="#1e293b" roughness={0.4} />
             </Box>
             <Cylinder args={[0.7, 0.8, 0.6, 32]} position={[0, -0.35, 0]}>
                <meshStandardMaterial color="#1e293b" roughness={0.4} />
             </Cylinder>
             <group position={[0, 0.08, 0]}>
                 <Cylinder args={[0.1, 0.1, 0.05, 16]}>
                    <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
                 </Cylinder>
                 <Box args={[0.03, 0.8, 0.03]} position={[0.9, -0.2, 0.9]} rotation={[0.5, 0, 0.5]}>
                     <meshStandardMaterial color="#fbbf24" />
                 </Box>
                 <Cylinder args={[0.02, 0.15, 0.4, 8]} position={[1.15, -0.6, 1.15]} rotation={[0.5, 0, 0.5]}>
                     <meshStandardMaterial color="#fbbf24" />
                 </Cylinder>
             </group>
        </group>
    )
}

// 4. Code Interpretation Stream
const CodeStream = () => {
    const symbols = useMemo(() => [
        { text: '</>', pos: [3, 2, 0], color: '#60a5fa' },
        { text: '{ }', pos: [-3, 1.5, 2], color: '#a78bfa' },
        { text: 'fn()', pos: [2, -2, 2], color: '#34d399' },
        { text: '&&', pos: [-2.5, -1, -2], color: '#fbbf24' },
        { text: 'var', pos: [0, 3.5, -1], color: '#f472b6' },
        { text: '010', pos: [3.5, -1, -1], color: '#94a3b8' },
        { text: '[]', pos: [-3.5, 0, 0], color: '#60a5fa' },
        { text: '=>', pos: [1.5, 2.5, 2], color: '#f87171' },
    ], []);

    return (
        <group>
            {symbols.map((sym, i) => (
                <Float key={i} speed={1.5} rotationIntensity={0.8} floatIntensity={1} floatingRange={[-0.5, 0.5]}>
                    <Text
                        position={sym.pos as any}
                        color={sym.color}
                        fontSize={0.3}
                        font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
                        anchorX="center"
                        anchorY="middle"
                        fillOpacity={0.8}
                    >
                        {sym.text}
                    </Text>
                </Float>
            ))}
        </group>
    );
};

// 5. Orbiting Skills
const SkillCloud = () => {
    const skills = useMemo(() => [
        { text: 'React', pos: [2.8, 0.5, 1], color: '#61dafb' },
        { text: 'Python', pos: [-2.8, -0.5, 2], color: '#ffde57' },
        { text: 'AI', pos: [0, 2.8, -1], color: '#f87171' },
        { text: 'Node', pos: [-2, 2, -2], color: '#86efac' },
    ], []);

    return (
        <group>
            {skills.map((skill, i) => (
                <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Text
                        position={skill.pos as any}
                        color={skill.color}
                        fontSize={0.45}
                        font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
                        outlineWidth={0.02}
                        outlineColor="#ffffff"
                    >
                        {skill.text}
                    </Text>
                </Float>
            ))}
        </group>
    );
};

// --- Main Scene ---
const EducationHub = () => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={[0, -0.5, 0]}>
            {/* Base */}
            <TechBook position={[0, -1.8, 0]} rotation={[0, -0.2, 0]} color="#1e293b" args={[2.0, 0.3, 2.4]} />
            <TechBook position={[0, -1.5, 0]} rotation={[0, 0.1, 0]} color="#334155" args={[1.8, 0.25, 2.2]} />
            <TechBook position={[0, -1.25, 0]} rotation={[0, -0.15, 0]} color="#475569" args={[1.6, 0.25, 2.0]} />

            {/* Core */}
            <DigitalCore position={[0, 0.2, 0]} />

            {/* Top */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[0, 0.2]}>
                <GradCap position={[0, 1.8, 0]} />
            </Float>

            {/* Elements */}
            <SkillCloud />
            <CodeStream />
        </group>
    );
};

export const Hero3D = () => {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 1, 8.5]} fov={45} />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.5} color="#ffffff" castShadow />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#6366f1" />
        <pointLight position={[5, -5, 5]} intensity={0.8} color="#f43f5e" />
        
        <Stars radius={60} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

        <EducationHub />

        <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={15} blur={2.5} far={4.5} />
        
        {/* Synthetic Environment to avoid fetching failed HDRI */}
        <Environment resolution={256}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
                <mesh position={[0, 10, 0]} scale={[10, 10, 1]}>
                    <planeGeometry />
                    <meshBasicMaterial color="#ffffff" toneMapped={false} />
                </mesh>
                <mesh position={[10, 0, 5]} scale={[5, 10, 1]} rotation={[0, -Math.PI/4, 0]}>
                    <planeGeometry />
                    <meshBasicMaterial color="#a5b4fc" toneMapped={false} />
                </mesh>
            </group>
        </Environment>
      </Canvas>
    </div>
  );
};
