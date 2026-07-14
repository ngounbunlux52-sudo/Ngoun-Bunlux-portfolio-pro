import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Cpu, Network, Globe, Activity } from "lucide-react";

export default function AIIllustration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseRef.current = { x, y };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number | null = null;
    let isCanvasVisible = true;
    let width = canvas.width = 340;
    let height = canvas.height = 340;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          width = canvas.width = Math.floor(entry.contentRect.width);
          height = canvas.height = Math.floor(entry.contentRect.height);
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // 3D Globe Node generation
    interface Node3D {
      x: number;
      y: number;
      z: number;
      ox: number;
      oy: number;
      oz: number;
      pulse: number;
      pulseSpeed: number;
    }

    const globeNodes: Node3D[] = [];
    const nodeCount = 50;
    const radius = 90;

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * Math.PI * 2;

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      globeNodes.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // Drifting particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }

    const particles: Particle[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      size: 1 + Math.random() * 2,
      alpha: 0.2 + Math.random() * 0.6,
      color: Math.random() > 0.5 ? "rgba(34, 211, 238, " : "rgba(124, 58, 237, ",
    }));

    // Circuit trace paths
    interface Trace {
      points: { x: number; y: number }[];
      progress: number;
      speed: number;
    }

    const traces: Trace[] = Array.from({ length: 4 }, () => {
      const side = Math.floor(Math.random() * 4);
      let sx = 0, sy = 0;
      if (side === 0) { sx = Math.random() * width; sy = 0; }
      else if (side === 1) { sx = width; sy = Math.random() * height; }
      else if (side === 2) { sx = Math.random() * width; sy = height; }
      else { sx = 0; sy = Math.random() * height; }

      const cx = width / 2;
      const cy = height / 2;
      return {
        points: [
          { x: sx, y: sy },
          { x: sx + (cx - sx) * 0.4, y: sy + (cy - sy) * 0.2 },
          { x: sx + (cx - sx) * 0.6, y: sy + (cy - sy) * 0.6 },
          { x: cx + (Math.random() - 0.5) * 40, y: cy + (Math.random() - 0.5) * 40 },
        ],
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
      };
    });

    let angleY = 0;
    let angleX = 0.2;

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      const wasVisible = isCanvasVisible;
      isCanvasVisible = entry.isIntersecting;
      if (isCanvasVisible && !wasVisible) {
        if (frameId === null) {
          frameId = requestAnimationFrame(render);
        }
      }
    }, { threshold: 0.01 });

    visibilityObserver.observe(canvas);

    const render = () => {
      if (!isCanvasVisible) {
        frameId = null;
        return;
      }
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Mouse parallax shifting
      const parallaxX = mouseRef.current.x * 12;
      const parallaxY = mouseRef.current.y * 12;

      // 1. Draw Ambient Gradient Mesh in background
      const radialGlow = ctx.createRadialGradient(
        cx + parallaxX,
        cy + parallaxY,
        10,
        cx + parallaxX,
        cy + parallaxY,
        width * 0.65
      );
      radialGlow.addColorStop(0, "rgba(59, 130, 246, 0.12)");
      radialGlow.addColorStop(0.5, "rgba(124, 58, 237, 0.06)");
      radialGlow.addColorStop(1, "rgba(5, 8, 22, 0)");
      ctx.fillStyle = radialGlow;
      ctx.beginPath();
      ctx.arc(cx + parallaxX, cy + parallaxY, width * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Holographic background rings
      ctx.strokeStyle = "rgba(34, 211, 238, 0.12)";
      ctx.lineWidth = 1;
      
      // Ring 1
      ctx.beginPath();
      ctx.arc(cx + parallaxX, cy + parallaxY, radius * 1.35, 0, Math.PI * 2);
      ctx.stroke();

      // Ring 2 (Dashed and rotating)
      ctx.strokeStyle = "rgba(124, 58, 237, 0.18)";
      ctx.setLineDash([6, 12]);
      ctx.beginPath();
      ctx.arc(cx + parallaxX, cy + parallaxY, radius * 1.5, angleY * 0.5, angleY * 0.5 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Draw Circuit traces
      ctx.lineWidth = 1.5;
      traces.forEach((trace) => {
        ctx.beginPath();
        ctx.moveTo(trace.points[0].x, trace.points[0].y);
        for (let i = 1; i < trace.points.length; i++) {
          ctx.lineTo(trace.points[i].x, trace.points[i].y);
        }
        ctx.strokeStyle = "rgba(34, 211, 238, 0.06)";
        ctx.stroke();

        // Draw animated signal dot
        const t = trace.progress;
        const segmentCount = trace.points.length - 1;
        const scaledT = t * segmentCount;
        const segmentIndex = Math.floor(scaledT);
        const segmentProgress = scaledT - segmentIndex;

        if (segmentIndex >= 0 && segmentIndex < segmentCount) {
          const p1 = trace.points[segmentIndex];
          const p2 = trace.points[segmentIndex + 1];
          const dx = p1.x + (p2.x - p1.x) * segmentProgress;
          const dy = p1.y + (p2.y - p1.y) * segmentProgress;

          ctx.fillStyle = "rgba(34, 211, 238, 0.8)";
          ctx.beginPath();
          ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Outer glowing aura for trace signal
          ctx.fillStyle = "rgba(34, 211, 238, 0.15)";
          ctx.beginPath();
          ctx.arc(dx, dy, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        trace.progress += trace.speed;
        if (trace.progress > 1) {
          trace.progress = 0;
        }
      });

      // Update globe rotation angles
      angleY += 0.004; // rotating globe Y-axis
      angleX = 0.15 + Math.sin(angleY * 0.25) * 0.05; // soft wave in X-axis

      // Project 3D nodes onto 2D screen coords
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projectedNodes = globeNodes.map((node) => {
        // Rotate around Y axis
        let x1 = node.ox * cosY - node.oz * sinY;
        let z1 = node.ox * sinY + node.oz * cosY;

        // Rotate around X axis
        let y1 = node.oy * cosX - z1 * sinX;
        let z2 = node.oy * sinX + z1 * cosX;

        // Perspective scaling
        const scale = 300 / (300 + z2);
        const screenX = cx + x1 * scale + parallaxX;
        const screenY = cy + y1 * scale + parallaxY;

        node.pulse += node.pulseSpeed;

        return {
          x: screenX,
          y: screenY,
          z: z2,
          scale,
          pulseVal: (Math.sin(node.pulse) + 1) / 2, // 0 to 1
        };
      });

      // 4. Draw Neural connection lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projectedNodes.length; i++) {
        const p1 = projectedNodes[i];
        if (p1.z > 40) continue; // Skip nodes that are far behind to improve depth look

        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p2 = projectedNodes[j];
          if (p2.z > 40) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          // Connect nodes if they are within proximity (75 * 75 = 5625)
          if (distSq < 5625) {
            const dist = Math.sqrt(distSq);
            const averageZ = (p1.z + p2.z) / 2; // used for depth fade
            const alphaFactor = Math.max(0, 1 - dist / 75) * (1 - (averageZ + radius) / (radius * 2));
            
            // Connected neural path
            ctx.strokeStyle = `rgba(124, 58, 237, ${alphaFactor * 0.35})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Intermittent glowing signal pulses on connection lines
            if (p1.pulseVal > 0.92 && Math.random() > 0.85) {
              ctx.strokeStyle = `rgba(34, 211, 238, ${alphaFactor * 0.65})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // 5. Draw globe wireframe rings (latitude / longitude lines for tech wireframe aesthetic)
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(34, 211, 238, 0.08)";
      
      // Draw a subtle outer border circle of the globe
      ctx.beginPath();
      ctx.arc(cx + parallaxX, cy + parallaxY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Draw glowing neural network nodes
      projectedNodes.forEach((node) => {
        // Depth-based size and transparency
        const size = Math.max(1, 2.5 * node.scale);
        const depthAlpha = Math.max(0.1, 1 - (node.z + radius) / (radius * 2.2));

        // Draw node center
        ctx.fillStyle = node.pulseVal > 0.7 
          ? `rgba(34, 211, 238, ${depthAlpha * 0.95})` 
          : `rgba(124, 58, 237, ${depthAlpha * 0.85})`;
          
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + (node.pulseVal * 1.5), 0, Math.PI * 2);
        ctx.fill();

        // Pulsing node glow aura
        if (node.pulseVal > 0.6) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${depthAlpha * 0.3 * (1 - node.pulseVal)})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + (node.pulseVal * 6), 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // 7. Draw holographic HUD data visualizations overlays
      ctx.strokeStyle = "rgba(34, 211, 238, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx + parallaxX, cy + parallaxY, radius * 1.1, -Math.PI / 4, Math.PI / 6);
      ctx.stroke();

      ctx.strokeStyle = "rgba(124, 58, 237, 0.35)";
      ctx.beginPath();
      ctx.arc(cx + parallaxX, cy + parallaxY, radius * 1.15, Math.PI * 0.8, Math.PI * 1.15);
      ctx.stroke();

      // Add cyber HUD tickmarks
      ctx.fillStyle = "rgba(34, 211, 238, 0.4)";
      ctx.font = "bold 8px monospace";
      ctx.fillText("AI_CORE_v1.0", cx + radius * 0.85 + parallaxX, cy - radius * 0.85 + parallaxY);
      ctx.fillText("SYS_OK", cx - radius * 1.25 + parallaxX, cy + radius * 0.95 + parallaxY);

      // Mini virtual equalizer bar
      const eqBarCount = 8;
      const barSpacing = 3;
      const startX = cx - ((eqBarCount * 4) / 2) + parallaxX;
      const startY = cy + radius * 1.22 + parallaxY;
      ctx.fillStyle = "rgba(34, 211, 238, 0.35)";
      for (let k = 0; k < eqBarCount; k++) {
        const h = 4 + Math.abs(Math.sin(angleY * 4 + k)) * 10;
        ctx.fillRect(startX + k * (4 + barSpacing), startY - h / 2, 3, h);
      }

      // 8. Draw floating digital particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around limits
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0 || p.x > width) {
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[280px] sm:h-[340px] md:h-[360px] flex items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-[#0B1026]/15 backdrop-blur-sm shadow-inner shadow-blue-500/5 select-none"
    >
      {/* Background soft glow meshes */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Actual interactive rendering canvas */}
      <canvas ref={canvasRef} className="w-full h-full block relative z-10" />

      {/* Futuristic cyber glass labels floating in the illustration space */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 font-mono text-[8px] tracking-widest text-[#22D3EE]/80 uppercase pointer-events-none">
        <div className="flex items-center gap-1 bg-[#050816]/75 border border-cyan-500/20 px-2 py-1 rounded-md backdrop-blur-md shadow-md">
          <Activity className="w-3 h-3 text-[#22D3EE] animate-pulse" />
          <span>SYS STATE: ACTIVE</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 font-mono text-[8px] tracking-widest text-[#7C3AED]/90 uppercase pointer-events-none">
        <div className="flex items-center gap-1 bg-[#050816]/75 border border-[#7C3AED]/20 px-2 py-1 rounded-md backdrop-blur-md shadow-md">
          <Network className="w-3 h-3 text-purple-400" />
          <span>NEURAL_NET: LIVE</span>
        </div>
      </div>
    </div>
  );
}
