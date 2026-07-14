import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { 
  Brain, 
  Cpu, 
  TrendingUp, 
  Layers, 
  Activity, 
  Globe as GlobeIcon, 
  Database, 
  Code2, 
  Terminal, 
  Zap, 
  Sparkles,
  BarChart3,
  Server,
  CloudLightning,
  Boxes,
  Compass,
  Trophy,
  Workflow
} from "lucide-react";

// Types for the floating tech icons
interface FloatingTech {
  name: string;
  color: string;
  bgGlow: string;
  icon: React.ComponentType<any>;
  xOffset: number;
  yOffset: number;
  duration: number;
}

// Tech items list
const techItems: FloatingTech[] = [
  { name: "Python", color: "#3776AB", bgGlow: "rgba(55, 118, 171, 0.4)", icon: Terminal, xOffset: -120, yOffset: -130, duration: 6 },
  { name: "TensorFlow", color: "#FF6F00", bgGlow: "rgba(255, 111, 0, 0.4)", icon: Brain, xOffset: 120, yOffset: -140, duration: 7 },
  { name: "PyTorch", color: "#EE4C2C", bgGlow: "rgba(238, 76, 44, 0.4)", icon: Zap, xOffset: -140, yOffset: 120, duration: 8 },
  { name: "Pandas", color: "#150458", bgGlow: "rgba(21, 4, 88, 0.45)", icon: Activity, xOffset: 130, yOffset: 110, duration: 6.5 },
  { name: "NumPy", color: "#013243", bgGlow: "rgba(1, 50, 67, 0.4)", icon: Cpu, xOffset: -160, yOffset: -40, duration: 7.5 },
  { name: "Scikit-Learn", color: "#F7931E", bgGlow: "rgba(247, 147, 30, 0.4)", icon: Compass, xOffset: 150, yOffset: -30, duration: 9 },
  { name: "SQL", color: "#00BCFF", bgGlow: "rgba(0, 188, 255, 0.4)", icon: Database, xOffset: -60, yOffset: -155, duration: 8.5 },
  { name: "React", color: "#61DAFB", bgGlow: "rgba(97, 218, 251, 0.4)", icon: Code2, xOffset: 60, yOffset: -155, duration: 7.2 },
  { name: "Next.js", color: "#FFFFFF", bgGlow: "rgba(255, 255, 255, 0.25)", icon: Server, xOffset: -70, yOffset: 150, duration: 9.5 },
  { name: "Docker", color: "#2496ED", bgGlow: "rgba(36, 150, 237, 0.4)", icon: Boxes, xOffset: 70, yOffset: 150, duration: 8.2 },
  { name: "GitHub", color: "#FFFFFF", bgGlow: "rgba(255, 255, 255, 0.2)", icon: Workflow, xOffset: -165, yOffset: 40, duration: 6.8 },
  { name: "OpenAI", color: "#412991", bgGlow: "rgba(65, 41, 145, 0.4)", icon: Sparkles, xOffset: 165, yOffset: 45, duration: 8.8 }
];

// Custom springy digital counter
function CountingText({ endValue, duration = 2, suffix = "", delay = 0, inView = false }: { endValue: number; duration?: number; suffix?: string; delay?: number; inView?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = endValue;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(10, Math.floor(totalMiliseconds / end));
    
    const timeout = setTimeout(() => {
      const timer = setInterval(() => {
        start += Math.ceil(end / 40);
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [endValue, duration, delay, inView]);

  return <span>{count}{suffix}</span>;
}

export default function AIDashboard() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(dashboardRef, { once: true, margin: "-100px" });
  
  // States for training progress loop
  const [epoch, setEpoch] = useState(1);
  const [loss, setLoss] = useState(0.85);
  const [acc, setAcc] = useState(62.4);
  const [activeTask, setActiveTask] = useState<"classification" | "segmentation" | "forecasting">("classification");
  const [predictionOutput, setPredictionOutput] = useState<string>("Initializing model weights...");
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  // Canvas Refs
  const neuralCanvasRef = useRef<HTMLCanvasElement>(null);
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);

  // AI Training Loop simulations
  useEffect(() => {
    const trainingInterval = setInterval(() => {
      setEpoch((prev) => {
        if (prev >= 1000) return 1;
        
        // Progressively decrease loss and increase accuracy
        const nextEpoch = prev + 1;
        const trend = Math.sin(nextEpoch * 0.05) * 0.01;
        setLoss((prevLoss) => Math.max(0.024, Number((prevLoss - (0.85 / 1000) + trend).toFixed(4))));
        setAcc((prevAcc) => Math.min(99.4, Number((prevAcc + (37 / 1000) - trend * 10).toFixed(2))));
        
        // Dynamic simulated predictions
        if (nextEpoch % 5 === 0) {
          const targets = {
            classification: [
              "CLASS: CIFAR-10 Cat [Confidence: 98.7%]",
              "CLASS: MNIST Digit 7 [Confidence: 99.4%]",
              "CLASS: Imagenet 'Golden Retriever' [94.2%]",
              "CLASS: CIFAR-10 Automobile [97.9%]",
              "CLASS: MNIST Digit 3 [Confidence: 99.1%]"
            ],
            segmentation: [
              "SEG: Cell boundary isolated [Overlap IOUs: 0.94]",
              "SEG: Autonomous vehicle lane mapped [IOUs: 0.89]",
              "SEG: Tumor volume extracted [Precision: 0.96]",
              "SEG: Obstacle bounding box locked [IOUs: 0.92]"
            ],
            forecasting: [
              "FORECAST: Epoch t+1: 142.85 [Error Variance: ±0.15%]",
              "FORECAST: Temperature drift delta: +0.42°C",
              "FORECAST: VRAM demand forecast steady",
              "FORECAST: Convergence pattern stable [α = 0.05]"
            ]
          };
          const list = targets[activeTask];
          setPredictionOutput(list[Math.floor(Math.random() * list.length)]);
        }

        return nextEpoch;
      });
    }, 120);

    return () => clearInterval(trainingInterval);
  }, [activeTask]);

  // 1. Neural Network Animation inside AI Analytics Panel
  useEffect(() => {
    const canvas = neuralCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = canvas.width = 300;
    let height = canvas.height = 140;

    interface Node {
      x: number;
      y: number;
      layer: number;
      pulse: number;
      pulseSpeed: number;
    }

    const layers = [4, 6, 5, 3];
    const nodes: Node[] = [];

    // Distribute nodes in layers
    layers.forEach((layerSize, layerIdx) => {
      const x = 30 + (width - 60) * (layerIdx / (layers.length - 1));
      for (let i = 0; i < layerSize; i++) {
        const y = 15 + (height - 30) * (i / (layerSize - 1));
        nodes.push({
          x,
          y,
          layer: layerIdx,
          pulse: Math.random() * Math.PI,
          pulseSpeed: 0.03 + Math.random() * 0.05
        });
      }
    });

    const renderNeural = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw synapse connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = 0; j < nodes.length; j++) {
          const n2 = nodes[j];
          if (n1.layer + 1 === n2.layer) {
            const dist = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2);
            // Sinusoidal opacity based on time and distance
            const baseAlpha = 0.05 + Math.sin(n1.pulse * 2) * 0.04;
            ctx.strokeStyle = `rgba(34, 211, 238, ${baseAlpha})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();

            // Forward traveling pulses
            if (n1.pulse > Math.PI * 0.8 && Math.random() > 0.985) {
              const gradient = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
              gradient.addColorStop(0, "rgba(34, 211, 238, 0.8)");
              gradient.addColorStop(1, "rgba(124, 58, 237, 0)");
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
              ctx.lineWidth = 0.6;
            }
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        node.pulse += node.pulseSpeed;
        if (node.pulse > Math.PI * 2) node.pulse = 0;

        const pulseScale = 1 + Math.sin(node.pulse) * 0.25;
        const size = (node.layer === 0 || node.layer === layers.length - 1 ? 3.5 : 2.5) * pulseScale;

        // Outer glow
        ctx.fillStyle = node.layer === 0 
          ? "rgba(59, 130, 246, 0.15)" 
          : node.layer === layers.length - 1 
            ? "rgba(236, 72, 153, 0.15)" 
            : "rgba(34, 211, 238, 0.15)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Node center
        ctx.fillStyle = node.layer === 0 
          ? "#3B82F6" 
          : node.layer === layers.length - 1 
            ? "#EC4899" 
            : "#22D3EE";
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(renderNeural);
    };

    renderNeural();

    return () => cancelAnimationFrame(animId);
  }, []);

  // 2. 3D Holographic Spinning Globe Animation
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = canvas.width = 180;
    let height = canvas.height = 180;

    interface GeoNode {
      x: number;
      y: number;
      z: number;
      ox: number;
      oy: number;
      oz: number;
      pulse: number;
    }

    const nodes: GeoNode[] = [];
    const count = 35;
    const radius = 62;

    // Distribute nodes evenly across sphere using Fibonacci lattice
    for (let i = 0; i < count; i++) {
      const theta = Math.acos(1 - 2 * (i + 0.5) / count);
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      nodes.push({
        x, y, z,
        ox: x, oy: y, oz: z,
        pulse: Math.random() * Math.PI
      });
    }

    let angleY = 0;
    const cx = width / 2;
    const cy = height / 2;

    const renderGlobe = () => {
      ctx.clearRect(0, 0, width, height);

      // Spin rotation
      angleY += 0.006;
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Back half depth lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(34, 211, 238, 0.04)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Horizontal latitude orbits
      for (let l = -3; l <= 3; l++) {
        const latH = (radius * l) / 4.2;
        const latR = Math.sqrt(radius * radius - latH * latH);
        ctx.ellipse(cx, cy + latH * 0.4, latR, latR * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotate & project nodes
      const projected = nodes.map((n) => {
        // Rotate around Y-axis
        const x1 = n.ox * cosY - n.oz * sinY;
        const z1 = n.ox * sinY + n.oz * cosY;

        // Add soft tilt around X-axis
        const y1 = n.oy * 0.95 - z1 * 0.3;
        const z2 = n.oy * 0.3 + z1 * 0.95;

        const scale = 220 / (220 + z2);
        const px = cx + x1 * scale;
        const py = cy + y1 * scale;

        n.pulse += 0.04;

        return { x: px, y: py, z: z2, scale, pulse: n.pulse };
      });

      // Connections across front nodes
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.z > 15) continue; // Behind depth limit

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (p2.z > 15) continue;

          const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          if (dist < 55) {
            const alpha = (1 - dist / 55) * 0.25 * (1 - (p1.z + radius) / (radius * 2));
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw continents nodes
      projected.forEach((node) => {
        const size = Math.max(1, 2.4 * node.scale);
        const alpha = Math.max(0.08, 1 - (node.z + radius) / (radius * 2));
        const blink = Math.sin(node.pulse);

        ctx.fillStyle = blink > 0.8
          ? `rgba(34, 211, 238, ${alpha * 0.9})`
          : `rgba(124, 58, 237, ${alpha * 0.7})`;

        ctx.beginPath();
        ctx.arc(node.x, node.y, size + (blink > 0.8 ? 1 : 0), 0, Math.PI * 2);
        ctx.fill();

        if (blink > 0.85 && node.z < 0) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.3 * (1 - blink)})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // HUD surrounding circles
      ctx.strokeStyle = "rgba(124, 58, 237, 0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(34, 211, 238, 0.2)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.12, angleY, angleY + Math.PI * 0.3);
      ctx.stroke();

      animId = requestAnimationFrame(renderGlobe);
    };

    renderGlobe();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div 
      ref={dashboardRef}
      className="absolute right-0 top-[10%] bottom-[10%] w-[45%] hidden xl:flex flex-col gap-5 p-2 select-none pointer-events-none z-0 overflow-visible"
    >
      {/* ------------------------------------------------------------- */}
      {/* HUD CONTAINER - Float Animation over the profile section      */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full flex flex-col gap-4 pointer-events-auto"
      >
        {/* Row 1: AI Analytics (Left Widget) & 3D Spinning Globe (Right Widget) */}
        <div className="flex gap-4 w-full">
          {/* AI Analytics Card */}
          <div className="flex-1 bg-[#0B1026]/40 backdrop-blur-[24px] border border-white/10 rounded-[22px] p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            {/* Top Border Glow Line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#22D3EE]/60 to-transparent" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">Neural Array Sync</span>
              </div>
              <div className="flex items-center gap-1 bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-1.5 py-0.5 rounded text-[8px] font-mono text-[#22D3EE]">
                <Activity className="w-2.5 h-2.5 animate-pulse" />
                <span>98.7% ACC</span>
              </div>
            </div>

            {/* Simulated Live Canvas for Neural Net */}
            <div className="my-2 bg-[#050816]/30 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center">
              <canvas ref={neuralCanvasRef} className="w-full max-w-[280px] h-[100px]" />
            </div>

            {/* Model stats footer */}
            <div className="flex justify-between items-center text-[8px] font-mono text-slate-400">
              <div className="space-y-0.5">
                <span>EPOCH: <span className="text-white font-bold">{epoch}</span></span>
                <span className="block text-[#22D3EE]">LOSS: {loss}</span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="block text-emerald-400">INFERENCE: Active</span>
                <span className="text-slate-400">VAL_ACC: {acc}%</span>
              </div>
            </div>
          </div>

          {/* 3D Spinning Globe Card */}
          <div className="w-[185px] bg-[#0B1026]/45 backdrop-blur-[24px] border border-white/10 rounded-[22px] p-4 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden group">
            {/* Top Border Glow Line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#7C3AED]/60 to-transparent" />

            <div className="flex items-center gap-1 w-full justify-start text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
              <GlobeIcon className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Edge Mesh</span>
            </div>

            {/* Holographic Globe Canvas */}
            <div className="my-1.5 flex items-center justify-center relative">
              <canvas ref={globeCanvasRef} className="w-[125px] h-[125px]" />
              {/* Spinning orbiting ring overlay */}
              <div className="absolute inset-0 border border-[#22D3EE]/10 rounded-full animate-[spin_12s_linear_infinite]" />
            </div>

            <div className="flex justify-between w-full text-[8px] font-mono text-slate-400">
              <span>ASIA_NODE_01</span>
              <span className="text-pink-500 animate-pulse">● SYNCED</span>
            </div>
          </div>
        </div>

        {/* Row 2: Live Predictive Tasks and Interactive Data Analytics Panel */}
        <div className="bg-[#0B1026]/40 backdrop-blur-[24px] border border-white/10 rounded-[22px] p-4 flex flex-col gap-3 shadow-2xl relative overflow-hidden">
          {/* Top Border Glow Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent" />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest font-display">Inference Engine Stream</span>
            </div>
            
            {/* Inference mode tabs */}
            <div className="flex gap-1 bg-[#050816]/60 border border-white/5 p-0.5 rounded-lg">
              {["classification", "segmentation", "forecasting"].map((task) => (
                <button
                  key={task}
                  onClick={() => setActiveTask(task as any)}
                  className={`text-[7px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    activeTask === task
                      ? "bg-[#3B82F6]/20 text-white border border-[#3B82F6]/40 font-bold"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {task === "classification" ? "CLF" : task === "segmentation" ? "SEG" : "FCST"}
                </button>
              ))}
            </div>
          </div>

          {/* Scrolling code predictions output */}
          <div className="bg-[#050816]/60 border border-white/5 p-2.5 rounded-xl font-mono text-[9px] text-[#22D3EE] flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
              <Terminal className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="animate-pulse">{predictionOutput}</span>
            </div>
            <span className="text-[8px] px-1 py-0.5 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 rounded shrink-0 font-bold uppercase">
              14ms LAT
            </span>
          </div>

          {/* Performance Heatmap Matrix simulation */}
          <div className="grid grid-cols-8 gap-1.5 py-1 border-t border-white/5 mt-1">
            {Array.from({ length: 16 }).map((_, idx) => {
              const pulseDelay = Math.sin(idx * 0.6) * 2;
              return (
                <motion.div
                  key={idx}
                  animate={{
                    opacity: [0.15, 0.85, 0.15]
                  }}
                  transition={{
                    duration: 3 + Math.abs(pulseDelay),
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className={`h-4 rounded-md border flex items-center justify-center font-mono text-[6px] font-bold ${
                    idx % 3 === 0 
                      ? "bg-purple-500/10 border-purple-500/35 text-purple-300"
                      : idx % 5 === 0 
                        ? "bg-cyan-500/10 border-cyan-500/35 text-cyan-300"
                        : "bg-blue-500/10 border-blue-500/35 text-blue-300"
                  }`}
                >
                  {Math.floor(Math.sin(idx + epoch * 0.1) * 9 + 10)}
                </motion.div>
              );
            })}
          </div>

          {/* Quick Stats Grid with counter nodes */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/5">
            <div className="p-2 bg-[#050816]/30 rounded-xl border border-white/5">
              <span className="block text-[7px] text-slate-400 uppercase font-mono">Dataset Swarm</span>
              <h5 className="text-[11px] font-bold text-white font-mono mt-0.5">
                <CountingText endValue={42} suffix=" M" inView={isInView} />
              </h5>
            </div>
            <div className="p-2 bg-[#050816]/30 rounded-xl border border-white/5">
              <span className="block text-[7px] text-slate-400 uppercase font-mono">VRAM LOAD</span>
              <h5 className="text-[11px] font-bold text-[#22D3EE] font-mono mt-0.5">
                <CountingText endValue={71} suffix="%" inView={isInView} />
              </h5>
            </div>
            <div className="p-2 bg-[#050816]/30 rounded-xl border border-white/5">
              <span className="block text-[7px] text-slate-400 uppercase font-mono">Convergence</span>
              <h5 className="text-[11px] font-bold text-emerald-400 font-mono mt-0.5">0.024</h5>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* GENTLY FLOATING AND GLOWING INTUITIVE TECH BUBBLES            */}
      {/* ------------------------------------------------------------- */}
      {techItems.map((item) => {
        const Icon = item.icon;
        const isHovered = hoveredIcon === item.name;
        return (
          <motion.div
            key={item.name}
            style={{
              position: "absolute",
              right: "40%",
              top: "40%",
              x: item.xOffset,
              y: item.yOffset,
              zIndex: isHovered ? 50 : 5,
            }}
            animate={{
              y: [item.yOffset, item.yOffset - 15, item.yOffset],
              x: [item.xOffset, item.xOffset + 8, item.xOffset]
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            onMouseEnter={() => setHoveredIcon(item.name)}
            onMouseLeave={() => setHoveredIcon(null)}
            className="group shrink-0 pointer-events-auto"
          >
            {/* Tech Badge */}
            <div 
              className="relative p-2 rounded-xl bg-[#050816]/85 border border-white/10 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer flex items-center justify-center h-10 w-10 overflow-visible"
              style={{
                borderColor: isHovered ? item.color : "rgba(255, 255, 255, 0.1)",
                boxShadow: isHovered ? `0 0 15px ${item.bgGlow}` : "none"
              }}
            >
              {/* Behind Soft Radial Glow */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle, ${item.bgGlow} 0%, transparent 70%)`
                }}
              />
              <Icon 
                className="w-5 h-5 transition-colors relative z-10" 
                style={{ color: isHovered ? item.color : "rgba(255, 255, 255, 0.45)" }}
              />
              
              {/* Tooltip on Hover */}
              <div 
                className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#0B1026] text-[7px] text-white font-mono uppercase tracking-wider border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50"
              >
                {item.name}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
