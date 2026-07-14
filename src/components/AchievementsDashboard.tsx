import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "motion/react";
import { Trophy, Award, Calendar, FolderGit2, Cpu, Zap, Flame, BarChart3, Brain, Code2, Database, Terminal } from "lucide-react";
import { ProjectData, CertificateData, AwardData, HackathonData } from "../types";

// Performance-optimized scroll-triggered animated counter
export function AnimatedCounter({ value, suffix = "", trigger = true }: { value: number; suffix?: string; trigger?: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!trigger) return;
    // Reset count and animate to target value
    count.set(0);
    const controls = animate(count, value, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1], // Custom sleek out-expo ease
    });
    return () => controls.stop();
  }, [value, count, trigger]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toString() + suffix;
      }
    });
  }, [rounded, suffix]);

  return (
    <span ref={ref} className="font-mono text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
      0{suffix}
    </span>
  );
}

interface AchievementsDashboardProps {
  projects: ProjectData[];
  certificates: CertificateData[];
  hackathons: HackathonData[];
  awards: AwardData[];
}

export default function AchievementsDashboard({
  projects,
  certificates,
  hackathons,
  awards
}: AchievementsDashboardProps) {
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsContainerRef, { once: true, margin: "-80px" });

  // Safe default lengths if the state is still booting
  const projectsCount = projects?.length || 0;
  const certificatesCount = certificates?.length || 0;
  const hackathonsCount = hackathons?.length || 0;
  const awardsCount = awards?.length || 0;

  // Static companion stats
  const streakDays = 42;
  const linesWritten = 24.5; // in thousands (K)
  const accuracyRate = 96.4; // percent

  // Stagger wrapper settings for clean intro transition
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 75, 
        damping: 14 
      } 
    }
  };

  return (
    <section id="achievements" className="space-y-10 scroll-mt-20">
      {/* Title block */}
      <div className="space-y-2 text-center md:text-left">
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">Performance Analytics</h3>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Achievements & Metrics Dashboard</h2>
        <p className="text-xs text-slate-400 max-w-xl font-sans">
          Real-time synchronized tracking of academic milestones, system deployments, and hacking participation.
        </p>
      </div>

      {/* Main stats counters grid - 6 Columns Premium Glassmorphism Grid */}
      <motion.div 
        ref={statsContainerRef}
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5"
      >
        {/* Stat 1: Projects Completed */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden bg-[#0B1026]/45 border border-white/10 hover:border-[#3B82F6]/50 rounded-[22px] p-5 transition-all duration-300 group flex flex-col justify-between h-40 shadow-xl shadow-blue-950/10 backdrop-blur-[24px] hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
        >
          {/* Subtle accent glow top-right */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Deployments</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <AnimatedCounter value={projectsCount} trigger={isStatsInView} />
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Real-time</span>
            </div>
            <p className="text-[11px] font-bold text-white font-display">Projects Completed</p>
          </div>
        </motion.div>

        {/* Stat 2: Certificates Earned */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden bg-[#0B1026]/45 border border-white/10 hover:border-[#22D3EE]/50 rounded-[22px] p-5 transition-all duration-300 group flex flex-col justify-between h-40 shadow-xl shadow-blue-950/10 backdrop-blur-[24px] hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Credentials</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <AnimatedCounter value={certificatesCount} trigger={isStatsInView} />
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Verified</span>
            </div>
            <p className="text-[11px] font-bold text-white font-display">Certificates Earned</p>
          </div>
        </motion.div>

        {/* Stat 3: GitHub Repositories */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden bg-[#0B1026]/45 border border-white/10 hover:border-[#7C3AED]/50 rounded-[22px] p-5 transition-all duration-300 group flex flex-col justify-between h-40 shadow-xl shadow-blue-950/10 backdrop-blur-[24px] hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Repositories</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
              <Terminal className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <AnimatedCounter value={28} trigger={isStatsInView} />
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Sources</span>
            </div>
            <p className="text-[11px] font-bold text-white font-display">GitHub Repositories</p>
          </div>
        </motion.div>

        {/* Stat 4: Technologies Mastered */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden bg-[#0B1026]/45 border border-white/10 hover:border-[#22D3EE]/50 rounded-[22px] p-5 transition-all duration-300 group flex flex-col justify-between h-40 shadow-xl shadow-blue-950/10 backdrop-blur-[24px] hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Competencies</span>
            <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center text-[#22D3EE] group-hover:scale-110 transition-transform duration-300">
              <Cpu className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <AnimatedCounter value={18} trigger={isStatsInView} />
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Mastery</span>
            </div>
            <p className="text-[11px] font-bold text-white font-display">Tech Mastered</p>
          </div>
        </motion.div>

        {/* Stat 5: Programming Languages */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden bg-[#0B1026]/45 border border-white/10 hover:border-pink-500/40 rounded-[22px] p-5 transition-all duration-300 group flex flex-col justify-between h-40 shadow-xl shadow-blue-950/10 backdrop-blur-[24px] hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(236,72,153,0.15)]"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-pink-500/10 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Syntaxes</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform duration-300">
              <Code2 className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <AnimatedCounter value={6} trigger={isStatsInView} />
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Languages</span>
            </div>
            <p className="text-[11px] font-bold text-white font-display">Programming Langs</p>
          </div>
        </motion.div>

        {/* Stat 6: AI Models Built */}
        <motion.div
          variants={cardVariants}
          className="relative overflow-hidden bg-[#0B1026]/45 border border-white/10 hover:border-emerald-500/40 rounded-[22px] p-5 transition-all duration-300 group flex flex-col justify-between h-40 shadow-xl shadow-blue-950/10 backdrop-blur-[24px] hover:-translate-y-1.5 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Neural Nets</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <AnimatedCounter value={12} trigger={isStatsInView} />
              <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Forecasting</span>
            </div>
            <p className="text-[11px] font-bold text-white font-display">AI Models Built</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Secondary performance dashboard cards & meters - Premium Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: Micro-performance metrics */}
        <div className="md:col-span-8 bg-[#0B1026]/45 backdrop-blur-[24px] border border-white/10 rounded-[22px] p-6 space-y-6 shadow-xl shadow-blue-950/10">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h4 className="text-[11px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Developer Execution Efficiency</span>
            </h4>
            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">
              System Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Metric A */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Coding Streak</span>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter value={streakDays} suffix="d" />
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Consistent daily low-code and data pipeline iteration.</p>
            </div>

            {/* Metric B */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Lines Committed</span>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter value={24} suffix="K+" />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Total stable TypeScript, Python, and SQL schema code.</p>
            </div>

            {/* Metric C */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Model Precision</span>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter value={96} suffix="%" />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Avg test-set precision across local forecasting arrays.</p>
            </div>
          </div>

          {/* Interactive loading progress indicators for a high-tech feel */}
          <div className="pt-4 border-t border-white/5 space-y-3.5">
            <h5 className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Workspace Competency Mapping</h5>
            
            <div className="space-y-2.5">
              {/* Bar 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>AI Prompt & Low-Code Workflows</span>
                  <span className="font-bold text-white">98%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "98%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" 
                  />
                </div>
              </div>

              {/* Bar 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Data Science & Analytical Models</span>
                  <span className="font-bold text-white">88%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "88%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full" 
                  />
                </div>
              </div>

              {/* Bar 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Full Stack Application Engineering</span>
                  <span className="font-bold text-white">82%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "82%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Highlights and narrative - Premium Glassmorphism */}
        <div className="md:col-span-4 bg-[#0B1026]/45 backdrop-blur-[24px] border border-white/10 rounded-[22px] p-6 flex flex-col justify-between space-y-4 shadow-xl shadow-blue-950/10 transition-all duration-300 hover:border-[#22D3EE]/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Milestone Summary</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Deploying complete interactive systems in hours, not weeks. By utilizing advanced prompt compilers and robust reactive state channels, I accelerate the software cycle with high-fidelity outputs.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5 text-[10px] text-slate-400">
            <div className="flex justify-between items-center">
              <span>Primary Study Inst.</span>
              <strong className="text-white font-sans font-semibold">RUPP</strong>
            </div>
            <div className="flex justify-between items-center">
              <span>Current Status</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Active Scholar
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Database Sync</span>
              <span className="text-blue-400 font-mono font-bold">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
