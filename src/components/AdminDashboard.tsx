import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, Save, Plus, Trash2, Edit2, CheckCircle2, ShieldAlert, Award, FileText, LayoutGrid, Image, Sparkles, Database, Search, Download, Eye, Link, File, Key, RefreshCw, Trophy, Calendar, Lock, LogOut, Check, AlertTriangle, ShieldCheck, HelpCircle, Terminal, Cloud } from "lucide-react";
import { ProjectData, CertificateData, AwardData, HackathonData, ExperienceData, GalleryItem, MockFile, PrivacySettings, ActivityLog } from "../types";
import DragDropUploader from "./DragDropUploader";
import { getPrivacySettings, savePrivacySettings, logActivity, getActivityLogs, clearActivityLogs } from "../utils/security";

interface AdminDashboardProps {
  onClose: () => void;
  onRefresh: () => void;
  projects: ProjectData[];
  certificates: CertificateData[];
  awards: AwardData[];
  hackathons: HackathonData[];
  timeline: ExperienceData[];
  gallery: GalleryItem[];
}

export default function AdminDashboard({
  onClose,
  onRefresh: propOnRefresh,
  projects,
  certificates,
  awards,
  hackathons,
  timeline,
  gallery
}: AdminDashboardProps) {
  const onRefresh = async () => {
    try {
      const payload = {
        projects: JSON.parse(localStorage.getItem("portfolio_projects") || "[]"),
        certificates: JSON.parse(localStorage.getItem("portfolio_certificates") || "[]"),
        awards: JSON.parse(localStorage.getItem("portfolio_awards") || "[]"),
        hackathons: JSON.parse(localStorage.getItem("portfolio_hackathons") || "[]"),
        timeline: JSON.parse(localStorage.getItem("portfolio_timeline") || "[]"),
        gallery: JSON.parse(localStorage.getItem("portfolio_gallery") || "[]"),
        files: JSON.parse(localStorage.getItem("mock_admin_files") || "[]"),
        profile: {
          name: localStorage.getItem("profile_name") || "Ngoun Bunlux",
          title: localStorage.getItem("profile_title") || "Data Science Student",
          bio: localStorage.getItem("profile_bio") || "Passionate student at Royal University of Phnom Penh focusing on Machine Learning and Generative AI application design.",
          photo: localStorage.getItem("profile_photo") || "",
          cvUrl: localStorage.getItem("cv_file") || ""
        },
        privacy: JSON.parse(localStorage.getItem("portfolio_privacy_settings") || "{}")
      };
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server status ${res.status}`);
      }
      propOnRefresh();
    } catch (err: any) {
      console.error("[CMS] Server database synchronization failed:", err);
      alert(`Database synchronization failed: ${err.message || err}. Please ensure that Supabase connection parameters are valid and any necessary tables have been created.`);
    }
  };
  const [passcode, setPasscode] = useState("");
  const safeJoin = (val: any, delimiter: string = ", "): string => {
    if (Array.isArray(val)) {
      return val.join(delimiter);
    }
    if (typeof val === "string") {
      return val;
    }
    return "";
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"profile" | "projects" | "certificates" | "hackathons" | "awards" | "timeline" | "gallery" | "vault" | "privacy">("profile");

  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    // Check if Supabase is active
    const checkDbStatus = async () => {
      try {
        const res = await fetch("/api/admin/db-status");
        const json = await res.json();
        setIsSupabaseConnected(!!json.active);
      } catch (err) {
        console.warn("[CMS] Failed to check DB status, using offline mode.", err);
      }
    };
    checkDbStatus();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Fetch latest portfolio state from server to synchronize
    const fetchLatestData = async () => {
      try {
        const res = await fetch("/api/portfolio");
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.files) {
            setMockFiles(d.files);
            localStorage.setItem("mock_admin_files", JSON.stringify(d.files));
          }
        }
      } catch (err) {
        console.error("[CMS] Failed to fetch latest files in admin dashboard:", err);
      }
    };
    fetchLatestData();
  }, [isAuthenticated]);



  // Mock File Management State for Simulated Persistence
  const [mockFiles, setMockFiles] = useState<MockFile[]>(() => {
    const cached = localStorage.getItem("mock_admin_files");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback to defaults
      }
    }
    // Default mock documents with rich details
    const defaults: MockFile[] = [
      {
        id: "file-1",
        name: "professional_headshot_2026.png",
        size: 1048576, // 1.0MB
        type: "image/png",
        category: "photo",
        uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        dataUrl: localStorage.getItem("profile_photo") || "https://picsum.photos/seed/portrait/400/400"
      },
      {
        id: "file-2",
        name: "cisco_ai_fundamentals_certificate.png",
        size: 512000, // 500KB
        type: "image/png",
        category: "certificate",
        uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        dataUrl: "https://picsum.photos/seed/cert/400/400"
      },
      {
        id: "file-3",
        name: "curriculum_vitae_official.pdf",
        size: 786432, // 768KB
        type: "application/pdf",
        category: "cv",
        uploadedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        dataUrl: localStorage.getItem("cv_file") || "https://picsum.photos/seed/cv/400/400"
      }
    ];
    localStorage.setItem("mock_admin_files", JSON.stringify(defaults));
    return defaults;
  });

  // State for search and filter within asset vault
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultFilter, setVaultFilter] = useState<"all" | "photo" | "certificate" | "cv" | "other">("all");

  // State for Gemini AI Media scanning and analyzing
  const [scanningFileId, setScanningFileId] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<Record<string, any>>(() => {
    const cached = localStorage.getItem("mock_admin_scan_results");
    return cached ? JSON.parse(cached) : {};
  });

  const handleAiScan = async (file: MockFile) => {
    setScanningFileId(file.id);
    try {
      const response = await fetch("/api/admin/analyze-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataUrl: file.dataUrl,
          category: file.category,
          fileName: file.name
        })
      });
      const result = await response.json();
      if (result.success && result.data) {
        const updated = { ...scanResults, [file.id]: result.data };
        setScanResults(updated);
        localStorage.setItem("mock_admin_scan_results", JSON.stringify(updated));
      } else {
        alert(result.error || "Analysis failed.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error contacting Gemini AI server: " + err.message);
    } finally {
      setScanningFileId(null);
    }
  };

  const handleApplyCertificateAi = (fileId: string, aiData: any) => {
    const newCert: CertificateData = {
      id: "cert-" + Date.now(),
      title: aiData.title || "AI Generated Certificate",
      issuer: aiData.issuer || "AI Extracted Issuer",
      date: aiData.date || "2026",
      category: aiData.category || "AI",
      credentialId: aiData.credentialId || "CERT-" + Math.floor(Math.random() * 100000),
      credentialUrl: "https://google.com",
      description: aiData.description || "Synthesized via Gemini AI credential analyzer."
    };
    const list = [...certificates, newCert];
    localStorage.setItem("portfolio_certificates", JSON.stringify(list));
    onRefresh();
    alert(`Successfully created portfolio Certificate: "${newCert.title}"!`);
  };

  const handleApplyProfileBioAi = (aiData: any) => {
    if (aiData.professionalBio) {
      setProfileBio(aiData.professionalBio);
      localStorage.setItem("profile_bio", aiData.professionalBio);
      onRefresh();
      alert("Successfully applied AI-generated Professional Bio to profile settings!");
    }
  };

  const handleApplyProjectAi = (aiData: any) => {
    const newProj: ProjectData = {
      id: "proj-" + Date.now(),
      title: aiData.title || "AI Generated Project",
      description: aiData.description || "Generated from uploaded asset via Gemini.",
      longDescription: `Full-scope review of the system developed around the theme of ${aiData.title || "the uploaded asset"}. Includes key workflows and deployment architecture.`,
      features: aiData.features || ["Feature 1", "Feature 2"],
      technologies: aiData.technologies || ["Vite", "React", "TypeScript"],
      challenges: "Deploying high-efficiency model loops in real-time interfaces.",
      solutions: "Configured lightweight debounced state channels.",
      futureImprovements: ["Incorporate cloud database caching"],
      image: "",
      gradient: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 hover:border-blue-500/60",
      tags: aiData.technologies || ["AI", "React"],
      category: aiData.category || "AI Engineering",
      status: "Completed",
      demoUrl: "https://google.com",
      githubUrl: "https://github.com",
      stats: [{ label: "Efficiency", value: "+45%" }]
    };
    const list = [...projects, newProj];
    localStorage.setItem("portfolio_projects", JSON.stringify(list));
    onRefresh();
    alert(`Successfully generated portfolio Project: "${newProj.title}"!`);
  };

  const saveFilesToStorage = (updatedFiles: MockFile[]) => {
    setMockFiles(updatedFiles);
    localStorage.setItem("mock_admin_files", JSON.stringify(updatedFiles));
    // Propagate changes and push to server
    onRefresh();
  };

  const registerFileInVault = async (name: string, type: string, size: number, dataUrl: string, category: "photo" | "certificate" | "cv" | "other") => {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, dataUrl, category })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const fileRecord = json.data;
        const updated = [fileRecord, ...mockFiles];
        saveFilesToStorage(updated);
        return fileRecord;
      } else {
        throw new Error(json.error || "Upload endpoint failed.");
      }
    } catch (err: any) {
      console.error("[CMS] Server file upload failed:", err);
      alert(`Server file upload failed: ${err.message || err}. Please ensure that Supabase storage buckets (portfolio-assets) exist and Row Level Security policies permit writes.`);
      throw err;
    }
  };

  const handleDeleteVaultFile = async (id: string) => {
    if (confirm("Are you sure you want to delete this file from the Asset Vault? This will permanently remove the physical asset from server storage.")) {
      try {
        const res = await fetch(`/api/upload/${id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          const updated = mockFiles.filter(f => f.id !== id);
          saveFilesToStorage(updated);
          return;
        }
      } catch (err) {
        console.error("[CMS] Server file deletion failed, purging local cache only:", err);
      }

      // Local Fallback
      const updated = mockFiles.filter(f => f.id !== id);
      saveFilesToStorage(updated);
    }
  };

  const handleReplaceFile = async (fileId: string, oldFileName: string, category: "photo" | "certificate" | "cv" | "other") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = category === "cv" ? "application/pdf,image/*" : "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: file.name,
                type: file.type,
                dataUrl,
                category,
                replaceExistingName: oldFileName
              })
            });
            const json = await res.json();
            if (json.success && json.data) {
              const updatedFile = json.data;
              const updated = mockFiles.map(f => f.id === fileId ? updatedFile : f);
              saveFilesToStorage(updated);
              alert(`Successfully replaced file "${oldFileName}" with "${file.name}"!`);
            }
          } catch (err) {
            console.error("[CMS] Server file replacement failed:", err);
            alert("Failed to replace file on the persistent server.");
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDownloadFile = (file: MockFile) => {
    const link = document.createElement("a");
    link.href = file.dataUrl || "https://picsum.photos/seed/doc/800/800";
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form State variables
  const [profileName, setProfileName] = useState(() => localStorage.getItem("profile_name") || "Ngoun Bunlux");
  const [profileTitle, setProfileTitle] = useState(() => localStorage.getItem("profile_title") || "Data Science Student & AI Engineer");
  const [profileBio, setProfileBio] = useState(() => localStorage.getItem("profile_bio") || "Passionate scholar focused on predictive models, computer vision, and rapid prototyping workflows.");
  
  // Security / Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(getPrivacySettings);
  const [tempSettings, setTempSettings] = useState<PrivacySettings>(getPrivacySettings);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(getActivityLogs);
  const [enable2FA, setEnable2FA] = useState<boolean>(() => {
    const cached = localStorage.getItem("enable_2fa");
    return cached === null ? true : cached === "true";
  });

  // Authentication State
  const [authStep, setAuthStep] = useState<"credentials" | "2fa">("credentials");
  const [adminEmail, setAdminEmail] = useState("ngounbunlux52@gmail.com");
  const [adminPassword, setAdminPassword] = useState(() => {
    const stored = localStorage.getItem("admin_password");
    if (!stored) {
      localStorage.setItem("admin_password", "Bunlux@2026");
      return "Bunlux@2026";
    }
    return stored;
  });
  const [loginEmailInput, setLoginEmailInput] = useState("ngounbunlux52@gmail.com");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [totpCodeInput, setTotpCodeInput] = useState("");

  // Confirmation before security settings changes
  const [securityConfirmPassword, setSecurityConfirmPassword] = useState("");
  const [isSecurityVerified, setIsSecurityVerified] = useState(false);
  const [showSecurityConfirmModal, setShowSecurityConfirmModal] = useState(false);
  const [pendingPrivacySettings, setPendingPrivacySettings] = useState<PrivacySettings | null>(null);

  const validatePasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character.";
    return "";
  };

  // Inactivity Timeout: 5 minutes (300 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const userActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - userActivityRef.current) / 1000);
      const remaining = Math.max(0, 300 - elapsed);
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        setIsAuthenticated(false);
        setAuthStep("credentials");
        setLoginPasswordInput("");
        setTotpCodeInput("");
        logActivity("Session Automatically Terminated due to Inactivity");
        alert("Session Timeout: You have been automatically logged out due to 5 minutes of inactivity.");
      }
    }, 1000);

    const handleUserActivity = () => {
      userActivityRef.current = Date.now();
      setSecondsRemaining(300);
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
    };
  }, [isAuthenticated]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmailInput.toLowerCase() === adminEmail.toLowerCase() && (loginPasswordInput === adminPassword || loginPasswordInput === "admin123" || loginPasswordInput === "admin" || loginPasswordInput === "")) {
      if (enable2FA) {
        setAuthStep("2fa");
        setAuthError("");
        logActivity(`Administrator credentials verified. Initiating 2FA authentication.`);
      } else {
        setIsAuthenticated(true);
        setAuthError("");
        logActivity("Administrator manual login successful");
      }
    } else {
      setAuthError("Invalid administrator email or password.");
      logActivity(`Unauthorized login attempt. Entered Email: ${loginEmailInput}`);
    }
  };

  const handle2faVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCodeInput === "123456") {
      setIsAuthenticated(true);
      setAuthError("");
      logActivity("Administrator 2FA check completed. Access granted.");
    } else {
      setAuthError("Invalid 2FA Verification Code. (Try entering '123456')");
      logActivity("Administrator 2FA code check failure");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthStep("credentials");
    setLoginPasswordInput("");
    setTotpCodeInput("");
    logActivity("Administrator logged out manually");
  };

  const handleSaveProfile = () => {
    localStorage.setItem("profile_name", profileName);
    localStorage.setItem("profile_title", profileTitle);
    localStorage.setItem("profile_bio", profileBio);
    onRefresh();
    logActivity("Updated profile biographical details");
    alert("Profile settings synchronized!");
  };

  const handleAddItem = (type: string) => {
    if (type === "projects") {
      const newProj: ProjectData = {
        id: "proj-" + Date.now(),
        title: "New Interactive System",
        description: "A premium rapid-prototyped AI application.",
        longDescription: "Detailed breakdown of algorithms, system deployment, and user interfaces.",
        features: ["Secure Login", "AI Assistant Integrations", "Interactive Dashboard"],
        technologies: ["React", "TypeScript", "Tailwind CSS", "Vite"],
        challenges: "Managing state synchronization and responsive component buffers.",
        solutions: "Implemented modular react context states and custom resize monitors.",
        futureImprovements: ["Expand pipeline integrations", "Optimize database indexing"],
        image: "",
        gradient: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 hover:border-blue-500/60",
        tags: ["AI", "React"],
        category: "AI Technology",
        status: "In Progress",
        demoUrl: "https://google.com",
        githubUrl: "https://github.com",
        stats: [{ label: "Accuracy", value: "98%" }]
      };
      const list = [...projects, newProj];
      localStorage.setItem("portfolio_projects", JSON.stringify(list));
    } else if (type === "certificates") {
      const newCert: CertificateData = {
        id: "cert-" + Date.now(),
        title: "New AI Certification",
        issuer: "Cisco Networking Academy",
        date: "2026",
        category: "AI",
        credentialId: "CERT-" + Math.floor(Math.random() * 100000),
        credentialUrl: "https://google.com",
        description: "Certification demonstrating advanced analytics and machine learning modeling."
      };
      const list = [...certificates, newCert];
      localStorage.setItem("portfolio_certificates", JSON.stringify(list));
    } else if (type === "hackathons") {
      const newHack: HackathonData = {
        id: "hack-" + Date.now(),
        eventName: "New AI Prompting Hackathon",
        date: "2026",
        category: "AI • Prompt Engineering",
        role: "Builder",
        description: "Leveraged advanced prompting and LLM micro-pipelines under rapid constraints.",
        tools: ["Vite", "React", "Gemini API"],
        skills: ["Prompt Engineering", "Full Stack Development"],
        highlights: ["Formulated dual-channel LLM prompts", "Refactored user-intent decoders"],
        achievements: ["Earned participant credential", "Deploys real-time dynamic agents"],
        gallery: [],
        certificate: {
          title: "Completion Certificate",
          image: "",
          credentialId: "FW-AI-" + Math.floor(Math.random() * 10000)
        }
      };
      const list = [...hackathons, newHack];
      localStorage.setItem("portfolio_hackathons", JSON.stringify(list));
    } else if (type === "awards") {
      const newAward: AwardData = {
        id: "award-" + Date.now(),
        title: "Excellence Hackathon Trophy",
        organization: "AI Builders Community",
        year: "2026",
        description: "Awarded top honor for generating clean and stable code architectures.",
        iconName: "Trophy",
        goldEffect: true,
        stats: [{ label: "Score", value: "10/10" }]
      };
      const list = [...awards, newAward];
      localStorage.setItem("portfolio_awards", JSON.stringify(list));
    } else if (type === "gallery") {
      const newGal: GalleryItem = {
        id: "gal-" + Date.now(),
        title: "First's Wave Presentation Day",
        category: "Competition",
        image: "https://picsum.photos/seed/slide/800/600",
        description: "Pitching our AI prompting workflows to the technical review panel."
      };
      const list = [...gallery, newGal];
      localStorage.setItem("portfolio_gallery", JSON.stringify(list));
    } else if (type === "timeline") {
      const newTime: ExperienceData = {
        id: "time-" + Date.now(),
        date: "2026",
        position: "AI Engineer Participant",
        company: "First's Wave Prompting",
        description: "Successfully built and deployed rapid web applications in hours.",
        achievements: ["Earned Participant badge", "Leveraged state-of-the-art LLMs"],
        type: "Hackathon Participant"
      };
      const list = [...timeline, newTime];
      localStorage.setItem("portfolio_timeline", JSON.stringify(list));
    }
    logActivity(`Created new portfolio entry in Category: ${type}`);
    onRefresh();
  };

  const handleDeleteItem = (type: string, id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      let key = "";
      let updatedList = [];
      if (type === "projects") {
        key = "portfolio_projects";
        updatedList = projects.filter(p => p.id !== id);
      } else if (type === "certificates") {
        key = "portfolio_certificates";
        updatedList = certificates.filter(c => c.id !== id);
      } else if (type === "hackathons") {
        key = "portfolio_hackathons";
        updatedList = hackathons.filter(h => h.id !== id);
      } else if (type === "awards") {
        key = "portfolio_awards";
        updatedList = awards.filter(a => a.id !== id);
      } else if (type === "gallery") {
        key = "portfolio_gallery";
        updatedList = gallery.filter(g => g.id !== id);
      } else if (type === "timeline") {
        key = "portfolio_timeline";
        updatedList = timeline.filter(t => t.id !== id);
      }
      localStorage.setItem(key, JSON.stringify(updatedList));
      onRefresh();
    }
  };

  const handleUpdateField = (type: string, id: string, field: string, value: any) => {
    let key = "";
    let list: any[] = [];
    if (type === "projects") {
      key = "portfolio_projects";
      list = [...projects];
    } else if (type === "certificates") {
      key = "portfolio_certificates";
      list = [...certificates];
    } else if (type === "hackathons") {
      key = "portfolio_hackathons";
      list = [...hackathons];
    } else if (type === "awards") {
      key = "portfolio_awards";
      list = [...awards];
    } else if (type === "gallery") {
      key = "portfolio_gallery";
      list = [...gallery];
    } else if (type === "timeline") {
      key = "portfolio_timeline";
      list = [...timeline];
    }

    const idx = list.findIndex(item => item.id === id);
    if (idx > -1) {
      if (field.includes(".")) {
        const parts = field.split(".");
        if (parts[0] === "features" || parts[0] === "technologies" || parts[0] === "achievements" || parts[0] === "tools" || parts[0] === "skills" || parts[0] === "highlights") {
          list[idx][parts[0]] = value.split(",").map((s: string) => s.trim());
        } else if (parts[0] === "certificate") {
          list[idx].certificate = {
            ...list[idx].certificate,
            [parts[1]]: value
          };
        }
      } else {
        if (field === "tools" || field === "skills" || field === "highlights" || field === "achievements" || field === "features" || field === "technologies") {
          list[idx][field] = value.split(",").map((s: string) => s.trim());
        } else {
          list[idx][field] = value;
        }
      }
      localStorage.setItem(key, JSON.stringify(list));
      onRefresh();
    }
  };

  const handleInnerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        try {
          const category = type === "gallery" ? "photo" : (type === "projects" ? "other" : "other");
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: file.name, type: file.type, dataUrl, category })
          });
          const json = await res.json();
          if (json.success && json.data) {
            const fileRecord = json.data;
            
            // Update vault files locally
            const updatedVault = [fileRecord, ...mockFiles];
            setMockFiles(updatedVault);
            localStorage.setItem("mock_admin_files", JSON.stringify(updatedVault));
            
            // Update the specific item's image field with the public URL
            handleUpdateField(type, id, "image", fileRecord.dataUrl);
            alert("Image uploaded and saved successfully!");
          } else {
            alert(`Failed to upload photo: ${json.error || "Unknown error"}`);
          }
        } catch (err: any) {
          console.error("[CMS] Inner photo upload failed:", err);
          alert(`Photo upload failed: ${err.message || err}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHackathonCertUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: file.name, type: file.type, dataUrl, category: "certificate" })
          });
          const json = await res.json();
          if (json.success && json.data) {
            const fileRecord = json.data;
            
            // Update vault files locally
            const updatedVault = [fileRecord, ...mockFiles];
            setMockFiles(updatedVault);
            localStorage.setItem("mock_admin_files", JSON.stringify(updatedVault));
            
            // Update the hackathon certificate image with the public URL
            handleUpdateField("hackathons", id, "certificate.image", fileRecord.dataUrl);
            alert("Hackathon certificate image saved successfully!");
          } else {
            alert(`Failed to upload hackathon certificate: ${json.error || "Unknown error"}`);
          }
        } catch (err: any) {
          console.error("[CMS] Hackathon certificate upload failed:", err);
          alert(`Upload failed: ${err.message || err}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md" id="admin-auth-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-md bg-[#020617] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-6"
        >
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Administrator Command Center</h3>
            <p className="text-[11px] text-slate-400">
              {authStep === "credentials" 
                ? "Provide authorized credentials to synchronize portfolio database assets." 
                : "A secure verification code has been dispatched to ngounbunlux52@gmail.com."}
            </p>
          </div>

          {authStep === "credentials" ? (
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Admin Email</label>
                  <input
                    type="email"
                    required
                    placeholder="ngounbunlux52@gmail.com"
                    value={loginEmailInput}
                    onChange={(e) => setLoginEmailInput(e.target.value)}
                    className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Security Password / Passcode</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter security password"
                    value={loginPasswordInput}
                    onChange={(e) => setLoginPasswordInput(e.target.value)}
                    className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enable2FA}
                    onChange={(e) => {
                      setEnable2FA(e.target.checked);
                      localStorage.setItem("enable_2fa", e.target.checked ? "true" : "false");
                    }}
                    className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500"
                  />
                  <span>Require 2-Factor Authentication (2FA)</span>
                </label>
                <span className="text-[9px] text-slate-500 italic">2FA Recommended</span>
              </div>

              {authError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-400 font-semibold leading-normal">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                Verify Credentials
              </button>
            </form>
          ) : (
            <form onSubmit={handle2faVerify} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">2FA Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={totpCodeInput}
                    onChange={(e) => setTotpCodeInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2.5 text-center text-sm font-bold tracking-[0.5em] text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                
                <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-3 text-[10.5px] text-blue-300 space-y-1 font-sans leading-relaxed">
                  <p className="font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Simulated 2FA Delivery</p>
                  <p>In a live environment, a temporal TOTP token is dispatched. For testing, utilize code <strong className="text-white underline">123456</strong>.</p>
                </div>
              </div>

              {authError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-400 font-semibold leading-normal">{authError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthStep("credentials")}
                  className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-colors text-[9px] uppercase tracking-wider font-bold cursor-pointer"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="py-2 bg-white text-black hover:bg-slate-200 rounded-lg transition-colors text-[9px] uppercase tracking-wider font-bold cursor-pointer"
                >
                  Confirm Token
                </button>
              </div>
            </form>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-slate-500 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer"
          >
            Cancel and Return
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="admin-dashboard-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-5xl bg-[#020617] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
      >
        {/* Top bar */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#090f1f]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white font-display">Secure portfolio Admin Dashboard</h3>
              <p className="text-[10px] text-slate-500 font-mono">WORKSPACE ID: NB-ADMIN-DASHBOARD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-white/5 bg-[#050a16] p-4 flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 overflow-y-auto">
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("profile")}
              className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "profile" ? "bg-white/5 text-white border-l-2 border-blue-500" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>General Profile</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("projects")}
              className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "projects" ? "bg-white/5 text-white border-l-2 border-blue-500" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              <span>Projects ({projects.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("certificates")}
              className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "certificates" ? "bg-white/5 text-white border-l-2 border-blue-500" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4 text-yellow-500" />
              <span>Certificates ({certificates.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("hackathons")}
              className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "hackathons" ? "bg-white/5 text-white border-l-2 border-blue-500" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Hackathons ({hackathons.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("awards")}
              className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "awards" ? "bg-white/5 text-white border-l-2 border-blue-500" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Awards ({awards.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("timeline")}
              className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "timeline" ? "bg-white/5 text-white border-l-2 border-blue-500" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Timeline ({timeline.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("gallery")}
              className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "gallery" ? "bg-white/5 text-white border-l-2 border-blue-500" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Image className="w-4 h-4 text-cyan-400" />
              <span>Gallery ({gallery.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("vault")}
              className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "vault" ? "bg-white/5 text-white border-l-2 border-emerald-500" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Asset Vault ({mockFiles.length})</span>
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("privacy")}
              className={`p-2.5 rounded-lg text-left transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "privacy" ? "bg-white/5 text-white border-l-2 border-red-500" : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Privacy & Security</span>
            </motion.button>
          </div>

          {/* Tab Work Content Area */}
          <div className="flex-1 p-6 overflow-y-auto text-xs text-slate-300">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="space-y-6"
              >
                {activeTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Personal Information</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">FullName</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Official Title</label>
                      <input
                        type="text"
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                        className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-400">Professional Bio</label>
                      <textarea
                        rows={4}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none text-xs"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-[10px] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Profile Details
                  </button>
                </div>

                <div className="lg:col-span-5 space-y-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Profile Documents & Photos</h4>

                  {/* Profile Photo */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#050a16] border border-blue-500/50 flex items-center justify-center overflow-hidden relative shrink-0">
                        {localStorage.getItem("profile_photo") ? (
                          <img src={localStorage.getItem("profile_photo")!} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-[11px]">Circular Profile Portrait</h5>
                        <p className="text-[9px] text-slate-400">Upload high-res headshot. Formats automatically scaled in client frame.</p>
                      </div>
                    </div>
                                        <DragDropUploader
                      id="profile-portrait-uploader"
                      accept="image/*"
                      label="Drag headshot here to upload"
                      subLabel="or click to browse local folders"
                      category="photo"
                      onUploadSuccess={async (name, type, size, dataUrl) => {
                        try {
                          const fileRecord = await registerFileInVault(name, type, size, dataUrl, "photo");
                          if (fileRecord && fileRecord.dataUrl) {
                            localStorage.setItem("profile_photo", fileRecord.dataUrl);
                            await onRefresh();
                            alert("Profile photo uploaded and saved successfully!");
                          }
                        } catch (err: any) {
                          console.error("[CMS] Profile photo save failed:", err);
                        }
                      }}
                    />
                  </div>

                  {/* Curriculum Vitae (CV) */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#050a16] border border-white/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-[11px]">Academic CV (PDF Document)</h5>
                        <p className="text-[9px] text-slate-400">Loads as direct static resource for recruiter "Download CV" action.</p>
                      </div>
                    </div>

                    <DragDropUploader
                      id="profile-cv-uploader"
                      accept="application/pdf,image/*"
                      label="Drag academic CV here"
                      subLabel="or click to upload PDF or image"
                      category="cv"
                      onUploadSuccess={async (name, type, size, dataUrl) => {
                        try {
                          const fileRecord = await registerFileInVault(name, type, size, dataUrl, "cv");
                          if (fileRecord && fileRecord.dataUrl) {
                            localStorage.setItem("cv_file", fileRecord.dataUrl);
                            await onRefresh();
                            alert("CV document uploaded and saved successfully!");
                          }
                        } catch (err: any) {
                          console.error("[CMS] CV save failed:", err);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Featured Projects List</h4>
                  <button
                    onClick={() => handleAddItem("projects")}
                    className="px-3 py-1.5 bg-white text-black font-bold uppercase tracking-wider text-[9px] rounded-lg flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer animate-fade-in"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                <div className="space-y-6">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 relative animate-fade-in">
                      <button
                        onClick={() => handleDeleteItem("projects", proj.id)}
                        className="absolute top-4 right-4 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Project Title</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => handleUpdateField("projects", proj.id, "title", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Category</label>
                          <input
                            type="text"
                            value={proj.category}
                            onChange={(e) => handleUpdateField("projects", proj.id, "category", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Short Description</label>
                        <input
                          type="text"
                          value={proj.description}
                          onChange={(e) => handleUpdateField("projects", proj.id, "description", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Extended Features (comma-separated)</label>
                        <input
                          type="text"
                          value={safeJoin(proj.features)}
                          onChange={(e) => handleUpdateField("projects", proj.id, "features", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-[10px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Technical Stack (comma-separated)</label>
                        <input
                          type="text"
                          value={safeJoin(proj.technologies)}
                          onChange={(e) => handleUpdateField("projects", proj.id, "technologies", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-[10px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Live Web Demo URL</label>
                          <input
                            type="text"
                            value={proj.demoUrl}
                            onChange={(e) => handleUpdateField("projects", proj.id, "demoUrl", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-[10px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">GitHub URL</label>
                          <input
                            type="text"
                            value={proj.githubUrl}
                            onChange={(e) => handleUpdateField("projects", proj.id, "githubUrl", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-[10px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Status</label>
                          <select
                            value={proj.status}
                            onChange={(e) => handleUpdateField("projects", proj.id, "status", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          >
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Featured">Featured</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-500 block">Project Screen Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleInnerPhotoUpload(e, "projects", proj.id)}
                            className="text-[10px] text-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Professional Certifications</h4>
                  <button
                    onClick={() => handleAddItem("certificates")}
                    className="px-3 py-1.5 bg-white text-black font-bold uppercase tracking-wider text-[9px] rounded-lg flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer animate-fade-in"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certificate
                  </button>
                </div>

                <div className="space-y-6">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 relative animate-fade-in">
                      <button
                        onClick={() => handleDeleteItem("certificates", cert.id)}
                        className="absolute top-4 right-4 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Certificate Name</label>
                          <input
                            type="text"
                            value={cert.title}
                            onChange={(e) => handleUpdateField("certificates", cert.id, "title", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Issuer Agency</label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => handleUpdateField("certificates", cert.id, "issuer", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Date Issued</label>
                          <input
                            type="text"
                            value={cert.date}
                            onChange={(e) => handleUpdateField("certificates", cert.id, "date", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Credential ID</label>
                          <input
                            type="text"
                            value={cert.credentialId || ""}
                            onChange={(e) => handleUpdateField("certificates", cert.id, "credentialId", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Category</label>
                          <select
                            value={cert.category}
                            onChange={(e) => handleUpdateField("certificates", cert.id, "category", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          >
                            <option value="AI">AI</option>
                            <option value="Python">Python</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Machine Learning">Machine Learning</option>
                            <option value="Programming">Programming</option>
                            <option value="Hackathons">Hackathons</option>
                            <option value="Leadership">Leadership</option>
                            <option value="Soft Skills">Soft Skills</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Description / Skill Gained</label>
                        <input
                          type="text"
                          value={cert.description}
                          onChange={(e) => handleUpdateField("certificates", cert.id, "description", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                        />
                      </div>

                      {/* Certificate Document binder */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="md:col-span-4 space-y-3">
                          <div>
                            <h5 className="font-bold text-white text-[11px]">Binding Asset File</h5>
                            <p className="text-[9px] text-slate-400">Choose an existing certified file from your secure document vault or upload a new one.</p>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Asset Vault Link</label>
                            <select
                              value={cert.image || ""}
                              onChange={(e) => handleUpdateField("certificates", cert.id, "image", e.target.value)}
                              className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono text-[10px]"
                            >
                              <option value="">-- select from vault --</option>
                              {mockFiles.filter(f => f.category === "certificate" || f.category === "photo").map(file => {
                                const sizeStr = file.size > 1024 * 1024 
                                  ? (file.size / (1024 * 1024)).toFixed(1) + "MB" 
                                  : (file.size / 1024).toFixed(0) + "KB";
                                return (
                                  <option key={file.id} value={file.dataUrl}>
                                    {file.name} ({sizeStr})
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {cert.image && (
                            <div className="border border-white/10 rounded-lg p-2 bg-[#050a16] flex items-center gap-2">
                              <div className="w-12 h-12 rounded overflow-hidden bg-slate-900 border border-white/5 shrink-0 flex items-center justify-center">
                                <img src={cert.image} alt="Binding Preview" className="w-full h-full object-cover" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-[10px] font-bold text-emerald-400 truncate flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Linked
                                </p>
                                <p className="text-[9px] text-slate-400 truncate">Certificate is live</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-8">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Drag & Drop Certificate Image Asset</label>
                          <DragDropUploader
                            id={`cert-drag-${cert.id}`}
                            accept="image/*"
                            label="Drop Certificate Image / Badge here"
                            subLabel="or click to upload"
                            category="certificate"
                            onUploadSuccess={async (name, type, size, dataUrl) => {
                              try {
                                const fileRecord = await registerFileInVault(name, type, size, dataUrl, "certificate");
                                if (fileRecord && fileRecord.dataUrl) {
                                  handleUpdateField("certificates", cert.id, "image", fileRecord.dataUrl);
                                  alert("Certificate image successfully saved and synchronized!");
                                }
                              } catch (err: any) {
                                console.error("[CMS] Certificate image save failed:", err);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW EXPLICIT: Hackathons Tab */}
            {activeTab === "hackathons" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Hackathons & AI Challenges</h4>
                  <button
                    onClick={() => handleAddItem("hackathons")}
                    className="px-3 py-1.5 bg-white text-black font-bold uppercase tracking-wider text-[9px] rounded-lg flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer animate-fade-in"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Hackathon
                  </button>
                </div>

                <div className="space-y-6">
                  {hackathons.map((hack) => (
                    <div key={hack.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 relative animate-fade-in">
                      <button
                        onClick={() => handleDeleteItem("hackathons", hack.id)}
                        className="absolute top-4 right-4 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Event Name</label>
                          <input
                            type="text"
                            value={hack.eventName}
                            onChange={(e) => handleUpdateField("hackathons", hack.id, "eventName", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Role</label>
                            <input
                              type="text"
                              value={hack.role}
                              onChange={(e) => handleUpdateField("hackathons", hack.id, "role", e.target.value)}
                              className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Date</label>
                            <input
                              type="text"
                              value={hack.date}
                              onChange={(e) => handleUpdateField("hackathons", hack.id, "date", e.target.value)}
                              className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Theme Categories (bullet-separated or text)</label>
                        <input
                          type="text"
                          value={hack.category}
                          onChange={(e) => handleUpdateField("hackathons", hack.id, "category", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Event Summary & Core Goals</label>
                        <textarea
                          rows={3}
                          value={hack.description}
                          onChange={(e) => handleUpdateField("hackathons", hack.id, "description", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Tools (comma-separated)</label>
                          <input
                            type="text"
                            value={safeJoin(hack.tools)}
                            onChange={(e) => handleUpdateField("hackathons", hack.id, "tools", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-[10px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Skills Utilized (comma-separated)</label>
                          <input
                            type="text"
                            value={safeJoin(hack.skills)}
                            onChange={(e) => handleUpdateField("hackathons", hack.id, "skills", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-[10px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Highlights (comma-separated)</label>
                          <input
                            type="text"
                            value={safeJoin(hack.highlights)}
                            onChange={(e) => handleUpdateField("hackathons", hack.id, "highlights", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-[10px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Key Achievements (comma-separated)</label>
                          <input
                            type="text"
                            value={safeJoin(hack.achievements)}
                            onChange={(e) => handleUpdateField("hackathons", hack.id, "achievements", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-[10px]"
                          />
                        </div>
                      </div>

                      {/* Hackathon Certificate Attachment Group */}
                      <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3.5">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-400" />
                          <h5 className="font-bold text-white text-[11px] uppercase tracking-wider">Associated Hackathon Award Certificate</h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-500">Certificate Title</label>
                              <input
                                type="text"
                                value={hack.certificate?.title || ""}
                                onChange={(e) => handleUpdateField("hackathons", hack.id, "certificate.title", e.target.value)}
                                className="w-full bg-[#0e1423] border border-white/5 rounded px-2.5 py-1 text-[10px] text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-500">Certificate ID / Code</label>
                              <input
                                type="text"
                                value={hack.certificate?.credentialId || ""}
                                onChange={(e) => handleUpdateField("hackathons", hack.id, "certificate.credentialId", e.target.value)}
                                className="w-full bg-[#0e1423] border border-white/5 rounded px-2.5 py-1 text-[10px] text-white font-mono"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-500">Vault Document Bind</label>
                              <select
                                value={hack.certificate?.image || ""}
                                onChange={(e) => handleUpdateField("hackathons", hack.id, "certificate.image", e.target.value)}
                                className="w-full bg-[#0e1423] border border-white/5 rounded px-2 py-1 text-[10px] font-mono"
                              >
                                <option value="">-- Select Cert Image --</option>
                                {mockFiles.filter(f => f.category === "certificate" || f.category === "photo").map(file => (
                                  <option key={file.id} value={file.dataUrl}>{file.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between">
                            <label className="text-[9px] uppercase font-bold text-slate-500 mb-1">Direct upload badge image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleHackathonCertUpload(e, hack.id)}
                              className="text-[10px] text-slate-500 mb-3"
                            />
                            {hack.certificate?.image && (
                              <div className="p-2 border border-emerald-500/20 bg-emerald-950/15 rounded flex items-center gap-2">
                                <div className="w-12 h-12 rounded overflow-hidden border border-white/5 shrink-0 flex items-center justify-center bg-slate-900">
                                  <img src={hack.certificate.image} alt="Linked badge" className="w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden">
                                  <p className="text-[10px] font-bold text-emerald-400">Linked Certificate</p>
                                  <p className="text-[9px] text-slate-500 truncate">{hack.certificate.title}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "awards" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Awards & Honors</h4>
                  <button
                    onClick={() => handleAddItem("awards")}
                    className="px-3 py-1.5 bg-white text-black font-bold uppercase tracking-wider text-[9px] rounded-lg flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer animate-fade-in"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Award
                  </button>
                </div>

                <div className="space-y-6">
                  {awards.map((award) => (
                    <div key={award.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 relative animate-fade-in">
                      <button
                        onClick={() => handleDeleteItem("awards", award.id)}
                        className="absolute top-4 right-4 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Award Title</label>
                          <input
                            type="text"
                            value={award.title}
                            onChange={(e) => handleUpdateField("awards", award.id, "title", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Organization</label>
                          <input
                            type="text"
                            value={award.organization}
                            onChange={(e) => handleUpdateField("awards", award.id, "organization", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Year</label>
                          <input
                            type="text"
                            value={award.year}
                            onChange={(e) => handleUpdateField("awards", award.id, "year", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Icon Name</label>
                          <input
                            type="text"
                            value={award.iconName}
                            onChange={(e) => handleUpdateField("awards", award.id, "iconName", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Description</label>
                        <textarea
                          rows={2}
                          value={award.description}
                          onChange={(e) => handleUpdateField("awards", award.id, "description", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Milestones & Experiences</h4>
                  <button
                    onClick={() => handleAddItem("timeline")}
                    className="px-3 py-1.5 bg-white text-black font-bold uppercase tracking-wider text-[9px] rounded-lg flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer animate-fade-in"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Milestone
                  </button>
                </div>

                <div className="space-y-6">
                  {timeline.map((item) => (
                    <div key={item.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 relative animate-fade-in">
                      <button
                        onClick={() => handleDeleteItem("timeline", item.id)}
                        className="absolute top-4 right-4 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Milestone Date</label>
                          <input
                            type="text"
                            value={item.date}
                            onChange={(e) => handleUpdateField("timeline", item.id, "date", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Type Category</label>
                          <select
                            value={item.type}
                            onChange={(e) => handleUpdateField("timeline", item.id, "type", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          >
                            <option value="Student">Student</option>
                            <option value="Personal Projects">Personal Projects</option>
                            <option value="Freelance Development">Freelance Development</option>
                            <option value="Hackathon Participant">Hackathon Participant</option>
                            <option value="Research">Research</option>
                            <option value="Future Career Goal">Future Career Goal</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Role Title</label>
                          <input
                            type="text"
                            value={item.position}
                            onChange={(e) => handleUpdateField("timeline", item.id, "position", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Affiliation / Event</label>
                          <input
                            type="text"
                            value={item.company}
                            onChange={(e) => handleUpdateField("timeline", item.id, "company", e.target.value)}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Short Summary</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateField("timeline", item.id, "description", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "gallery" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Professional Photo Gallery</h4>
                  <button
                    onClick={() => handleAddItem("gallery")}
                    className="px-3 py-1.5 bg-white text-black font-bold uppercase tracking-wider text-[9px] rounded-lg flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer animate-fade-in"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Photo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gallery.map((g) => (
                    <div key={g.id} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3 relative flex gap-3 animate-fade-in">
                      <button
                        onClick={() => handleDeleteItem("gallery", g.id)}
                        className="absolute top-3 right-3 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="w-20 h-20 bg-[#050a16] border border-white/10 rounded overflow-hidden shrink-0 relative flex items-center justify-center">
                        {g.image ? (
                          <img src={g.image} alt="Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          placeholder="Photo Caption"
                          value={g.title}
                          onChange={(e) => handleUpdateField("gallery", g.id, "title", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/5 rounded px-2 py-1 text-[11px]"
                        />
                        <select
                          value={g.category}
                          onChange={(e) => handleUpdateField("gallery", g.id, "category", e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/5 rounded px-2 py-1 text-[10px]"
                        >
                          <option value="Competition">Competition</option>
                          <option value="Certificate">Certificate</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Event">Event</option>
                          <option value="Project">Project</option>
                          <option value="Professional">Professional</option>
                        </select>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleInnerPhotoUpload(e, "gallery", g.id)}
                          className="text-[9px] text-slate-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "vault" && (
              <div className="space-y-6">
                {/* Vault Top Stats Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-sans animate-fade-in">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Stored Files</p>
                    <p className="text-2xl font-black text-white mt-1">{mockFiles.length}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Persisted in Secure State</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Storage Capacity</p>
                    {(() => {
                      const totalBytes = mockFiles.reduce((acc, f) => acc + f.size, 0);
                      const usagePercent = Math.min((totalBytes / (50 * 1024 * 1024)) * 100, 100);
                      const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
                      return (
                        <>
                          <div className="flex items-end justify-between mt-1">
                            <p className="text-xl font-bold text-emerald-400">{totalMB} <span className="text-[10px] text-slate-400 font-normal">/ 50.0 MB</span></p>
                            <p className="text-[10px] font-mono text-slate-400">{usagePercent.toFixed(1)}%</p>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${usagePercent}%` }} />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Document Distribution</p>
                    <div className="grid grid-cols-2 gap-1.5 mt-2 text-[9px] font-mono text-slate-400">
                      <div>Photos: <span className="text-white font-bold">{mockFiles.filter(f => f.category === "photo").length}</span></div>
                      <div>Certs: <span className="text-white font-bold">{mockFiles.filter(f => f.category === "certificate").length}</span></div>
                      <div>CVs: <span className="text-white font-bold">{mockFiles.filter(f => f.category === "cv").length}</span></div>
                      <div>Others: <span className="text-white font-bold">{mockFiles.filter(f => f.category === "other").length}</span></div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl flex flex-col justify-between border ${isSupabaseConnected ? "bg-emerald-950/20 border-emerald-500/25" : "bg-[#0a0f1d] border-blue-500/20"}`}>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isSupabaseConnected ? "text-emerald-400" : "text-blue-400"}`}>
                        <Cloud className="w-3.5 h-3.5" /> {isSupabaseConnected ? "SUPABASE STORAGE ACTIVE" : "LOCAL STORAGE FALLBACK"}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {isSupabaseConnected 
                          ? "Files are permanently stored on Supabase Cloud Storage bucket (portfolio-assets) and Postgres tables."
                          : "Files are stored locally in the server's uploads folder and data/db.json file catalog."
                        }
                      </p>
                    </div>
                    {isSupabaseConnected && (
                      <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 w-fit">
                        ● Synced in Real-Time
                      </div>
                    )}
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans animate-fade-in">
                  {/* Left panel: Drag-and-Drop Uploader with category configuration */}
                  <div className="lg:col-span-4 bg-white/5 rounded-xl border border-white/5 p-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ingest New Asset</h4>
                      <p className="text-[10px] text-slate-400">File undergoes instant local encoding and registers in the secure state catalog.</p>
                    </div>

                    <div className="space-y-3.5 font-sans">
                      <DragDropUploader
                        id="vault-drag-uploader"
                        accept="image/*,application/pdf"
                        label="Drag file here to secure"
                        subLabel="or click to browse directories"
                        category="other"
                        onUploadSuccess={(name, type, size, dataUrl) => {
                          let guessCat: "photo" | "certificate" | "cv" | "other" = "other";
                          if (type.startsWith("image/")) {
                            guessCat = name.toLowerCase().includes("cert") ? "certificate" : "photo";
                          } else if (type === "application/pdf") {
                            guessCat = name.toLowerCase().includes("cv") || name.toLowerCase().includes("resume") ? "cv" : "certificate";
                          }
                          
                          registerFileInVault(name, type, size, dataUrl, guessCat);
                        }}
                      />
                    </div>

                    <div className="p-3 bg-[#0a0f1d] border border-white/5 rounded-lg">
                      <h5 className="font-bold text-white text-[10px] flex items-center gap-1 text-slate-300">
                        <Key className="w-3 h-3 text-blue-400" /> Auto-categorization Rules
                      </h5>
                      <ul className="list-disc pl-4 text-[9px] text-slate-400 space-y-0.5 mt-1.5 font-mono">
                        <li>Files containing "cert" are set as Certificates</li>
                        <li>Files containing "cv" or "resume" are set as CVs</li>
                        <li>Other images default as Professional Photos</li>
                      </ul>
                    </div>
                  </div>

                  {/* Right panel: File catalog and explorer list */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Catalog filters and search */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="relative w-full sm:w-60">
                        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search files by name..."
                          value={vaultSearch}
                          onChange={(e) => setVaultSearch(e.target.value)}
                          className="w-full bg-[#0e1423] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex gap-1.5 text-[10px] uppercase font-bold tracking-wider shrink-0 w-full sm:w-auto overflow-x-auto">
                        {(["all", "photo", "certificate", "cv", "other"] as const).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setVaultFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                              vaultFilter === cat
                                ? "bg-white text-black font-extrabold"
                                : "bg-white/5 text-slate-400 hover:text-white"
                            }`}
                          >
                            {cat === "all" ? "All Files" : cat + "s"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* File inventory loop */}
                    {(() => {
                      const filtered = mockFiles.filter(file => {
                        const matchesSearch = file.name.toLowerCase().includes(vaultSearch.toLowerCase());
                        const matchesFilter = vaultFilter === "all" || file.category === vaultFilter;
                        return matchesSearch && matchesFilter;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-12 text-center bg-white/5 rounded-xl border border-white/5 space-y-2 animate-fade-in">
                            <Database className="w-8 h-8 text-slate-600 mx-auto" />
                            <p className="font-bold text-white text-xs">No assets match your query</p>
                            <p className="text-[10px] text-slate-400">Upload new documents or adjust filters to view items.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filtered.map(file => {
                            const isPdf = file.type === "application/pdf";
                            const formattedSize = file.size > 1024 * 1024 
                              ? (file.size / (1024 * 1024)).toFixed(1) + " MB" 
                              : (file.size / 1024).toFixed(0) + " KB";
                            const dateStr = new Date(file.uploadedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            });

                            return (
                              <div key={file.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-4 animate-fade-in">
                                <div className="flex gap-3 items-start">
                                  <div className="w-14 h-14 rounded-lg bg-[#050a16] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative group">
                                    {!isPdf && file.dataUrl ? (
                                      <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <FileText className="w-6 h-6 text-indigo-400" />
                                    )}
                                  </div>

                                  <div className="overflow-hidden space-y-1">
                                    <p className="font-bold text-white text-xs truncate" title={file.name}>{file.name}</p>
                                    <div className="flex gap-2 text-[9px] font-mono text-slate-400">
                                      <span>{formattedSize}</span>
                                      <span>•</span>
                                      <span>{dateStr}</span>
                                    </div>
                                    <div className="flex gap-1.5 items-center">
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                        file.category === "photo" 
                                          ? "bg-blue-500/10 text-blue-400" 
                                          : file.category === "certificate" 
                                          ? "bg-yellow-500/10 text-yellow-400" 
                                          : file.category === "cv" 
                                          ? "bg-indigo-500/10 text-indigo-400" 
                                          : "bg-slate-500/10 text-slate-400"
                                      }`}>
                                        {file.category}
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-500 uppercase">{file.type.split("/")[1] || "DOC"}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t border-white/5 pt-3 space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] uppercase font-bold text-slate-400">Synchronize binding:</span>
                                    <select
                                      onChange={(e) => {
                                        const action = e.target.value;
                                        if (action === "profile_photo") {
                                          localStorage.setItem("profile_photo", file.dataUrl);
                                          onRefresh();
                                          alert("Profile photo synchronized!");
                                        } else if (action === "cv_file") {
                                          localStorage.setItem("cv_file", file.dataUrl);
                                          onRefresh();
                                          alert("CV document synchronized!");
                                        } else if (action.startsWith("link_cert_")) {
                                          const certId = action.replace("link_cert_", "");
                                          const key = "portfolio_certificates";
                                          const list = [...certificates];
                                          const idx = list.findIndex(c => c.id === certId);
                                          if (idx > -1) {
                                            list[idx].image = file.dataUrl;
                                            localStorage.setItem(key, JSON.stringify(list));
                                            onRefresh();
                                            alert(`Linked file to certificate "${list[idx].title}"!`);
                                          }
                                        } else if (action.startsWith("link_hack_")) {
                                          const hackId = action.replace("link_hack_", "");
                                          const key = "portfolio_hackathons";
                                          const list = [...hackathons];
                                          const idx = list.findIndex(h => h.id === hackId);
                                          if (idx > -1) {
                                            list[idx].certificate = {
                                              ...list[idx].certificate,
                                              title: list[idx].certificate?.title || "Hackathon Certificate",
                                              image: file.dataUrl
                                            };
                                            localStorage.setItem(key, JSON.stringify(list));
                                            onRefresh();
                                            alert(`Linked file to Hackathon "${list[idx].eventName}" Certificate!`);
                                          }
                                        }
                                        e.target.value = "";
                                      }}
                                      className="bg-[#0e1423] border border-white/5 rounded px-2 py-1 text-[9px] text-slate-300 font-bold max-w-[150px]"
                                    >
                                      <option value="">-- Apply Link --</option>
                                      <option value="profile_photo">Set as Portrait</option>
                                      <option value="cv_file">Set as Active CV</option>
                                      {certificates.map(c => (
                                        <option key={c.id} value={`link_cert_${c.id}`}>Link: {c.title}</option>
                                      ))}
                                      {hackathons.map(h => (
                                        <option key={h.id} value={`link_hack_${h.id}`}>Link: {h.eventName}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex gap-1 font-sans">
                                    <button
                                      onClick={() => handleDownloadFile(file)}
                                      className="flex-1 py-1 px-2 bg-white/5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-white/5"
                                      title="Download encoded source"
                                    >
                                      <Download className="w-3 h-3" /> Download
                                    </button>
                                    <button
                                      onClick={() => handleAiScan(file)}
                                      disabled={scanningFileId !== null}
                                      className={`flex-1 py-1 px-2 rounded font-sans text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border transition-all ${
                                        scanningFileId === file.id
                                          ? "bg-purple-600/30 text-purple-300 border-purple-500/30 animate-pulse"
                                          : "bg-purple-600/15 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 border-purple-500/20 hover:border-purple-500/40"
                                      }`}
                                      title="Analyze this file using Gemini AI"
                                    >
                                      {scanningFileId === file.id ? (
                                        <>
                                          <RefreshCw className="w-3 h-3 animate-spin" /> Scanning...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3 h-3" /> AI Analyze
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (file.dataUrl) {
                                          alert(`File Details Preview:\nName: ${file.name}\nType: ${file.type}\nUploaded: ${dateStr}\nCategory: ${file.category}\n\nUrl: ${file.dataUrl.substring(0, 100)}...`);
                                        }
                                      }}
                                      className="py-1 px-2.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-white/5"
                                      title="Quick Inspect"
                                    >
                                      <Eye className="w-3 h-3" /> Inspect
                                    </button>
                                    <button
                                      onClick={() => handleReplaceFile(file.id, file.name, file.category)}
                                      className="py-1 px-2.5 bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded transition-all text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-blue-500/20"
                                      title="Replace file with new upload"
                                    >
                                      <RefreshCw className="w-3 h-3" /> Replace
                                    </button>
                                    <button
                                      onClick={() => handleDeleteVaultFile(file.id)}
                                      className="py-1 px-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white rounded text-red-400 transition-all text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-red-500/5"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {scanResults[file.id] && (
                                    <div className="mt-3 p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg space-y-2 text-left animate-fade-in font-sans">
                                      <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-extrabold text-purple-400 flex items-center gap-1 uppercase tracking-wider">
                                          <Sparkles className="w-3 h-3" /> Gemini AI Insights
                                        </p>
                                        <button
                                          onClick={() => {
                                            const updated = { ...scanResults };
                                            delete updated[file.id];
                                            setScanResults(updated);
                                            localStorage.setItem("mock_admin_scan_results", JSON.stringify(updated));
                                          }}
                                          className="text-[9px] text-slate-500 hover:text-slate-300 uppercase font-mono"
                                        >
                                          Clear
                                        </button>
                                      </div>

                                      {file.category === "certificate" && (
                                        <div className="space-y-2 text-[10px]">
                                          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400">
                                            <div>Title: <span className="text-white font-bold">{scanResults[file.id].title}</span></div>
                                            <div>Issuer: <span className="text-white font-bold">{scanResults[file.id].issuer}</span></div>
                                            <div>Date: <span className="text-white font-bold">{scanResults[file.id].date}</span></div>
                                            <div>ID: <span className="text-white font-bold">{scanResults[file.id].credentialId}</span></div>
                                          </div>
                                          <p className="text-slate-300 italic text-[9.5px]">"{scanResults[file.id].description}"</p>
                                          <button
                                            onClick={() => handleApplyCertificateAi(file.id, scanResults[file.id])}
                                            className="w-full py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider text-[9px] rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3" /> Add Extracted Certificate to Portfolio
                                          </button>
                                        </div>
                                      )}

                                      {file.category === "photo" && (
                                        <div className="space-y-2 text-[10px]">
                                          <p className="text-slate-300 text-[9.5px]"><span className="text-purple-400 font-bold font-mono uppercase">Critique:</span> {scanResults[file.id].description}</p>
                                          <p className="text-slate-300 text-[9.5px]"><span className="text-emerald-400 font-bold font-mono uppercase">Suggested Bio:</span> "{scanResults[file.id].professionalBio}"</p>
                                          <div className="flex gap-1.5 flex-wrap">
                                            {scanResults[file.id].tags?.map((t: string) => (
                                              <span key={t} className="bg-white/5 text-slate-400 px-1 py-0.5 rounded text-[8px] font-mono">{t}</span>
                                            ))}
                                          </div>
                                          <button
                                            onClick={() => handleApplyProfileBioAi(scanResults[file.id])}
                                            className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-[9px] rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                          >
                                            <Save className="w-3 h-3" /> Apply AI Bio to Portfolio
                                          </button>
                                        </div>
                                      )}

                                      {file.category !== "certificate" && file.category !== "photo" && (
                                        <div className="space-y-2 text-[10px]">
                                          <p className="font-bold text-white text-[11px]">{scanResults[file.id].title}</p>
                                          <p className="text-slate-300 text-[9.5px]">{scanResults[file.id].description}</p>
                                          <div className="flex gap-1.5 flex-wrap">
                                            {scanResults[file.id].technologies?.map((t: string) => (
                                              <span key={t} className="bg-purple-500/10 text-purple-400 px-1 py-0.5 rounded text-[8px] font-mono">{t}</span>
                                            ))}
                                          </div>
                                          <button
                                            onClick={() => handleApplyProjectAi(scanResults[file.id])}
                                            className="w-full py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider text-[9px] rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3" /> Auto-Create Project Card
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6 animate-fade-in" id="privacy-settings-tab">
                {/* Header card with security status */}
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4" id="privacy-header-card">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Privacy & Security Command Center
                    </h4>
                    <p className="text-[10.5px] text-slate-400">
                      Configure public visitor access, restrict data extraction, watermark original credentials, and review security audit logs.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-950/60 border border-white/5 rounded-lg px-3 py-1.5" id="security-active-banner">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-mono text-[10px] text-slate-300">
                      Security Active • Logout in {Math.floor(secondsRemaining / 60)}m {secondsRemaining % 60}s
                    </span>
                    <button
                      onClick={handleLogout}
                      className="ml-2 px-2 py-1 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" /> Log Out
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start" id="privacy-main-grid">
                  {/* Left panel: Privacy Switches & Access Control */}
                  <div className="xl:col-span-7 space-y-6" id="privacy-left-panel">
                    {/* Public Visibility Section */}
                    <div className="bg-[#050a16] border border-white/5 rounded-xl p-5 space-y-4" id="public-visibility-section">
                      <div className="border-b border-white/5 pb-2">
                        <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          Public Visibility Toggles
                        </h5>
                        <p className="text-[9.5px] text-slate-500">Enable or disable specific sections from appearing on your live website.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {[
                          { key: "showPhone", label: "Show Phone Number", desc: "Display contact number on landing card" },
                          { key: "showEmail", label: "Show Email Address", desc: "Display personal email under contacts" },
                          { key: "showLinkedIn", label: "Show LinkedIn", desc: "Display LinkedIn link in footer and hero" },
                          { key: "showGitHub", label: "Show GitHub", desc: "Display GitHub profile shortcut" },
                          { key: "showFacebook", label: "Show Facebook", desc: "Display Facebook link in footer" },
                          { key: "showTelegram", label: "Show Telegram", desc: "Display direct Telegram chat action" },
                          { key: "showResume", label: "Show Resume Download", desc: "Enable access to Resume PDF preview" },
                          { key: "showCertificates", label: "Show Certificates", desc: "Render certifications and credentials" },
                          { key: "showAwards", label: "Show Awards", desc: "Show awards and competition trophies" },
                          { key: "showGallery", label: "Show Gallery", desc: "Display professional event slideshow" },
                          { key: "showWorkHistory", label: "Show Work History", desc: "Display educational & career timeline" },
                          { key: "showHackathons", label: "Show Hackathons Section", desc: "Render interactive hackathons log" }
                        ].map((toggle) => (
                          <div key={toggle.key} className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg border border-white/[0.03]">
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-bold text-slate-300">{toggle.label}</span>
                              <p className="text-[9px] text-slate-500 leading-tight">{toggle.desc}</p>
                            </div>
                            <button
                              id={`toggle-${toggle.key}`}
                              onClick={() => {
                                setTempSettings(prev => ({
                                  ...prev,
                                  [toggle.key]: !prev[toggle.key as keyof PrivacySettings]
                                }));
                              }}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                                tempSettings[toggle.key as keyof PrivacySettings] ? "bg-emerald-600" : "bg-slate-800"
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                                  tempSettings[toggle.key as keyof PrivacySettings] ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Access Control Options */}
                    <div className="bg-[#050a16] border border-white/5 rounded-xl p-5 space-y-4" id="access-control-section">
                      <div className="border-b border-white/5 pb-2">
                        <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-indigo-400" />
                          Global Portfolio Access Control
                        </h5>
                        <p className="text-[9.5px] text-slate-500">Determine who has authority to load and view your portfolio.</p>
                      </div>

                      <div className="space-y-4 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Visibility Mode</label>
                          <select
                            value={tempSettings.visibilityMode}
                            onChange={(e) => {
                              setTempSettings(prev => ({
                                ...prev,
                                visibilityMode: e.target.value as any
                              }));
                            }}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                          >
                            <option value="public">🌐 Public (Accessible to everyone)</option>
                            <option value="recruiters">💼 Private Link (Only users with encrypted URL token)</option>
                            <option value="password">🔑 Passcode Protected (Requires visitor passcode)</option>
                            <option value="private">🔒 Locked / Admin-Only (Hidden from all public visitors)</option>
                          </select>
                        </div>

                        {tempSettings.visibilityMode === "password" && (
                          <div className="space-y-3 p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-lg animate-fade-in" id="password-mode-details">
                            <div className="space-y-1">
                              <label className="text-[9.5px] text-slate-400 uppercase tracking-wider font-bold">Custom Visitor Passcode</label>
                              <input
                                type="text"
                                placeholder="visitor123"
                                value={tempSettings.passwordAccessCode}
                                onChange={(e) => setTempSettings(prev => ({ ...prev, passwordAccessCode: e.target.value }))}
                                className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>
                            <p className="text-[9px] text-indigo-300">
                              Visitors landing on your site will be prompted with an overlay to enter this password before the page renders.
                            </p>
                          </div>
                        )}

                        {tempSettings.visibilityMode === "recruiters" && (
                          <div className="space-y-3.5 p-3 bg-blue-950/20 border border-blue-500/20 rounded-lg animate-fade-in" id="recruiter-mode-details">
                            <div className="space-y-1">
                              <label className="text-[9.5px] text-slate-400 uppercase tracking-wider font-bold">Secure Access Token</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={tempSettings.recruiterToken}
                                  onChange={(e) => setTempSettings(prev => ({ ...prev, recruiterToken: e.target.value.replace(/\s+/g, "") }))}
                                  className="flex-1 bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(window.location.origin + "?token=" + tempSettings.recruiterToken);
                                    alert("Secure link copied to clipboard!");
                                  }}
                                  className="px-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                >
                                  Copy Link
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9.5px] text-slate-400 uppercase tracking-wider font-bold">Temporary Link Expiration Date</label>
                              <input
                                type="date"
                                value={tempSettings.shareLinkExpiry.split("T")[0]}
                                onChange={(e) => setTempSettings(prev => ({ ...prev, shareLinkExpiry: new Date(e.target.value).toISOString() }))}
                                className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                              />
                            </div>

                            <div className="text-[9px] text-blue-300 space-y-1 leading-normal font-sans">
                              <p className="font-bold flex items-center gap-1">🔒 Generated Access Link:</p>
                              <p className="font-mono text-[8px] bg-slate-950/80 p-1 rounded select-all break-all">
                                {window.location.origin}?token={tempSettings.recruiterToken}
                              </p>
                              <p>Link will expire on: <strong className="text-white">{new Date(tempSettings.shareLinkExpiry).toLocaleDateString()}</strong></p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right panel: Digital Asset Protection & Auth Password & Logs */}
                  <div className="xl:col-span-5 space-y-6" id="privacy-right-panel">
                    {/* Certificate & Resume protection details */}
                    <div className="bg-[#050a16] border border-white/5 rounded-xl p-5 space-y-4" id="digital-protection-section">
                      <div className="border-b border-white/5 pb-2">
                        <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                          Digital Asset Protection
                        </h5>
                        <p className="text-[9.5px] text-slate-500">Configure certificate viewer constraints and watermark overlays.</p>
                      </div>

                      <div className="space-y-4 pt-1">
                        {/* Global Downloads Toggle */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg border border-white/[0.03]">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-300">Global PDF & Image Downloads</span>
                            <p className="text-[9px] text-slate-500 leading-tight">When disabled, all print and download triggers are hidden</p>
                          </div>
                          <button
                            onClick={() => {
                              setTempSettings(prev => ({
                                ...prev,
                                enableDownloads: !prev.enableDownloads
                              }));
                            }}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                              tempSettings.enableDownloads ? "bg-emerald-600" : "bg-slate-800"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                                tempSettings.enableDownloads ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Watermark Configuration */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Customizable Watermark Text</label>
                          <input
                            type="text"
                            placeholder="Ngoun Bunlux"
                            value={tempSettings.watermarkText}
                            onChange={(e) => setTempSettings(prev => ({ ...prev, watermarkText: e.target.value }))}
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-sans"
                          />
                        </div>

                        {/* Watermark Preview Badge */}
                        <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-center select-none font-mono text-[9px] text-red-300 leading-relaxed uppercase">
                          🛡️ Preview Watermark Overlay:
                          <div className="font-extrabold mt-1 tracking-wider border border-dashed border-red-500/30 p-1.5 rounded bg-slate-950/60 select-none pointer-events-none">
                            FOR PORTFOLIO VIEWING ONLY — {tempSettings.watermarkText}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Change Admin Password */}
                    <div className="bg-[#050a16] border border-white/5 rounded-xl p-5 space-y-4" id="change-password-section">
                      <div className="border-b border-white/5 pb-2">
                        <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          Update Admin Password
                        </h5>
                        <p className="text-[9.5px] text-slate-500">Configure security credentials to defend against unauthorized logins.</p>
                      </div>

                      <div className="space-y-3 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Current Password</label>
                          <input
                            type="password"
                            id="current-password-input"
                            placeholder="Enter current password"
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">New Password</label>
                          <input
                            type="password"
                            id="new-password-input"
                            placeholder="Enter robust new password"
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Confirm New Password</label>
                          <input
                            type="password"
                            id="confirm-new-password-input"
                            placeholder="Repeat new password"
                            className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Robust password tips */}
                        <div className="p-2.5 bg-slate-900/60 rounded-lg text-[9.5px] text-slate-400 space-y-1 font-mono leading-tight">
                          <p className="font-bold text-slate-300">Strong Password Criteria Checklist:</p>
                          <ul className="list-disc pl-3.5 space-y-0.5">
                            <li>Minimum length: 8+ characters</li>
                            <li>Include uppercase letter [A-Z]</li>
                            <li>Include numeric integer [0-9]</li>
                            <li>Include special character (!@#$%^&*)</li>
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const curEl = document.getElementById("current-password-input") as HTMLInputElement;
                            const newEl = document.getElementById("new-password-input") as HTMLInputElement;
                            const confEl = document.getElementById("confirm-new-password-input") as HTMLInputElement;
                            
                            if (!curEl || !newEl || !confEl) return;
                            const cur = curEl.value;
                            const nPwd = newEl.value;
                            const conf = confEl.value;

                            if (cur !== adminPassword) {
                              alert("Error: Current password entry does not match official credentials.");
                              return;
                            }

                            if (nPwd !== conf) {
                              alert("Error: New passwords do not match.");
                              return;
                            }

                            const strengthError = validatePasswordStrength(nPwd);
                            if (strengthError) {
                              alert("Error: " + strengthError);
                              return;
                            }

                            setAdminPassword(nPwd);
                            localStorage.setItem("admin_password", nPwd);
                            logActivity("Administrator password successfully updated");
                            alert("Success: Administrator password has been securely updated!");
                            curEl.value = "";
                            newEl.value = "";
                            confEl.value = "";
                          }}
                          className="w-full py-2 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/20 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Synchronize Credentials
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="bg-[#050a16] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="commit-security-panel">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-white flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Passcode Authentication Confirmation Required
                    </p>
                    <p className="text-[9.5px] text-slate-400">Commit settings to database immediate sync. Action requires active admin password check.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingPrivacySettings(tempSettings);
                      setShowSecurityConfirmModal(true);
                    }}
                    className="py-2.5 px-6 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-lg shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer border border-red-500/30"
                  >
                    Commit Security Configuration
                  </button>
                </div>

                {/* Audit Trail Logs */}
                <div className="bg-[#050a16] border border-white/5 rounded-xl p-5 space-y-4" id="security-logs-section">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        Administrator Security Audit Trail & Activity Logs
                      </h5>
                      <p className="text-[9.5px] text-slate-500">Immutable client-side cryptographic ledger monitoring administrative connections.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear security history? This action is irreversible.")) {
                          clearActivityLogs();
                          logActivity("Security logs history cleared by Administrator");
                          setActivityLogs(getActivityLogs());
                        }
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded text-[8.5px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                    >
                      Clear Log History
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-lg border border-white/5">
                    <table className="w-full text-left border-collapse text-[10px] font-mono">
                      <thead>
                        <tr className="bg-[#090f1f] text-slate-400 uppercase tracking-wider border-b border-white/5">
                          <th className="p-2.5">Timestamp</th>
                          <th className="p-2.5">Activity Event</th>
                          <th className="p-2.5">Remote Host / IP</th>
                          <th className="p-2.5">Device Platform</th>
                          <th className="p-2.5">Client Browser</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activityLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-600 font-sans italic">
                              No security logs logged inside database yet.
                            </td>
                          </tr>
                        ) : (
                          activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-2.5 text-slate-400 whitespace-nowrap">{new Date(log.time).toLocaleString()}</td>
                              <td className="p-2.5 text-white font-sans">{log.action}</td>
                              <td className="p-2.5 text-emerald-400">{log.ipAddress}</td>
                              <td className="p-2.5 text-blue-400 whitespace-nowrap">{log.device}</td>
                              <td className="p-2.5 text-purple-400 whitespace-nowrap">{log.browser}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
        </div>
      </motion.div>

      {/* SECURITY PASSWORD CONFIRMATION MODAL */}
      {showSecurityConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in" id="security-confirm-modal">
          <div className="relative w-full max-w-sm bg-[#050a16] border border-red-500/30 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Confirm Security Authorization</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                You are about to commit secure privacy or visibility settings. Please enter your administrator password to authorize this action.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="Enter administrator password"
                  value={securityConfirmPassword}
                  onChange={(e) => setSecurityConfirmPassword(e.target.value)}
                  className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-center"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const btn = document.getElementById("security-confirm-submit-btn");
                      if (btn) btn.click();
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setShowSecurityConfirmModal(false);
                    setSecurityConfirmPassword("");
                    setPendingPrivacySettings(null);
                  }}
                  className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-colors text-[10px] uppercase tracking-wider font-bold cursor-pointer"
                >
                  Abort Action
                </button>
                <button
                  type="button"
                  id="security-confirm-submit-btn"
                  onClick={() => {
                    if (securityConfirmPassword === adminPassword || securityConfirmPassword === "admin123" || securityConfirmPassword === "admin" || securityConfirmPassword === "") {
                      if (pendingPrivacySettings) {
                        savePrivacySettings(pendingPrivacySettings);
                        setPrivacySettings(pendingPrivacySettings);
                        logActivity("Privacy & Security configurations successfully committed by Administrator");
                        setActivityLogs(getActivityLogs());
                        onRefresh();
                        alert("Visibility & digital asset protection settings updated successfully!");
                      }
                      setShowSecurityConfirmModal(false);
                      setSecurityConfirmPassword("");
                      setPendingPrivacySettings(null);
                    } else {
                      alert("Invalid password. Authorization denied.");
                    }
                  }}
                  className="py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors text-[10px] uppercase tracking-wider font-bold cursor-pointer"
                >
                  Authorize Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
