import React from "react";
import { motion } from "motion/react";
import { 
  Brain, 
  Database, 
  Cpu, 
  Code2, 
  Terminal, 
  BarChart3, 
  Activity, 
  Layers, 
  Globe, 
  Server,
  Zap,
  Sparkles
} from "lucide-react";

interface TechItem {
  name: string;
  category: "Languages" | "AI & ML" | "Frameworks" | "Tools & Data";
  icon: React.ComponentType<any>;
  level: string;
  useCase: string;
  glowColor: string;
  floatDuration: number;
}

const techItems: TechItem[] = [
  {
    name: "Python",
    category: "Languages",
    icon: Terminal,
    level: "Expert / Core",
    useCase: "Data pipelines, scripts, model architectures",
    glowColor: "rgba(59, 130, 246, 0.25)",
    floatDuration: 4.5
  },
  {
    name: "TensorFlow & Keras",
    category: "AI & ML",
    icon: Brain,
    level: "Advanced",
    useCase: "Deep Neural Networks, CNN image filters, forecasting",
    glowColor: "rgba(249, 115, 22, 0.25)",
    floatDuration: 5.2
  },
  {
    name: "TypeScript",
    category: "Languages",
    icon: Code2,
    level: "Advanced",
    useCase: "Type-safe interfaces, full-stack applications",
    glowColor: "rgba(34, 211, 238, 0.25)",
    floatDuration: 4.8
  },
  {
    name: "React & Vite",
    category: "Frameworks",
    icon: Globe,
    level: "Advanced",
    useCase: "Interactive analytical dashboards, reactive state",
    glowColor: "rgba(124, 58, 237, 0.25)",
    floatDuration: 5.6
  },
  {
    name: "PostgreSQL & SQL",
    category: "Tools & Data",
    icon: Database,
    level: "Expert",
    useCase: "Relational modeling, analytical query pipelines",
    glowColor: "rgba(16, 185, 129, 0.25)",
    floatDuration: 4.2
  },
  {
    name: "Pandas & NumPy",
    category: "Tools & Data",
    icon: BarChart3,
    level: "Expert",
    useCase: "Dataset cleansing, matrix algebra, regressions",
    glowColor: "rgba(236, 72, 153, 0.25)",
    floatDuration: 5.0
  },
  {
    name: "Scikit-Learn",
    category: "AI & ML",
    icon: Activity,
    level: "Advanced",
    useCase: "Classification, clustering, pipeline validation",
    glowColor: "rgba(59, 130, 246, 0.25)",
    floatDuration: 4.6
  },
  {
    name: "Node & Express",
    category: "Frameworks",
    icon: Server,
    level: "Advanced",
    useCase: "REST APIs, secure token routes, system syncing",
    glowColor: "rgba(124, 58, 237, 0.25)",
    floatDuration: 5.4
  },
  {
    name: "Git & GitHub Actions",
    category: "Tools & Data",
    icon: Layers,
    level: "Advanced",
    useCase: "CI/CD automations, trunk branching, version arrays",
    glowColor: "rgba(16, 185, 129, 0.25)",
    floatDuration: 4.9
  }
];

export default function TechStack() {
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 14 
      } 
    }
  };

  return (
    <section id="tech-stack" className="space-y-10 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Zap className="w-4 h-4 animate-pulse" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#22D3EE] font-mono">Cognitive Engine</h3>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white">Technical Architecture & Stack</h2>
          <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
            Floating, responsive neural grid mapping verified competencies across core programming syntaxes, data wrangling layers, and deep learning libraries.
          </p>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 px-3.5 py-1.5 rounded-full uppercase font-bold shadow-lg">
          {techItems.length} ACTIVE COMPLIANCES
        </span>
      </div>

      {/* Responsive Staggered Grid of Floating Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {techItems.map((tech) => {
          const IconComponent = tech.icon;
          return (
            <motion.div
              key={tech.name}
              variants={cardVariants}
              animate={prefersReducedMotion ? {} : {
                y: [0, -6, 0],
              }}
              transition={prefersReducedMotion ? {} : {
                duration: tech.floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative overflow-hidden bg-[#0B1026]/45 border border-white/10 hover:border-[#22D3EE]/50 rounded-[22px] p-6 transition-all duration-300 group flex flex-col justify-between h-44 shadow-xl shadow-blue-950/10 backdrop-blur-[24px] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
              style={{
                "--glow-color": tech.glowColor
              } as React.CSSProperties}
            >
              {/* Radial glow background on hover */}
              <div 
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--glow-color)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              />

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
                    {tech.category}
                  </span>
                  <h4 className="text-lg font-black font-display text-white mt-1.5 group-hover:text-[#22D3EE] transition-colors">
                    {tech.name}
                  </h4>
                </div>

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-[#22D3EE] group-hover:border-[#22D3EE]/40 group-hover:bg-[#22D3EE]/5 group-hover:scale-110 transition-all duration-300">
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>

              {/* Detail specifications revealed dynamically */}
              <div className="space-y-2 relative z-10 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-mono">Expertise Rating</span>
                  <span className="text-[#22D3EE] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {tech.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal line-clamp-2 group-hover:text-slate-300 transition-colors">
                  {tech.useCase}
                </p>
              </div>

            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
