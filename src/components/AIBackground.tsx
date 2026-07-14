import React, { useEffect, useRef } from "react";

export default function AIBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse position relative to canvas
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Particle class
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      originalVx: number;
      originalVy: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Slow subtle movement
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.originalVx = this.vx;
        this.originalVy = this.vy;
        this.size = Math.random() * 2 + 0.8;
        
        // Varying primary, secondary, purple accent colors for particles
        const colors = [
          "rgba(59, 130, 246, 0.45)", // Blue
          "rgba(34, 211, 238, 0.45)", // Cyan
          "rgba(124, 58, 237, 0.35)", // Purple
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        // Simple bounds check and bounce/wrap
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Subtle push from mouse
        if (mouse.x !== -1000) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = mouse.radius * mouse.radius;
          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (mouse.radius - dist) / mouse.radius;
            // Push away gently
            this.x += (dx / dist) * force * 1.5;
            this.y += (dy / dist) * force * 1.5;
          }
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
      }
    }

    // Set particle density based on screen size
    const particleCount = Math.min(80, Math.floor((width * height) / 18000));
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw dark futuristic mesh base background color
      ctx.fillStyle = "#050816";
      ctx.fillRect(0, 0, width, height);

      // Draw glowing background grid lines
      ctx.strokeStyle = "rgba(59, 130, 246, 0.035)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      // Draw connecting lines between close particles (Neural Network Effect)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 14400) { // 120 * 120 = 14400
            const dist = Math.sqrt(distSq);
            // Stronger opacity for closer nodes
            const alpha = (1 - dist / 120) * 0.14;
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect particles to user's cursor
        if (mouse.x !== -1000) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = mouse.radius * mouse.radius;
          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / mouse.radius) * 0.18;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-20 bg-[#050816]">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-65" />

      {/* Decorative ambient blurred orbs / gradient mesh */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent blur-[120px] will-change-transform transform-gpu backface-hidden" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-purple-600/10 via-cyan-600/5 to-transparent blur-[140px] will-change-transform transform-gpu backface-hidden" />
      <div className="absolute top-[40%] right-[15%] w-[350px] h-[350px] rounded-full bg-[#3B82F6]/5 blur-[100px] animate-pulse will-change-transform transform-gpu backface-hidden" style={{ animationDuration: "12s" }} />
      <div className="absolute bottom-[30%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#7C3AED]/5 blur-[120px] animate-pulse will-change-transform transform-gpu backface-hidden" style={{ animationDuration: "16s" }} />
    </div>
  );
}
