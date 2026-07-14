import React, { useEffect, useState } from "react";
import { X, Download, Award, ShieldCheck, ExternalLink, Calendar, ShieldAlert } from "lucide-react";
import { CertificateData } from "../types";
import { getPrivacySettings } from "../utils/security";

interface CertificateViewerModalProps {
  certificate: CertificateData | null;
  onClose: () => void;
}

export default function CertificateViewerModal({ certificate, onClose }: CertificateViewerModalProps) {
  const [privacySettings, setPrivacySettings] = useState(getPrivacySettings);

  useEffect(() => {
    // Sync settings on load
    setPrivacySettings(getPrivacySettings());
  }, []);

  // Keyboard shortcut protection (Ctrl+P, Ctrl+S, Cmd+P, Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isPrint = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'p';
      const isSave = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 's';
      
      if ((isPrint || isSave) && !privacySettings.enableDownloads) {
        e.preventDefault();
        alert("Security Alert: Saving or printing this credential has been restricted by the administrator.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [privacySettings.enableDownloads]);

  if (!certificate) return null;

  const handleDownload = () => {
    if (!privacySettings.enableDownloads) {
      alert("Action Restricted: Printing is currently disabled under administrative security policies.");
      return;
    }
    window.print();
  };

  // Watermark Component Overlay
  const WatermarkOverlay = () => {
    const text = `SECURE PREVIEW — ${privacySettings.watermarkText || "Ngoun Bunlux"}`;
    return (
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden select-none flex flex-wrap items-center justify-center gap-x-16 gap-y-12 p-8 opacity-[0.08] dark:opacity-[0.12]">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="text-[10px] font-mono font-extrabold tracking-widest uppercase rotate-[-30deg] border border-black/40 dark:border-white/40 px-2.5 py-1 rounded whitespace-nowrap select-none"
          >
            {text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        alert("Protected Area: Right-click is disabled to safeguard professional certifications.");
      }}
      id="secure-certificate-modal"
    >
      <div className="relative w-full max-w-4xl bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: The Certificate Frame */}
        <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto relative select-none">
          
          {certificate.image ? (
            <div className="relative overflow-hidden rounded shadow-2xl max-h-[60vh] flex items-center justify-center">
              <img
                src={certificate.image}
                alt={certificate.title}
                className="max-w-full max-h-[60vh] object-contain rounded pointer-events-none select-none"
                referrerPolicy="no-referrer"
                onDragStart={(e) => e.preventDefault()}
              />
              {/* Dynamic Watermark Overlay */}
              <WatermarkOverlay />
            </div>
          ) : (
            /* High-fidelity CSS Certificate Template with Watermark */
            <div 
              className="w-full max-w-2xl aspect-[1.414/1] bg-white text-slate-900 p-8 rounded-lg relative shadow-2xl border-[12px] border-double border-blue-900 flex flex-col justify-between overflow-hidden select-none"
              onDragStart={(e) => e.preventDefault()}
            >
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-yellow-600 pointer-events-none" />
              <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-yellow-600 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-yellow-600 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-yellow-600 pointer-events-none" />

              {/* Background watermark icon */}
              <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
                <Award className="w-96 h-96 text-blue-900" />
              </div>

              {/* Security Watermark Overlay */}
              <WatermarkOverlay />

              {/* Header */}
              <div className="text-center space-y-1 relative z-10">
                <div className="flex justify-center gap-1.5 mb-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-600" />
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-900" />
                </div>
                <h4 className="text-[11px] uppercase tracking-[0.25em] font-bold text-yellow-700 font-sans">
                  {certificate.issuer.includes("Cisco") ? "Cisco Networking Academy" : "Paragon International University"}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {certificate.issuer.includes("Cisco") ? "Open Education & Development Group" : "Department of Management Information Systems"}
                </p>
              </div>

              {/* Title */}
              <div className="text-center space-y-3 my-4 relative z-10">
                <h2 className="text-2xl font-serif tracking-wide text-blue-950 font-bold uppercase">
                  Certificate of {certificate.title.includes("Champion") ? "Achievement" : "Completion"}
                </h2>
                <p className="text-xs text-slate-500 italic">This credential is proudly presented to</p>
                <h3 className="text-3xl font-serif text-blue-900 font-bold tracking-tight italic border-b border-slate-200 pb-2 max-w-md mx-auto">
                  {certificate.title.includes("MIS Datazone 2026") ? "Bunlux Ngoun" : "Ngoun Bunlux"}
                </h3>
                <p className="text-[11px] text-slate-600 max-w-md mx-auto leading-relaxed">
                  {certificate.description || `For successfully achieving student-level credentials and completing all modules, practical assessments, and review workflows.`}
                </p>
              </div>

              {/* Footer Stamp & Signatures */}
              <div className="flex justify-between items-end mt-2 pt-4 border-t border-slate-100 relative z-10">
                <div className="text-left space-y-1">
                  <div className="h-6 flex items-end">
                    <span className="font-serif italic text-xs text-slate-400">S. Teay</span>
                  </div>
                  <div className="border-t border-slate-300 w-28" />
                  <p className="text-[9px] text-slate-500 font-sans">Mrs. Sreyteav Sry</p>
                  <p className="text-[8px] text-slate-400 font-mono">Head of MIS Department</p>
                </div>

                {/* Golden Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-600 to-yellow-500 border-2 border-white flex items-center justify-center shadow-lg relative">
                    <Award className="w-7 h-7 text-white" />
                    {/* Ribbon */}
                    <div className="absolute top-[48px] -left-2 w-4 h-8 bg-yellow-600 rotate-12 -z-10 rounded-b shadow" />
                    <div className="absolute top-[48px] -right-2 w-4 h-8 bg-yellow-600 -rotate-12 -z-10 rounded-b shadow" />
                  </div>
                  <span className="text-[7px] text-yellow-700 font-bold tracking-widest uppercase mt-1">VERIFIED</span>
                </div>

                <div className="text-right space-y-1">
                  <div className="h-6 flex items-end justify-end">
                    <span className="font-serif italic text-xs text-slate-400">Lynn Bloomer</span>
                  </div>
                  <div className="border-t border-slate-300 w-28 ml-auto" />
                  <p className="text-[9px] text-slate-500 font-sans">Mr. Singthay Theng</p>
                  <p className="text-[8px] text-slate-400 font-mono">Project Manager</p>
                </div>
              </div>

              {/* Verification Info */}
              <div className="flex justify-between items-center text-[7px] text-slate-400 font-mono mt-4 relative z-10">
                <span>ID: {certificate.credentialId || "N/A"}</span>
                <span>ISSUED ON: {certificate.date}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Credentials & Information */}
        <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-[#0e1423] select-none">
          <div className="space-y-5">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full">
                {certificate.category}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display text-white">{certificate.title}</h3>
              <p className="text-xs text-blue-400 font-medium">{certificate.issuer}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Date Issued: <strong className="text-white">{certificate.date}</strong></span>
              </div>
              {certificate.credentialId && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-mono">ID: <strong className="text-white">{certificate.credentialId}</strong></span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              {certificate.description || "This credential verifies successful mastery of programmatic, data engineering, and computational models as evaluated by official certification parameters."}
            </p>

            {!privacySettings.enableDownloads && (
              <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-2.5 flex items-start gap-1.5 text-[9.5px] text-red-300 leading-normal font-sans">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Asset download and local printing have been disabled globally by the owner.</span>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 space-y-2">
            {certificate.credentialUrl && (
              <a
                href={certificate.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                Verify Credential <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            
            {privacySettings.enableDownloads && (
              <button
                onClick={handleDownload}
                className="w-full py-2 bg-white text-black hover:bg-blue-100 font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Print Certificate <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
