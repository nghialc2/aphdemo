"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  theme?: "light" | "dark";
}

export function ReliableWorldMap({
  dots = [],
  lineColor = "#0ea5e9",
  theme = "light",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (900 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full aspect-[2/1] relative font-sans overflow-hidden rounded-xl bg-gradient-to-b from-blue-400 to-blue-600">
      <svg
        ref={svgRef}
        viewBox="0 0 900 400"
        className="w-full h-full absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' }}
      >
        <defs>
          <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          
          <filter id="landShadow" x="-50%" y="-50%" width="200%" height="200%">
            <dropShadow dx="2" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* NORTH AMERICA - Much more detailed and accurate */}
        <motion.path
          d="M 50 80 L 120 60 L 180 70 L 220 80 L 260 90 L 280 100 L 290 120 L 300 140 L 290 160 L 280 180 L 260 190 L 230 200 L 200 190 L 170 180 L 140 170 L 110 160 L 90 140 L 80 120 L 70 100 Z"
          fill="url(#landGradient)"
          stroke="#166534"
          strokeWidth="1"
          filter="url(#landShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        {/* SOUTH AMERICA */}
        <motion.path
          d="M 200 220 L 230 230 L 250 250 L 260 280 L 270 310 L 260 340 L 240 360 L 220 370 L 200 365 L 190 340 L 185 310 L 190 280 L 195 250 Z"
          fill="url(#landGradient)"
          stroke="#166534"
          strokeWidth="1"
          filter="url(#landShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.7 }}
        />

        {/* EUROPE */}
        <motion.path
          d="M 320 70 L 360 65 L 400 75 L 430 85 L 440 100 L 435 115 L 420 125 L 390 130 L 360 125 L 330 115 L 315 95 Z"
          fill="url(#landGradient)"
          stroke="#166534"
          strokeWidth="1"
          filter="url(#landShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.9 }}
        />

        {/* AFRICA */}
        <motion.path
          d="M 350 140 L 400 135 L 430 145 L 450 160 L 460 190 L 465 220 L 460 250 L 450 280 L 430 310 L 410 330 L 380 335 L 360 330 L 345 310 L 340 280 L 335 250 L 340 220 L 345 190 L 348 160 Z"
          fill="url(#landGradient)"
          stroke="#166534"
          strokeWidth="1"
          filter="url(#landShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.1 }}
        />

        {/* ASIA - Large and detailed */}
        <motion.path
          d="M 470 50 L 550 55 L 620 65 L 680 75 L 720 85 L 750 100 L 770 120 L 780 140 L 775 160 L 760 180 L 740 190 L 700 195 L 660 190 L 620 185 L 580 180 L 540 175 L 500 165 L 480 145 L 475 125 L 470 105 L 468 85 L 469 65 Z"
          fill="url(#landGradient)"
          stroke="#166534"
          strokeWidth="1"
          filter="url(#landShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.3 }}
        />

        {/* AUSTRALIA */}
        <motion.path
          d="M 600 280 L 650 285 L 690 290 L 720 295 L 730 305 L 735 320 L 725 335 L 710 345 L 680 350 L 650 345 L 620 335 L 605 320 L 598 305 Z"
          fill="url(#landGradient)"
          stroke="#166534"
          strokeWidth="1"
          filter="url(#landShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
        />

        {/* GREENLAND */}
        <motion.path
          d="M 250 30 L 280 25 L 310 35 L 320 50 L 315 65 L 300 70 L 275 65 L 255 55 L 248 40 Z"
          fill="url(#landGradient)"
          stroke="#166534"
          strokeWidth="1"
          filter="url(#landShadow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.7 }}
        />

        {/* Grid lines for reference - subtle */}
        <g opacity="0.2">
          <line x1="0" y1="100" x2="900" y2="100" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="0" y1="200" x2="900" y2="200" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="0" y1="300" x2="900" y2="300" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="225" y1="0" x2="225" y2="400" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="450" y1="0" x2="450" y2="400" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="675" y1="0" x2="675" y2="400" stroke="white" strokeWidth="1" strokeDasharray="3,3" />
        </g>

        {/* Connection paths */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="3"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 2,
                  delay: 2 + (0.3 * i),
                  ease: "easeOut",
                }}
              />
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="10%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="90%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Connection points with enhanced visibility */}
        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <motion.circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="6"
                fill={lineColor}
                stroke="white"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.2 + (i * 0.1), type: "spring", stiffness: 200 }}
              />
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="6"
                fill={lineColor}
                opacity="0.6"
              >
                <animate
                  attributeName="r"
                  from="6"
                  to="16"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
            <g key={`end-${i}`}>
              <motion.circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="6"
                fill={lineColor}
                stroke="white"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.2 + (i * 0.1), type: "spring", stiffness: 200 }}
              />
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="6"
                fill={lineColor}
                opacity="0.6"
              >
                <animate
                  attributeName="r"
                  from="6"
                  to="16"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.6"
                  to="0"
                  dur="2s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}