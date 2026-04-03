import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { CalendarEvent } from '../types';
import { addDays, format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface NexusCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  examMode?: boolean;
}

const CalendarCell: React.FC<{ 
  date: Date; 
  events: CalendarEvent[]; 
  position: [number, number, number];
  onEventClick?: (event: CalendarEvent) => void;
  examMode?: boolean;
}> = ({ date, events, position, onEventClick, examMode }) => {
  const dayEvents = events.filter(e => isSameDay(e.date, date));
  const isToday = isSameDay(date, new Date());
  const hasExam = dayEvents.some(e => e.type === 'exam');

  return (
    <group position={position}>
      {/* Base Cell */}
      <Box args={[0.95, 0.95, 0.05]}>
        <meshStandardMaterial 
          color={isToday ? "#1e293b" : "#0f172a"} 
          roughness={0.8} 
          metalness={0.2}
          transparent
          opacity={examMode && !hasExam ? 0.3 : 0.8}
          emissive={hasExam ? "#ef4444" : "#000000"}
          emissiveIntensity={hasExam && examMode ? 0.5 : 0}
        />
      </Box>
      
      {/* Date Text */}
      <Text
        position={[-0.4, 0.4, 0.03]}
        fontSize={0.1}
        color={isToday ? "#f1f5f9" : "#475569"}
        anchorX="left"
        anchorY="top"
      >
        {format(date, 'd')}
      </Text>

      {/* Events */}
      {dayEvents.map((event, i) => {
        const isHackathon = event.type === 'hackathon';
        const isExam = event.type === 'exam';
        const isStudy = event.type === 'study-block';
        
        let color = "#475569";
        if (isExam) color = "rgba(239, 68, 68, 0.6)"; // Dimmed Soft red
        if (isHackathon) color = "rgba(34, 211, 238, 0.6)"; // Dimmed Soft cyan
        if (isStudy) color = "rgba(99, 102, 241, 0.6)"; // Dimmed Indigo

        // Drift logic for unregistered hackathons
        const shouldDrift = isHackathon && !event.registered && (event.daysUnregistered || 0) >= 3;

        return (
          <EventMarker 
            key={event.id}
            event={event}
            color={color}
            position={[0, 0.1 - i * 0.2, 0.03]}
            shouldDrift={shouldDrift}
            onClick={() => onEventClick?.(event)}
            examMode={examMode}
          />
        );
      })}
    </group>
  );
};

const EventMarker: React.FC<{ 
  event: CalendarEvent; 
  color: string; 
  position: [number, number, number];
  shouldDrift: boolean;
  onClick: () => void;
  examMode?: boolean;
}> = ({ event, color, position, shouldDrift, onClick, examMode }) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current && shouldDrift) {
      const time = state.clock.getElapsedTime();
      ref.current.position.x += Math.sin(time * 2) * 0.01;
      ref.current.position.y += 0.01;
      ref.current.position.z += 0.02;
      ref.current.rotation.z += 0.02;
    }
  });

  const isExam = event.type === 'exam';
  const isStudy = event.type === 'study-block';

  // Highlight exams and study blocks in exam mode
  const scale = (examMode && (isExam || isStudy)) ? 1.1 : 1;

  return (
    <group ref={ref} position={position} scale={scale} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <Box args={[0.8, 0.15, 0.02]}>
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={examMode && isExam ? 1 : 0.2}
          transparent
          opacity={shouldDrift ? 0.2 : 0.9}
        />
      </Box>
      <Text
        position={[0, 0, 0.015]}
        fontSize={0.07}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.7}
      >
        {event.title}
      </Text>
    </group>
  );
};

export const NexusCalendar: React.FC<NexusCalendarProps> = ({ events, onEventClick, examMode }) => {
  const days = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = addDays(start, 34); // Show 35 days (5 weeks)
    return eachDayOfInterval({ start, end });
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Perspective shift: subtle rotation based on time
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.x = -0.2 + Math.sin(time * 0.2) * 0.05;
      groupRef.current.rotation.y = 0.1 + Math.cos(time * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[-0.2, 0.1, 0]}>
      {/* 3D Grid of Cubes */}
      {days.map((date, i) => {
        const x = (i % 7) - 3;
        const y = 2 - Math.floor(i / 7);
        
        const dayEvents = events.filter(e => isSameDay(e.date, date));
        const isExam = dayEvents.some(e => e.type === 'exam');
        const isHoliday = dayEvents.some(e => e.type === 'holiday');
        const isStudy = dayEvents.some(e => e.type === 'study-block');
        const isToday = isSameDay(date, new Date());

        let cellColor = "#0f172a";
        if (isExam) cellColor = "#ef4444"; // Red for exams
        if (isHoliday) cellColor = "#eab308"; // Gold for holidays
        if (isStudy) cellColor = "#0ea5e9"; // Cyan for study blocks
        if (isToday) cellColor = "#1e293b";

        return (
          <group key={date.toISOString()} position={[x * 1.2, y * 1.2, 0]}>
            <Box args={[1, 1, 0.2]}>
              <meshStandardMaterial 
                color={cellColor} 
                transparent 
                opacity={examMode && !isExam && !isStudy ? 0.2 : 0.8}
                emissive={isExam ? "#ef4444" : isHoliday ? "#eab308" : isToday ? "#22d3ee" : "#000000"}
                emissiveIntensity={isExam || isHoliday ? 1 : isToday ? 0.5 : 0}
                roughness={0.1}
                metalness={0.9}
              />
            </Box>
            <Text
              position={[0, 0, 0.11]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {format(date, 'd')}
            </Text>
            
            {/* Preparation Indicators */}
            {isStudy && (
              <Sphere args={[0.1, 16, 16]} position={[0.3, -0.3, 0.15]}>
                <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
              </Sphere>
            )}
          </group>
        );
      })}
    </group>
  );
};
