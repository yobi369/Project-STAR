
import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
    isActive: boolean;
    volume: number;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isActive, volume }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame = 0;
        const draw = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            if (!isActive) {
                ctx.beginPath();
                ctx.moveTo(0, height / 2);
                ctx.lineTo(width, height / 2);
                ctx.strokeStyle = '#06b6d433';
                ctx.stroke();
                return;
            }

            const amp = Math.max(2, volume * 100);
            ctx.lineWidth = 2;
            
            [
                { color: '#06b6d4', speed: 0.1, off: 0 },
                { color: '#3b82f6', speed: 0.08, off: 1 }
            ].forEach(w => {
                ctx.beginPath();
                ctx.strokeStyle = w.color;
                for (let x = 0; x < width; x++) {
                    const y = height/2 + Math.sin(x*0.05 + frame*w.speed + w.off) * amp * Math.sin(x/width * Math.PI);
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            });

            frame++;
            requestAnimationFrame(draw);
        };
        draw();
    }, [isActive, volume]);

    return <canvas ref={canvasRef} className="w-full h-full" width={400} height={60} />;
};

export default VoiceVisualizer;
