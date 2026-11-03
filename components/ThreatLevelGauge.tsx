
import React from 'react';

interface ThreatLevelGaugeProps {
  value: number; // 0 to 100
}

const ThreatLevelGauge: React.FC<ThreatLevelGaugeProps> = ({ value }) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  let color = '#22c55e'; // Green
  let label = 'SECURE';
  if (normalizedValue > 40) { color = '#f59e0b'; label = 'ELEVATED'; }
  if (normalizedValue > 75) { color = '#ef4444'; label = 'CRITICAL'; }

  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <div className="relative w-full max-w-[280px] aspect-[2/1] flex items-end justify-center">
        <svg
          viewBox={`0 0 ${radius * 2} ${radius}`}
          className="w-full h-full transform transition-all duration-1000 ease-out"
        >
          {/* Background Track */}
          <path
            d={`M ${strokeWidth/2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - strokeWidth/2},${radius}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Active Value Track */}
          <path
            d={`M ${strokeWidth/2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - strokeWidth/2},${radius}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 1s ease'
            }}
            className="filter drop-shadow-[0_0_8px_currentColor]"
          />

          {/* Markers */}
          {[...Array(11)].map((_, i) => {
             const angle = (i * 18) * (Math.PI / 180);
             const x1 = radius - (radius - strokeWidth) * Math.cos(angle);
             const y1 = radius - (radius - strokeWidth) * Math.sin(angle);
             const x2 = radius - (radius - 2) * Math.cos(angle);
             const y2 = radius - (radius - 2) * Math.sin(angle);
             return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />;
          })}
        </svg>

        {/* Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <div className="text-4xl font-black tracking-tighter transition-colors duration-1000 flex items-baseline" style={{ color }}>
            {Math.round(normalizedValue)}
            <span className="text-sm ml-1 opacity-50">%</span>
          </div>
          <div className="text-[10px] font-black tracking-[0.4em] uppercase opacity-80 text-white animate-pulse" style={{ color }}>
             {label}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatLevelGauge;