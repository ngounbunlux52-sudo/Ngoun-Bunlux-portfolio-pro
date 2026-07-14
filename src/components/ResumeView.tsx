import React, { useState, useEffect, useRef } from "react";
import { 
  Download, 
  GraduationCap, 
  Code, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  Mail, 
  Linkedin, 
  Github, 
  Globe,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { ProjectData, CertificateData, AwardData, HackathonData, ExperienceData, ResumeData } from "../types";
import { motion } from "motion/react";

interface ResumeViewProps {
  projects: ProjectData[];
  certificates: CertificateData[];
  awards: AwardData[];
  hackathons: HackathonData[];
  timeline: ExperienceData[];
  resumeInfo: ResumeData;
}

function validateCVFile(dataUrl: string | null): { 
  isValid: boolean; 
  errorType?: "missing" | "broken" | "invalid_type"; 
  format?: string; 
} {
  if (!dataUrl) {
    return { isValid: false, errorType: "missing" };
  }
  
  if (dataUrl.startsWith("data:")) {
    const mimeMatch = dataUrl.match(/^data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "";
    
    if (mimeType === "application/pdf") {
      try {
        const base64Part = dataUrl.split(",")[1];
        if (!base64Part) return { isValid: false, errorType: "broken" };
        const decoded = atob(base64Part.slice(0, 30));
        if (decoded.includes("%PDF-")) {
          return { isValid: true, format: "pdf" };
        } else {
          return { isValid: false, errorType: "broken" };
        }
      } catch (e) {
        return { isValid: false, errorType: "broken" };
      }
    } else if (mimeType.startsWith("image/")) {
      return { isValid: true, format: "image" };
    } else {
      return { isValid: false, errorType: "invalid_type" };
    }
  }
  
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://") || dataUrl.startsWith("/")) {
    return { isValid: true, format: "url" };
  }
  
  return { isValid: false, errorType: "broken" };
}

export default function ResumeView({
  projects,
  certificates,
  awards,
  hackathons,
  timeline,
  resumeInfo
}: ResumeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState(false);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errorType?: "missing" | "broken" | "invalid_type";
    format?: string;
  }>({ isValid: false, errorType: "missing" });

  const [autoDownloadTried, setAutoDownloadTried] = useState(false);
  const [autoDownloadStatus, setAutoDownloadStatus] = useState<"idle" | "attempting" | "completed" | "blocked">("idle");

  useEffect(() => {
    const cvData = localStorage.getItem("cv_file");
    const res = validateCVFile(cvData);
    setValidation(res);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasScrolledIntoView(true);
        observer.disconnect();
      }
    }, {
      threshold: 0.1,
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hasScrolledIntoView && validation.isValid) {
      const alreadyTriggered = sessionStorage.getItem("resume_auto_download_triggered");
      if (!alreadyTriggered) {
        sessionStorage.setItem("resume_auto_download_triggered", "true");
        setAutoDownloadTried(true);
        setAutoDownloadStatus("attempting");

        const timer = setTimeout(() => {
          try {
            const cvData = localStorage.getItem("cv_file");
            if (cvData) {
              const link = document.createElement("a");
              link.href = cvData;
              link.download = validation.format === "image" ? "Ngoun_Bunlux_Resume.png" : "Ngoun_Bunlux_Resume.pdf";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setAutoDownloadStatus("blocked");
            }
          } catch (e) {
            console.error("Auto-download error:", e);
            setAutoDownloadStatus("blocked");
          }
        }, 800);

        return () => clearTimeout(timer);
      }
    }
  }, [hasScrolledIntoView, validation.isValid, validation.format]);

  const handleManualDownload = () => {
    const cvData = localStorage.getItem("cv_file");
    if (cvData && validation.isValid) {
      try {
        const link = document.createElement("a");
        link.href = cvData;
        link.download = validation.format === "image" ? "Ngoun_Bunlux_Resume.png" : "Ngoun_Bunlux_Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setAutoDownloadStatus("completed");
      } catch (e) {
        console.error("Manual download error:", e);
      }
    } else {
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      
      {/* Auto Download Notification */}
      {autoDownloadTried && autoDownloadStatus === "blocked" && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden animate-fade-in shadow-lg shadow-blue-500/5">
          <div className="flex gap-3">
            <div className="p-2 bg-blue-500/20 text-rose-400 rounded-lg shrink-0">
              <Download className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">Download Blocked</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Your browser blocked the automatic download. Click the button below to download the resume.
              </p>
            </div>
          </div>
          <button
            onClick={handleManualDownload}
            className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white font-bold uppercase tracking-widest text-[9px] rounded-lg shadow-lg flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Resume
          </button>
        </div>
      )}

      {/* Missing / Broken Resume File Warning */}
      {!validation.isValid && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden animate-fade-in shadow-lg shadow-amber-500/5">
          <div className="flex gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                {validation.errorType === "missing" ? "Custom Resume PDF Not Found" : "Resume PDF Corrupted or Invalid"}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {validation.errorType === "missing" 
                  ? "No custom PDF resume has been uploaded yet. You can print/save this live interactive view as a clean, structured resume PDF or upload yours in the Admin Dashboard." 
                  : "The uploaded file is corrupted or not a valid PDF. You can print/save this live interactive view as a clean, structured resume PDF."}
              </p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-widest text-[9px] rounded-lg shadow-lg flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      )}

      <div className="bg-[#0B1026]/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6 md:p-10 text-xs text-slate-300 space-y-8 max-w-4xl mx-auto print:bg-white print:text-slate-900 print:p-0 print:border-none print:shadow-none font-sans">
        
        {/* Printable Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 print:border-slate-300 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white print:text-black font-display">NGOUN BUNLUX</h2>
            <p className="text-sm text-blue-400 print:text-blue-700 font-semibold mt-1 uppercase tracking-wider">
              Data Science Student & AI Engineer
            </p>
            <p className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-2">
              <span>Phnom Penh, Cambodia</span>
              <span>•</span>
              <a href="mailto:ngounbunlux52@gmail.com" className="hover:text-blue-400 transition-colors">ngounbunlux52@gmail.com</a>
              <span>•</span>
              <a href="tel:061265383" className="hover:text-blue-400 transition-colors">061 265 383</a>
            </p>
          </div>
          <button
            onClick={validation.isValid ? handleManualDownload : handlePrint}
            className="px-5 py-2.5 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-blue-100 rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer transition-all print:hidden shrink-0 animate-pulse hover:animate-none"
          >
            <Download className="w-4 h-4" /> {validation.isValid ? "Download Resume PDF" : "Download PDF / Print"}
          </button>
        </div>

      {/* Summary */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-white/5 print:border-slate-200 pb-1">
          Professional Summary
        </h3>
        <p className="leading-relaxed text-slate-300 print:text-slate-700 font-sans">
          {resumeInfo.summary}
        </p>
      </div>

      {/* Core Grid: Left (Experience & Projects) / Right (Skills & Certifications) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 print:grid-cols-12">
        
        {/* Left Column (8 cols) */}
        <div className="md:col-span-8 print:col-span-8 space-y-6">
          {/* Education & Experience Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-white/5 print:border-slate-200 pb-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-400 print:text-blue-700" />
              <span>Education & Milestones</span>
            </h3>
            <div className="space-y-4">
              {timeline.slice(0, 4).map((item) => (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white print:text-black">{item.position}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                  </div>
                  <p className="text-[11px] text-blue-400 print:text-blue-700 font-medium">{item.company}</p>
                  <p className="text-[11px] text-slate-400 print:text-slate-600 leading-relaxed">{item.description}</p>
                  {item.achievements && item.achievements.length > 0 && (
                    <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-500 print:text-slate-600 mt-1">
                      {item.achievements.map((ach, idx) => (
                        <li key={idx}>{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Projects */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-white/5 print:border-slate-200 pb-1 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-400 print:text-blue-700" />
              <span>Core Project Portfolio</span>
            </h3>
            <div className="space-y-4">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white print:text-black flex items-center gap-1.5">
                      {project.title}
                      <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded print:hidden">
                        {project.category}
                      </span>
                    </h4>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 print:hidden"
                    >
                      Live Demo <Globe className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400 print:text-slate-600 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(Array.isArray(project.technologies) 
                      ? project.technologies 
                      : (typeof project.technologies === "string" 
                        ? (project.technologies as string).split(",").map(s => s.trim()) 
                        : [])
                    ).slice(0, 5).map((tech) => (
                      <span key={tech} className="px-1.5 py-0.5 text-[9px] font-mono bg-white/5 print:bg-slate-100 print:text-slate-800 border border-white/10 print:border-slate-300 rounded text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="md:col-span-4 print:col-span-4 space-y-6">
          {/* Skills Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-white/5 print:border-slate-200 pb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-400 print:text-blue-700" />
              <span>Core Skills</span>
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-1">Languages</h4>
                <div className="flex flex-wrap gap-1">
                  {["Python", "C++", "SQL", "HTML5/CSS3", "TypeScript", "JavaScript"].map((lang) => (
                    <span key={lang} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-[10px]">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-1">AI & Data Science</h4>
                <div className="flex flex-wrap gap-1">
                  {["Prompt Engineering", "Machine Learning", "Data Mining", "Predictive Analytics", "NLP", "D3.js", "AI Prototyping"].map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-sans text-[10px]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Certifications Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-white/5 print:border-slate-200 pb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 print:text-blue-700" />
              <span>Certifications</span>
            </h3>
            <div className="space-y-2.5">
              {certificates.slice(0, 5).map((cert) => (
                <div key={cert.id} className="space-y-0.5">
                  <h4 className="font-bold text-white print:text-black leading-tight">{cert.title}</h4>
                  <p className="text-[10px] text-blue-400 print:text-blue-700 font-medium">{cert.issuer}</p>
                  <p className="text-[9px] text-slate-500 print:text-slate-600">{cert.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* References */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-600 border-b border-white/5 print:border-slate-200 pb-1">
              References
            </h3>
            <div className="space-y-3">
              {resumeInfo.references.map((ref) => (
                <div key={ref.name} className="space-y-0.5">
                  <h4 className="font-bold text-white print:text-black">{ref.name}</h4>
                  <p className="text-[10px] text-slate-400 print:text-slate-600">{ref.role}</p>
                  <p className="text-[9px] text-blue-400 print:text-blue-700 select-all">{ref.contact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </motion.div>
  );
}
