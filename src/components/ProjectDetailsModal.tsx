import React, { useState } from "react";
import { X, ExternalLink, Github, Sparkles, CheckCircle, Database, Server, Info } from "lucide-react";
import { ProjectData } from "../types";

interface ProjectDetailsModalProps {
  project: ProjectData | null;
  onClose: () => void;
}

export default function ProjectDetailsModal({ project, onClose }: ProjectDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "challenges" | "future">("overview");

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#020617]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Decorative Glowing Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-semibold">
                {project.category}
              </span>
              <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-semibold ${
                project.status === "Featured" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}>
                {project.status}
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white mt-1">{project.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Quick Stats Panel */}
          {project.stats && project.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              {project.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-blue-400 font-display">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex border-b border-white/5 gap-2 overflow-x-auto pb-px">
            {(["overview", "features", "challenges", "future"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "border-blue-500 text-white"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {tab === "overview" && "Project Overview"}
                {tab === "features" && "Core Features & Tech"}
                {tab === "challenges" && "Challenges & Solutions"}
                {tab === "future" && "Future Enhancements"}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Body */}
          <div className="space-y-4">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {project.longDescription || project.description}
                </p>
                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Concept Origin</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Designed to demonstrate senior-level system deployment, optimizing UI workflows and applying practical AI technologies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Capabilities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(Array.isArray(project.features)
                      ? project.features
                      : (typeof project.features === "string"
                        ? (project.features as string).split(",").map(s => s.trim())
                        : [])
                    ).map((feat, i) => (
                      <div key={i} className="flex gap-2 items-start text-xs text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Stack</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(project.technologies)
                      ? project.technologies
                      : (typeof project.technologies === "string"
                        ? (project.technologies as string).split(",").map(s => s.trim())
                        : [])
                    ).map((tech) => (
                      <span key={tech} className="px-2.5 py-1 text-[11px] font-mono font-medium text-slate-300 bg-[#0e1423] rounded border border-white/10 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "challenges" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>Technical Challenge</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {project.challenges || "Solving real-time system performance under intensive rendering loops and managing responsive application states."}
                  </p>
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Implemented Solution</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {project.solutions || "Leveraged virtual window buffers, advanced state management hooks, and optimized browser caching algorithms."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "future" && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Roadmap Milestones</h4>
                <div className="space-y-2">
                  {project.futureImprovements && project.futureImprovements.map((imp, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-300 items-start">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="mt-0.5">{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-[#090d16] flex flex-col sm:flex-row gap-3">
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-white hover:bg-blue-100 text-black text-center font-bold uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            Launch Live Site <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-center font-bold uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Source Code <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
