import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Text, Float, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';

interface HabitTileProps {
  day: number;
  active: boolean;
  onClick: () => void;
  position: [number, number, number];
}

const HabitTile: React.FC<HabitTileProps> = ({ day, active, onClick, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, hovered ? 1.1 : 1, 0.1));
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[0.8, 0.8, 0.2]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={active ? "#8b5cf6" : "#1e293b"}
          emissive={active ? "#8b5cf6" : "#000000"}
          emissiveIntensity={active ? 0.5 : 0}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </Box>
      <Text
        position={[0, 0, 0.12]}
        fontSize={0.2}
        color={active ? "white" : "#475569"}
        anchorX="center"
        anchorY="middle"
      >
        {day}
      </Text>
    </group>
  );
};

interface HabitTrackerProps {
  habits: { [key: string]: boolean };
  onToggle: (day: string) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onToggle }) => {
  const rows = 5;
  const cols = 7;

  return (
    <div className="w-full h-[600px] glass-card glass-border rounded-3xl overflow-hidden relative">
      <div className="absolute top-8 left-8 z-10">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">Micro-Consistency Protocol</h2>
        <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">35-Day Habit Matrix</p>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} castShadow />

        <group position={[-3, 2, 0]}>
          {Array.from({ length: rows * cols }).map((_, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const dayId = `day-${i + 1}`;
            return (
              <HabitTile
                key={dayId}
                day={i + 1}
                active={!!habits[dayId]}
                onClick={() => onToggle(dayId)}
                position={[col * 1.1, -row * 1.1, 0]}
              />
            );
          })}
        </group>

        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-8 right-8 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-800 border border-white/10" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inactive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-600 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
        </div>
      </div>
    </div>
  );
};
