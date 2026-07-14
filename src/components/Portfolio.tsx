import React, { useState, useEffect, useRef } from "react";
import {
  Code,
  Brain,
  Award,
  Briefcase,
  Mail,
  Linkedin,
  Github,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone,
  CheckCircle,
  GraduationCap,
  Calendar,
  MessageSquare,
  Globe,
  Facebook,
  Database,
  ArrowDownCircle,
  Info,
  Trophy,
  Search,
  Eye,
  Settings,
  Terminal,
  Cpu,
  Laptop,
  ShieldCheck,
  Send,
  BookOpen,
  ArrowUp,
  Download
} from "lucide-react";
import { SectionType, ProjectData, CertificateData, AwardData, HackathonData, ExperienceData, GalleryItem, ResumeData, PrivacySettings } from "../types";
import { motion, AnimatePresence } from "motion/react";
import ProjectDetailsModal from "./ProjectDetailsModal";
import CertificateViewerModal from "./CertificateViewerModal";
import ScheduleModal from "./ScheduleModal";
import ResumeView from "./ResumeView";
import AdminDashboard from "./AdminDashboard";
import AchievementsDashboard from "./AchievementsDashboard";
import AIIllustration from "./AIIllustration";
import TechStack from "./TechStack";
import AIDashboard from "./AIDashboard";
import { getPrivacySettings } from "../utils/security";
import { smoothScrollTo, useScrollReveal } from "../utils/scroll";
import { EyeOff, Key, ShieldCheck as LockShield, UserCheck, LayoutDashboard } from "lucide-react";
import HeaderClock from "./HeaderClock";
import HeroTyping from "./HeroTyping";

interface PortfolioProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  onEyeStateChange: (state: "idle" | "happy" | "thinking" | "waving") => void;
  children?: React.ReactNode;
}

export default function Portfolio({
  activeSection,
  onSectionChange,
  onEyeStateChange,
  children
}: PortfolioProps) {
  useScrollReveal();
  // Modal states
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Search & Filters
  const [certFilter, setCertFilter] = useState<string>("All");
  const [certSearch, setCertSearch] = useState("");
  const [galleryFilter, setGalleryFilter] = useState<string>("All");

  // Hero Typing effect variables
  const typingTitles = [
    "Data Science Student",
    "AI Prompt Engineer",
    "Machine Learning Enthusiast",
    "Full Stack Developer"
  ];

  // Contact form local state
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  // Load dynamically managed portfolio state
  const [projectsList, setProjectsList] = useState<ProjectData[]>([]);
  const [certificatesList, setCertificatesList] = useState<CertificateData[]>([]);
  const [awardsList, setAwardsList] = useState<AwardData[]>([]);
  const [hackathonsList, setHackathonsList] = useState<HackathonData[]>([]);
  const [timelineList, setTimelineList] = useState<ExperienceData[]>([]);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string>("");

  // Privacy & Access states
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(getPrivacySettings);
  const [isVisitorAuthorized, setIsVisitorAuthorized] = useState(() => {
    return sessionStorage.getItem("portfolio_visitor_authorized") === "true";
  });
  const [visitorPasscodeInput, setVisitorPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // Sync privacy settings when opening/refreshing
  useEffect(() => {
    const settings = getPrivacySettings();
    setPrivacySettings(settings);

    if (settings.visibilityMode === "public") {
      setIsVisitorAuthorized(true);
      sessionStorage.setItem("portfolio_visitor_authorized", "true");
      return;
    }

    // Check recruiter token query parameter in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (settings.visibilityMode === "recruiters" && token && token === settings.recruiterToken) {
      const expiry = new Date(settings.shareLinkExpiry);
      if (expiry > new Date()) {
        setIsVisitorAuthorized(true);
        sessionStorage.setItem("portfolio_visitor_authorized", "true");
        return;
      }
    }
  }, [isAdminOpen]);

  const refreshPortfolioData = async () => {
    try {
      const res = await fetch("/api/portfolio");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.projects) setProjectsList(d.projects);
        if (d.certificates) setCertificatesList(d.certificates);
        if (d.awards) setAwardsList(d.awards);
        if (d.hackathons) setHackathonsList(d.hackathons);
        if (d.timeline) setTimelineList(d.timeline);
        if (d.gallery) setGalleryList(d.gallery);
        if (d.profile?.photo) {
          setProfilePhoto(d.profile.photo);
          localStorage.setItem("profile_photo", d.profile.photo);
        } else {
          setProfilePhoto("");
          localStorage.removeItem("profile_photo");
        }

        // Synchronize and seed localStorage variables
        localStorage.setItem("portfolio_projects", JSON.stringify(d.projects || []));
        localStorage.setItem("portfolio_certificates", JSON.stringify(d.certificates || []));
        localStorage.setItem("portfolio_awards", JSON.stringify(d.awards || []));
        localStorage.setItem("portfolio_hackathons", JSON.stringify(d.hackathons || []));
        localStorage.setItem("portfolio_timeline", JSON.stringify(d.timeline || []));
        localStorage.setItem("portfolio_gallery", JSON.stringify(d.gallery || []));
        if (d.profile) {
          if (d.profile.name) localStorage.setItem("profile_name", d.profile.name);
          if (d.profile.title) localStorage.setItem("profile_title", d.profile.title);
          if (d.profile.bio) localStorage.setItem("profile_bio", d.profile.bio);
          if (d.profile.cvUrl) localStorage.setItem("cv_file", d.profile.cvUrl);
        }
        if (d.privacy) {
          localStorage.setItem("portfolio_privacy_settings", JSON.stringify(d.privacy));
        }
        if (d.files) {
          localStorage.setItem("mock_admin_files", JSON.stringify(d.files));
        }

        return;
      }
    } catch (err) {
      console.warn("[CMS] Server fetching offline or failed, falling back to cached local storage:", err);
    }

    // 1. Projects Default
    const cachedProjects = localStorage.getItem("portfolio_projects");
    if (cachedProjects) {
      setProjectsList(JSON.parse(cachedProjects));
    } else {
      const defaultProjects: ProjectData[] = [
        {
          id: "proj-1",
          title: "Healthcare AI System",
          description: "An advanced disease diagnostics and health-monitoring engine leveraging localized medical datasets.",
          longDescription: "A sophisticated full-stack machine learning solution designed to predict, catalog, and analyze epidemic and systemic health risks across Southeast Asia. Features clean WebGL graphics, predictive dials, and localized reports.",
          features: ["Real-time disease mapping", "Predictive modeling with 94.2% accuracy", "Localized Khmer health advisor bot", "Secure multi-tenant medical database"],
          technologies: ["Python", "TensorFlow", "FastAPI", "React", "Base44", "D3.js"],
          challenges: "Analyzing high-sparsity localized health reports with incomplete variables.",
          solutions: "Engineered deep imputation models utilizing temporal and geolocation heuristics to maximize training fidelity.",
          futureImprovements: ["Incorporate edge-device model compression", "Establish federated learning framework"],
          image: "",
          gradient: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 hover:border-blue-500/60",
          tags: ["Data Science", "Base44", "HealthTech", "AI Diagnostics"],
          category: "AI & Data Science",
          status: "Featured",
          demoUrl: "https://health-care-cambodia.base44.app",
          githubUrl: "https://github.com",
          stats: [{ label: "Accuracy", value: "94.2%" }, { label: "Inference", value: "42ms" }]
        },
        {
          id: "proj-2",
          title: "AI Image Editor Pro",
          description: "State-of-the-art web canvas integrating generative neural filters for photo editing and upscaling.",
          longDescription: "A comprehensive client-side photo studio implementing advanced canvas rendering loops, custom shaders, neural filters, and seamless API connectors for automated background removal and super-resolution upscaling.",
          features: ["Automated background isolation", "Style transfer filters", "Client-side image processing", "Super-resolution 4x upscaler"],
          technologies: ["Vite", "React", "Tailwind CSS", "Canvas API", "OpenAI API", "Lovable"],
          challenges: "Avoiding UI freezes during massive array transformations on the client browser.",
          solutions: "Dispatched computationally intense manipulation tasks to local browser Web Workers.",
          futureImprovements: ["Integrate local WebGPU diffusion models", "Add collaborative canvas support"],
          image: "",
          gradient: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/60",
          tags: ["Generative AI", "Canvas", "Lovable", "Super-Res"],
          category: "Generative AI",
          status: "Completed",
          demoUrl: "https://edit-pro-ai-a46ed11d.base44.app",
          githubUrl: "https://github.com",
          stats: [{ label: "Filters", value: "18+ Neural" }, { label: "Upscale", value: "4x Ultra" }]
        },
        {
          id: "proj-3",
          title: "Math Quest",
          description: "Interactive, gamified education platform leveraging AI-generated mathematics challenges.",
          longDescription: "A dynamic learning portal that creates math missions customized for student performance. Tracks precision metrics and speeds, adjusting the narrative and question difficulty in real-time.",
          features: ["AI challenge generator", "Progression visualizers", "Stochastic rank badges", "Responsive audio rewards"],
          technologies: ["React", "Vite", "Motion", "Tailwind CSS", "Recharts"],
          challenges: "Generating valid mathematical expressions dynamically that guarantee solvability.",
          solutions: "Established a robust semantic math parser and expression compiler backed by state validation constraints.",
          futureImprovements: ["Add multiplayer classroom speed lobbies", "Incorporate handwritten formula recognition"],
          image: "",
          gradient: "from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-500/60",
          tags: ["EdTech", "Vite", "Interactive UI", "Gamification"],
          category: "Education Tech",
          status: "Completed",
          demoUrl: "https://math-quest-84ba621e.base44.app",
          githubUrl: "https://github.com",
          stats: [{ label: "Levels", value: "150+" }, { label: "Active Users", value: "1.2k" }]
        },
        {
          id: "proj-4",
          title: "Phnom Clean Up Crew",
          description: "Crowdsourced waste tracking and civic engagement platform built for urban Phnom Penh.",
          longDescription: "Features interactive maps, GPS pinning, and clean coordinate reporting paired with gamified rewards to transform rubbish collection and municipal engagement across Phnom Penh.",
          features: ["Dynamic reporting coordinate map", "Live ticket tracking", "Gamified community rankings", "Automated civic department notifications"],
          technologies: ["React", "Lovable", "Tailwind CSS", "Leaflet Map", "Firebase"],
          challenges: "Securing location markers against malicious spam or false coordinates.",
          solutions: "Built an image-verification pipeline and strict distance-to-marker validation checks.",
          futureImprovements: ["Integrate computer vision garbage detection", "Scale to other major municipal regions"],
          image: "",
          gradient: "from-teal-500/20 to-emerald-500/10 border-teal-500/30 hover:border-teal-500/60",
          tags: ["Civic Tech", "Lovable", "Interactive Maps"],
          category: "Civic Tech",
          status: "Featured",
          demoUrl: "https://phnom-clean-up-crew.lovable.app",
          githubUrl: "https://github.com"
        },
        {
          id: "proj-5",
          title: "E-Invitation Hub",
          description: "An elegant, media-rich scheduling suite with customized invitation canvases and RSVPs.",
          longDescription: "A premium event portal designed to create visually gorgeous invitations, complete with rich multimedia overlays, interactive maps, and localized RSVP tracking databases.",
          features: ["Interactive RSVP registry", "Fluid visual layouts", "Instant schedule reminders", "Guest dashboard controller"],
          technologies: ["Netlify", "React", "Tailwind CSS", "Motion"],
          challenges: "Delivering responsive audio-visual payloads safely across various low-bandwidth mobile carriers.",
          solutions: "Leveraged image lazy loading and selective media container resolution downgrades based on active connections.",
          futureImprovements: ["Incorporate 3D venue pre-renderings", "Support SMS direct notification gateways"],
          image: "",
          gradient: "from-purple-500/20 to-pink-500/10 border-purple-500/30 hover:border-purple-500/60",
          tags: ["Web App", "Netlify", "Visual Design"],
          category: "Web Application",
          status: "Completed",
          demoUrl: "https://e-invitaition.netlify.app",
          githubUrl: "https://github.com"
        },
        {
          id: "proj-6",
          title: "Keen Movie",
          description: "Premium responsive web template designed for elegant digital cards and invitations.",
          longDescription: "Designed with elegant minimalist layouts, fluid scrolling transitions, and easy metadata configuration for beautiful wedding card hosting.",
          features: ["Minimalist aesthetic layouts", "CSS-native parallax transitions", "Optimized mobile layout buffers"],
          technologies: ["Tailwind CSS", "JavaScript", "Netlify"],
          challenges: "Creating fluid parallax effects that compile smoothly across mobile browsers without lag.",
          solutions: "Utilized hardware-accelerated CSS translate3d variables instead of JavaScript scroll triggers.",
          futureImprovements: ["Add interactive gallery templates"],
          image: "",
          gradient: "from-pink-500/20 to-red-500/10 border-pink-500/30 hover:border-pink-500/60",
          tags: ["Frontend", "Design System", "Netlify"],
          category: "Design System",
          status: "Completed",
          demoUrl: "https://keen-movie-5249bb.netlify.app/",
          githubUrl: "https://github.com"
        },
        {
          id: "proj-7",
          title: "JamCafe Menu Hub",
          description: "An interactive storefront template with custom menus, coffee configurators, and logs.",
          longDescription: "An immersive sensory landing page for coffee shops, implementing coffee configuration dials, interactive recipes, and elegant typography.",
          features: ["Coffee customizer dials", "Fluid storefront menus", "Interactive cart logs"],
          technologies: ["HTML5", "CSS3", "JavaScript", "Netlify"],
          challenges: "Simulating rich fluid states for customizable coffee options.",
          solutions: "Crafted procedural pure CSS keyframe fluid waves.",
          futureImprovements: ["Connect local terminal ordering databases"],
          image: "",
          gradient: "from-amber-500/20 to-amber-700/10 border-amber-500/30 hover:border-amber-500/60",
          tags: ["Coffee HUD", "Netlify", "Front End"],
          category: "Interactive Menu",
          status: "Completed",
          demoUrl: "https://jamcafe.netlify.app/",
          githubUrl: "https://github.com"
        },
        {
          id: "proj-8",
          title: "Personal AI Portfolio",
          description: "A world-class technical showcase featuring 3D visual interaction and a dynamic AI assistant.",
          longDescription: "An ultra-premium developer website built with responsive layout systems, real-time THREE.js model components, and an integrated generative chat assistant to summarize qualifications.",
          features: ["Integrated 3D robot model canvas", "Dynamic local admin controls", "Interactive chat assistant panel", "Full printable resume dashboard"],
          technologies: ["React", "Three.js", "Tailwind CSS", "Motion", "Vite"],
          challenges: "Rendering WebGL scenes in nested iframes without dragging browser frame rates.",
          solutions: "Initialized low-polygon model meshes and established rendering throttling based on viewport visibility.",
          futureImprovements: ["Integrate fully custom virtual environment shaders"],
          image: "",
          gradient: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/60",
          tags: ["Portfolio", "Three.js", "Vite"],
          category: "Web Engineering",
          status: "Featured",
          demoUrl: "https://ngoun-bunlux-data-sciece-ai-engineer.netlify.app/",
          githubUrl: "https://github.com"
        }
      ];
      localStorage.setItem("portfolio_projects", JSON.stringify(defaultProjects));
      setProjectsList(defaultProjects);
    }

    // 2. Certificates Default
    const cachedCerts = localStorage.getItem("portfolio_certificates");
    if (cachedCerts) {
      setCertificatesList(JSON.parse(cachedCerts));
    } else {
      const defaultCertificates: CertificateData[] = [
        {
          id: "cert-1",
          title: "MIS Datazone Data Analyst",
          issuer: "Paragon International University",
          date: "05 July 2026",
          category: "Data Science",
          credentialId: "PARAGON-MIS-DZ2026-089",
          credentialUrl: "#",
          description: "Intense, professional bootcamp focusing on data extraction, cleansing, analysis, and high-impact predictive reporting."
        },
        {
          id: "cert-2",
          title: "MIS Datazone Champion (1st Place)",
          issuer: "Paragon International University",
          date: "28 July 2024",
          category: "Hackathons",
          credentialId: "PARAGON-MIS-DZ2024-CHAMP",
          credentialUrl: "#",
          description: "Secured top position for demonstrating exceptional technical analytical execution, statistical accuracy, and teamwork during the Datazone competition."
        },
        {
          id: "cert-3",
          title: "Python Essentials 2",
          issuer: "Cisco Networking Academy / Python Institute",
          date: "19 April 2026",
          category: "Python",
          credentialId: "2d421b66-6ca9-45ab-b539-2b0f254859e2",
          credentialUrl: "#",
          description: "Advanced certification covering object-oriented programming, data structures, generators, file processing, and package creation."
        },
        {
          id: "cert-4",
          title: "Python Essentials 1",
          issuer: "Cisco Networking Academy / Python Institute",
          date: "19 April 2026",
          category: "Python",
          credentialId: "50c4ecdc-ab9d-48f6-a4da-76fe987219eb",
          credentialUrl: "#",
          description: "Fundamental certification covering variable types, expressions, control flow, functions, lists, tuples, dictionaries, and error handling."
        },
        {
          id: "cert-5",
          title: "C++ Essentials 1",
          issuer: "Cisco Networking Academy / Open Education & Development Group",
          date: "09 February 2026",
          category: "Programming",
          credentialId: "CISCO-CPP1-2026-981",
          credentialUrl: "#",
          description: "Comprehensive study of C++ language syntax, computer programming structures, functional modularity, arrays, pointers, and memory addressing."
        },
        {
          id: "cert-6",
          title: "Introduction to Data Science",
          issuer: "Cisco Networking Academy",
          date: "03 February 2026",
          category: "Data Science",
          credentialId: "CISCO-IDS-2026-334",
          credentialUrl: "#",
          description: "Fundamental training in data science paradigms, lifecycle, analysis methodologies, and the role of Machine Learning & AI in smart analytics."
        }
      ];
      localStorage.setItem("portfolio_certificates", JSON.stringify(defaultCertificates));
      setCertificatesList(defaultCertificates);
    }

    // 3. Awards Default
    const cachedAwards = localStorage.getItem("portfolio_awards");
    if (cachedAwards) {
      setAwardsList(JSON.parse(cachedAwards));
    } else {
      const defaultAwards: AwardData[] = [
        {
          id: "award-1",
          title: "Champion (1st Place)",
          organization: "MIS Datazone Competition",
          year: "2024",
          description: "Gained Champion title for demonstrating exceptional analytical thinking, innovation, and technical excellence during the MIS Datazone 2024 Competition, held on 28 July 2024 by the MIS Department.",
          iconName: "Trophy",
          goldEffect: true,
          stats: [{ label: "Team Size", value: "4 Players" }, { label: "Project Score", value: "98.5/100" }]
        },
        {
          id: "award-2",
          title: "AI Innovation Excellence Badge",
          organization: "Royal University of Phnom Penh",
          year: "2025",
          description: "Awarded for the development of Phnom Clean Up Crew civic tech tool, utilizing generative AI workflows and low-code rapid prototypes.",
          iconName: "Award",
          goldEffect: true
        }
      ];
      localStorage.setItem("portfolio_awards", JSON.stringify(defaultAwards));
      setAwardsList(defaultAwards);
    }

    // 4. Hackathons Default
    const cachedHacks = localStorage.getItem("portfolio_hackathons");
    if (cachedHacks) {
      const parsed: HackathonData[] = JSON.parse(cachedHacks);
      const cleaned = parsed.map(h => {
        if (h.id === "hack-1" || (h.eventName && h.eventName.includes("First's Wave"))) {
          return { ...h, gallery: [] };
        }
        return h;
      });
      localStorage.setItem("portfolio_hackathons", JSON.stringify(cleaned));
      setHackathonsList(cleaned);
    } else {
      const defaultHackathons: HackathonData[] = [
        {
          id: "hack-1",
          eventName: "First's Wave AI Prompting Hackathon 2026",
          date: "11 July 2026",
          category: "AI Prompt Engineering • Generative AI • No-Code Development",
          role: "Participant",
          description: "Participated in the First's Wave AI Prompting Hackathon, collaborating to build AI-powered applications using modern generative AI platforms. Gained intensive hands-on experience under tight constraints, demonstrating rapid prototyping workflows.",
          tools: ["ChatGPT", "Claude", "Le Chat (Mistral AI)", "Google AI Studio", "Base44", "Lovable", "Bolt.new", "v0 by Vercel", "Replit", "Rocket"],
          skills: ["Prompt Engineering", "Artificial Intelligence", "Full Stack Development", "Rapid Prototyping", "UI/UX Design", "Workflow Automation", "Team Collaboration", "Problem Solving", "API Integration", "AI Application Development"],
          highlights: [
            "Designed AI-powered user interfaces with modern UX aesthetics.",
            "Built functional web applications with AI-assisted development tools.",
            "Used prompt engineering to improve AI-generated code and design quality.",
            "Collaborated with teammates under hackathon time constraints.",
            "Explored modern no-code and low-code AI development workflows."
          ],
          achievements: [
            "Successfully participated in the First's Wave AI Prompting Hackathon 2026.",
            "Gained hands-on experience with leading AI development platforms.",
            "Expanded practical skills in AI-assisted software engineering.",
            "Strengthened collaboration and rapid development capabilities."
          ],
          gallery: [],
          certificate: {
            title: "First's Wave Completion Certificate",
            image: "",
            credentialId: "FW-AI-2026-BUNLUX"
          }
        }
      ];
      localStorage.setItem("portfolio_hackathons", JSON.stringify(defaultHackathons));
      setHackathonsList(defaultHackathons);
    }

    // 5. Timeline Default
    const cachedTimeline = localStorage.getItem("portfolio_timeline");
    if (cachedTimeline) {
      setTimelineList(JSON.parse(cachedTimeline));
    } else {
      const defaultTimeline: ExperienceData[] = [
        {
          id: "time-1",
          date: "2024 - Present",
          position: "Data Science Student",
          company: "Royal University of Phnom Penh (RUPP)",
          description: "Learning fundamental algorithms, statistical mathematics, data modeling, big data structures, and standard predictive analysis paradigms.",
          achievements: ["Top tier rank in mathematical reasoning classes", "Active researcher in data visualization"],
          type: "Student"
        },
        {
          id: "time-2",
          date: "2025",
          position: "AI & Full Stack Developer",
          company: "Personal Projects & Open-source Work",
          description: "Constructed deep visual networks and high-fidelity React platforms (Healthcare AI Cambodia, AI Image Editor, Math Quest) to solve civic and educational challenges.",
          achievements: ["Successfully completed 8 featured software projects", "Published repositories open for community collaboration"],
          type: "Personal Projects"
        },
        {
          id: "time-3",
          date: "2025 - Present",
          position: "Freelance Full Stack Developer",
          company: "Independent Projects",
          description: "Building responsive invitation grids, customized business landing portals, and responsive flex templates for local and global clients.",
          achievements: ["Gained client reviews averaging 5/5 stars", "Optimized search engine footprint by 40% across portfolios"],
          type: "Freelance Development"
        },
        {
          id: "time-4",
          date: "July 2026",
          position: "AI Prototyper Participant",
          company: "First's Wave AI Prompting Hackathon",
          description: "Developed and launched prompt-engineered systems under tight time budgets, optimizing low-code interfaces.",
          achievements: ["Built fully dynamic platforms in less than 24 hours", "Acquired expertise in modern rapid developer ecosystems"],
          type: "Hackathon Participant"
        },
        {
          id: "time-5",
          date: "Late 2026",
          position: "Undergraduate ML Researcher",
          company: "Phnom Penh AI Lab",
          description: "Conducting NLP and computer vision studies focusing on municipal optimization and civic technology databases.",
          achievements: ["Preparing structural dataset for Khmer parser models"],
          type: "Research"
        },
        {
          id: "time-6",
          date: "2027 & Beyond",
          position: "Senior AI Solutions Architect",
          company: "Elite Tech Corporation (OpenAI / NVIDIA / Tesla / Google)",
          description: "Aspirational target to design foundational neural systems, autonomous robotics grids, and decentralized data processing pipelines.",
          achievements: ["Engineering beneficial artificial intelligence modules to assist humanity"],
          type: "Future Career Goal"
        }
      ];
      localStorage.setItem("portfolio_timeline", JSON.stringify(defaultTimeline));
      setTimelineList(defaultTimeline);
    }

    // 6. Gallery Default
    const cachedGallery = localStorage.getItem("portfolio_gallery");
    if (cachedGallery) {
      setGalleryList(JSON.parse(cachedGallery));
    } else {
      const defaultGallery: GalleryItem[] = [
        {
          id: "gal-1",
          title: "First's Wave AI Hackathon Session",
          category: "Competition",
          image: "https://picsum.photos/seed/wave/800/600",
          description: "Working synchronously with prompt loops during the 2026 competition."
        },
        {
          id: "gal-2",
          title: "MIS Datazone 2024 Champion Trophy",
          category: "Event",
          image: "https://picsum.photos/seed/trophy/800/600",
          description: "Receiving our champion recognition plaques at Paragon International University."
        },
        {
          id: "gal-3",
          title: "Data Science Seminar at Paragon",
          category: "Workshop",
          image: "https://picsum.photos/seed/workshop/800/600",
          description: "Participating in big-data and predictive modeling modules."
        },
        {
          id: "gal-4",
          title: "Cisco C++ Certification",
          category: "Certificate",
          image: "https://picsum.photos/seed/cisco/800/600",
          description: "Completing programmatic systems validations."
        },
        {
          id: "gal-5",
          title: "Math Quest Active Interface",
          category: "Project",
          image: "https://picsum.photos/seed/math/800/600",
          description: "Building the high-fidelity responsive user views."
        },
        {
          id: "gal-6",
          title: "Developer Portrait Headshot",
          category: "Professional",
          image: "https://picsum.photos/seed/portrait/800/600",
          description: "Ngoun Bunlux formal professional headshot."
        }
      ];
      localStorage.setItem("portfolio_gallery", JSON.stringify(defaultGallery));
      setGalleryList(defaultGallery);
    }

    // Profile photo cache check
    const cachedPhoto = localStorage.getItem("profile_photo");
    if (cachedPhoto) {
      setProfilePhoto(cachedPhoto);
    } else {
      setProfilePhoto("");
    }
  };

  useEffect(() => {
    refreshPortfolioData();
  }, []);



  // Intersection observer mapping
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -25% 0px",
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id as SectionType;
          onSectionChange(id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [onSectionChange]);

  // Track scroll position to show/hide "Back to Top" button
  useEffect(() => {
    let ticking = false;
    let lastState = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 400;
          if (shouldShow !== lastState) {
            lastState = shouldShow;
            setShowScrollTop(shouldShow);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    onEyeStateChange("thinking");

    setTimeout(() => {
      setFormState("success");
      onEyeStateChange("happy");
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      setTimeout(() => {
        onEyeStateChange("idle");
      }, 3000);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Filtered lists
  const filteredCertificates = certificatesList.filter((cert) => {
    const matchesCategory = certFilter === "All" || cert.category === certFilter;
    const matchesSearch = cert.title.toLowerCase().includes(certSearch.toLowerCase()) ||
                          cert.issuer.toLowerCase().includes(certSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredGallery = galleryList.filter((item) => {
    return galleryFilter === "All" || item.category === galleryFilter;
  });

  // Dynamic names and bio values
  const pageName = localStorage.getItem("profile_name") || "Ngoun Bunlux";
  const pageTitle = localStorage.getItem("profile_title") || "Data Science Student";
  const pageBio = localStorage.getItem("profile_bio") || "Passionate student at Royal University of Phnom Penh focusing on Machine Learning and Generative AI application design.";

  // Hardcoded resume defaults
  const sampleResumeInfo: ResumeData = {
    summary: pageBio,
    languages: [
      { name: "Khmer", level: "Native / Bilingual" },
      { name: "English", level: "Professional Working" }
    ],
    references: [
      { name: "Mrs. Sreyteav Sry", role: "Head of MIS Department, Paragon International University", contact: "sreyteav.sry@paragon.edu.kh" },
      { name: "Mr. Singthay Theng", role: "Project Manager, MIS Datazone", contact: "singthay.theng@paragon.edu.kh" }
    ]
  };

  if (!isVisitorAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans select-none" id="visitor-gate-overlay">
        <div className="relative w-full max-w-md bg-[#020617] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-6 text-center animate-fade-in">
          
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
              <EyeOff className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold font-display text-white">Security Access Verification</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
              {privacySettings.visibilityMode === "private" && "This digital portfolio has been locked and set to Private Maintenance by the administrator."}
              {privacySettings.visibilityMode === "password" && "This digital portfolio is protected by a custom security passcode. Please verify credentials."}
              {privacySettings.visibilityMode === "recruiters" && "This digital portfolio is configured for Secured Link Access only. Verified recruiters require an encrypted URL token."}
            </p>
          </div>

          {privacySettings.visibilityMode === "password" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (visitorPasscodeInput === privacySettings.passwordAccessCode) {
                  setIsVisitorAuthorized(true);
                  sessionStorage.setItem("portfolio_visitor_authorized", "true");
                  setPasscodeError("");
                } else {
                  setPasscodeError("Invalid security passcode. Access denied.");
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <input
                  type="password"
                  required
                  placeholder="Enter security passcode"
                  value={visitorPasscodeInput}
                  onChange={(e) => setVisitorPasscodeInput(e.target.value)}
                  className="w-full bg-[#0e1423] border border-white/10 rounded-lg px-3 py-2.5 text-center text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono transition-colors"
                />
                {passcodeError && <p className="text-[10px] text-red-400 font-semibold">{passcodeError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-extrabold uppercase tracking-widest text-[10px] hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Unlock Portfolio
              </button>
            </form>
          )}

          {privacySettings.visibilityMode === "recruiters" && (
            <div className="space-y-4 p-4 bg-blue-950/20 border border-blue-500/20 rounded-xl text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> For Professional Recruiters
              </h4>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                If you have been sent a secure temporary access link by the administrator, please ensure you are visiting the full URL (containing the query parameter <strong className="text-white">?token=...</strong>).
              </p>
              <p className="text-[9.5px] text-slate-500">
                To request an updated link, please contact the portfolio owner at: <a href="mailto:ngounbunlux52@gmail.com" className="text-slate-400 hover:text-blue-400 underline transition-colors font-bold">ngounbunlux52@gmail.com</a>
              </p>
            </div>
          )}

          {privacySettings.visibilityMode === "private" && (
            <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-[10.5px] text-red-300 leading-relaxed">
              Administrative lockdown active. The portfolio index is currently hidden from public visitors.
            </div>
          )}

          <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-colors text-[9.5px] uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              Access Administrator Command Portal
            </button>
            <p className="text-[9px] text-slate-600 font-mono">KEEN MOVIE SYSTEM</p>
          </div>
        </div>

        {/* SECURE DASHBOARD COMPONENT AT THE BARRIER LEVEL */}
        {isAdminOpen && (
          <AdminDashboard
            onClose={() => setIsAdminOpen(false)}
            onRefresh={refreshPortfolioData}
            projects={projectsList}
            certificates={certificatesList}
            awards={awardsList}
            hackathons={hackathonsList}
            timeline={timelineList}
            gallery={galleryList}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full min-h-screen text-slate-100 flex flex-col items-center">
      
      {/* GLOWING FLOATING HEADER PANEL */}
      <div className="sticky top-4 z-40 w-[95%] max-w-6xl mx-auto">
        <header className="w-full px-5 py-3 flex items-center justify-between border border-white/10 backdrop-blur-xl bg-[#0B1026]/75 rounded-2xl shadow-xl shadow-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6] via-[#22D3EE] to-[#7C3AED] p-[1.5px] flex items-center justify-center font-display font-extrabold text-white text-md shadow-lg shadow-blue-500/10">
              <div className="w-full h-full bg-[#050816] rounded-[10px] flex items-center justify-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">KM</span>
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-xs font-bold font-display text-white tracking-wide">{pageName}</h1>
              <p className="text-[9px] text-[#22D3EE] font-mono tracking-wider font-semibold uppercase">{pageTitle}</p>
            </div>
          </div>

          {/* Global Navigator Links */}
          <nav className="hidden md:flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white/5 p-1 rounded-xl border border-white/5">
            {(["hero", "about", "achievements", "projects", "hackathons", "certificates", "gallery", "resume", "contact"] as const)
              .filter((sec) => {
                if (sec === "hackathons" && !privacySettings.showHackathons) return false;
                if (sec === "certificates" && !privacySettings.showCertificates) return false;
                if (sec === "gallery" && !privacySettings.showGallery) return false;
                if (sec === "resume" && !privacySettings.showResume) return false;
                return true;
              })
              .map((sec) => (
                <a
                  key={sec}
                  href={`#${sec}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSectionChange(sec);
                    smoothScrollTo(`#${sec}`, 850);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all relative cursor-pointer font-bold ${
                    activeSection === sec
                      ? "text-white bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] shadow-md shadow-blue-500/10"
                      : "hover:text-white hover:bg-white/5"
                  }`}
                >
                  {sec}
                </a>
              ))}
          </nav>

          {/* Dynamic header clock and Admin button */}
          <div className="flex items-center gap-3">
            <HeaderClock />
            
            <button
              onClick={() => setIsAdminOpen(true)}
              className="p-2.5 bg-gradient-to-r from-[#3B82F6]/10 to-[#7C3AED]/10 hover:from-[#3B82F6]/25 hover:to-[#7C3AED]/25 rounded-xl text-slate-300 hover:text-white transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer text-[10px] font-bold uppercase tracking-wider shadow-md"
              title="LuxAI Dashboard Control Panel"
            >
              <Settings className="w-3.5 h-3.5 text-[#22D3EE] animate-[spin_8s_linear_infinite]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </header>
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 py-12 space-y-32">
        
        {/* ========================================================== */}
        {/* SECTION 1: PREMIUM HERO */}
        {/* ========================================================== */}
        <section id="hero" className="scroll-reveal min-h-[85vh] flex flex-col lg:flex-row justify-between items-center gap-12 relative py-12">
          
          {/* Ambient light effects inside hero */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950/20 via-transparent to-transparent -z-10" />

          {/* Premium AI & Data Science holographic dashboard behind/beside the profile */}
          <AIDashboard />

          {/* Left Text layout with premium typography */}
          <div className="flex-1 space-y-8 max-w-2xl text-left">
            <div className="space-y-4">
              <span className="px-3.5 py-1.5 text-[10px] font-mono uppercase bg-gradient-to-r from-[#3B82F6]/15 to-[#7C3AED]/15 text-[#22D3EE] border border-cyan-500/30 rounded-full font-bold flex items-center gap-1.5 w-fit shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#22D3EE]" />
                <span>AI & Data Science Scholar</span>
              </span>
              <h2 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight leading-none animate-fade-in">
                Hi, I am <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#22D3EE] to-[#7C3AED]">{pageName}</span>
              </h2>
              {/* Responsive custom typed header */}
              <HeroTyping titles={typingTitles} />
            </div>

            <p className="text-slate-300 leading-relaxed text-sm max-w-lg font-sans">
              {pageBio} I specialize in constructing statistical models, fine-tuning neural arrays, and engineering high-fidelity rapid low-code prototypes that solve concrete real-world civic challenges.
            </p>

            {/* Premium Buttons Gateway with Glow and Gradients */}
            <div className="flex flex-wrap gap-4 pt-2">
              {privacySettings.showResume && (
                <a
                  href={localStorage.getItem("cv_file") || "#resume"}
                  target={localStorage.getItem("cv_file") ? "_blank" : "_self"}
                  rel="noreferrer"
                  onClick={(e) => {
                    const hasCV = localStorage.getItem("cv_file");
                    if (!hasCV) {
                      e.preventDefault();
                      onSectionChange("resume");
                      smoothScrollTo("#resume", 850);
                    }
                  }}
                  className="relative group overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] via-[#22D3EE] to-[#7C3AED] text-white font-extrabold uppercase tracking-widest text-xs transition-all hover:shadow-[0_0_25px_rgba(34,211,238,0.45)] flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  <Download className="w-4 h-4" /> Download CV
                </a>
              )}
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  onSectionChange("projects");
                  smoothScrollTo("#projects", 850);
                }}
                className="px-6 py-3 bg-[#0B1026]/80 hover:bg-[#0B1026] text-white font-extrabold uppercase tracking-widest text-xs rounded-xl hover:text-cyan-400 transition-all border border-cyan-500/20 hover:border-cyan-500/50 shadow-md cursor-pointer"
              >
                View Projects
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  onSectionChange("contact");
                  smoothScrollTo("#contact", 850);
                }}
                className="px-5 py-3 text-slate-300 hover:text-cyan-300 font-extrabold uppercase tracking-widest text-[10px] flex items-center gap-1.5 transition-all cursor-pointer group"
              >
                Contact Me <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Quick Stats Grid with Custom Micro-panels - Premium Glassmorphism */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 max-w-lg">
              <div className="p-4 bg-[#0B1026]/45 backdrop-blur-[24px] border border-white/10 rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:border-[#22D3EE]/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <h4 className="text-2xl sm:text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#22D3EE]">8+</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Live Sites Live</p>
              </div>
              <div className="p-4 bg-[#0B1026]/45 backdrop-blur-[24px] border border-white/10 rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:border-[#22D3EE]/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <h4 className="text-2xl sm:text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#7C3AED]">6+</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Badges Earned</p>
              </div>
              <div className="p-4 bg-[#0B1026]/45 backdrop-blur-[24px] border border-white/10 rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:border-[#22D3EE]/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <h4 className="text-2xl sm:text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#3B82F6]">RUPP</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Data Scholar</p>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Circle photo and AIIllustration side-by-side with interactive premium glow */}
          <div className="flex-[1.2] w-full flex flex-col md:flex-row items-center justify-center gap-6 xl:gap-8 relative min-w-[300px]">
            {/* The circular profile photo frame */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none group shrink-0">
              
              {/* Glowing halo behind profile */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#3B82F6] via-[#7C3AED] to-[#22D3EE] opacity-60 blur-xl group-hover:opacity-85 transition-opacity duration-500 animate-pulse" />

              {/* Outer Rotating dashes tech-ring */}
              <div className="absolute inset-0 border-2 border-dashed border-[#22D3EE]/30 rounded-full animate-[spin_45s_linear_infinite]" />
              {/* Inner Reverse Rotating glow-ring */}
              <div className="absolute inset-4 border border-[#7C3AED]/20 rounded-full animate-[spin_25s_linear_infinite_reverse]" />
              
              {/* Circular border pulse wrapper */}
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#3B82F6] via-[#22D3EE] to-[#7C3AED] p-[2.5px] shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                <div className="w-full h-full rounded-full bg-[#050816] p-1.5 overflow-hidden relative">
                  
                  {/* Portrait headshot container */}
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={pageName}
                      loading="lazy"
                      width={256}
                      height={256}
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* Elegant default SVG graphic avatar with formal suite */
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center text-center p-6 relative rounded-full">
                      <div className="space-y-2">
                        <Terminal className="w-10 h-10 text-[#22D3EE] mx-auto animate-pulse" />
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Upload Portrait</h4>
                        <p className="text-[8px] text-slate-400 leading-normal">Select image file in the local Admin Panel to view headshot live.</p>
                      </div>
                    </div>
                  )}

                  {/* Soft Blue shadow and lighting overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/35 via-transparent to-transparent pointer-events-none rounded-full" />
                </div>
              </div>
            </div>

            {/* Premium Interactive AI Illustration */}
            <div className="w-full max-w-[280px] sm:max-w-[300px] shrink-0 self-center">
              <AIIllustration />
            </div>

            {/* Scroll Indicator badge */}
            <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-400 animate-bounce">
              <ArrowDownCircle className="w-4 h-4 text-[#22D3EE]" />
              <span>Scroll to Explore</span>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION 2: ABOUT / BIO */}
        {/* ========================================================== */}
        <section id="about" className="scroll-reveal space-y-8 scroll-mt-20">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#22D3EE] font-mono">Biography Overview</h3>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">Academics & Personal Philosophy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Biography details card - Premium Glassmorphism */}
            <div className="md:col-span-7 bg-[#0B1026]/45 backdrop-blur-[24px] border border-white/10 rounded-[22px] p-6 md:p-8 space-y-4 flex flex-col justify-between shadow-2xl shadow-blue-950/10 transition-all duration-300 hover:border-[#22D3EE]/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
                <p>
                  As an undergraduate student at the Royal University of Phnom Penh (RUPP), I bridge the gap between academic theory and technical implementation. I have developed a strong passion for data engineering, pipeline design, and machine learning models.
                </p>
                <p>
                  During my journey, I discovered that prompt engineering and low-code workflows represent a monumental leap forward. By using AI as an advanced developer companion, I have completed and deployed eight functional web portals in record time.
                </p>
              </div>

              {/* Education list details */}
              <div className="pt-6 border-t border-white/10 space-y-3 text-xs text-slate-400">
                <div className="flex gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Royal University of Phnom Penh</h4>
                    <p className="text-[11px] text-[#22D3EE] font-semibold mt-0.5">Bachelor of Science in Data Science (2024 - Present)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Robot Canvas Stage - Premium Glassmorphism */}
            <div className="md:col-span-5 flex flex-col items-center justify-between">
              <div className="w-full h-full bg-[#0B1026]/45 backdrop-blur-[24px] border border-white/10 rounded-[22px] p-4 flex flex-col items-center justify-center relative min-h-[300px] shadow-2xl shadow-blue-950/10 transition-all duration-300 hover:border-[#22D3EE]/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                {children}
                
                {/* Visual assistant response bubble */}
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#050816]/85 border border-[#22D3EE]/25 backdrop-blur-md rounded-xl shadow-lg shadow-blue-950/40">
                  <p className="text-[10px] text-slate-300 text-center font-mono italic leading-relaxed">
                    {activeSection === "hero" && "Hello! Hover over any panel to trigger active visual pointers."}
                    {activeSection === "about" && "Studying hard at RUPP. Let's analyze local datasets!"}
                    {activeSection === "achievements" && "Tracking performance metrics and system deployment stats live."}
                    {activeSection === "projects" && "These are live websites! Launch any to test functionality."}
                    {activeSection === "hackathons" && "Completed First's Wave Prompting Hackathon in July 2026."}
                    {activeSection === "certificates" && "Official credentials validated by Cisco and Paragon."}
                    {activeSection === "gallery" && "Take a look at photos from hackathons and classes."}
                    {activeSection === "resume" && "Print or download PDF of my complete CV."}
                    {activeSection === "contact" && "Need a custom AI pipeline built? Schedule a meeting!"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION 2.5: ACHIEVEMENTS ANALYTICS DASHBOARD */}
        {/* ========================================================== */}
        <div className="scroll-reveal">
          <AchievementsDashboard
            projects={projectsList}
            certificates={certificatesList}
            hackathons={hackathonsList}
            awards={awardsList}
          />
        </div>

        {/* ========================================================== */}
        {/* SECTION 2.8: TECHNICAL ARCHITECTURE & STACK */}
        {/* ========================================================== */}
        <div className="scroll-reveal">
          <TechStack />
        </div>

        {/* ========================================================== */}
        {/* SECTION 3: FEATURED PROJECTS */}
        {/* ========================================================== */}
        <section id="projects" className="scroll-reveal space-y-8 scroll-mt-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#22D3EE] font-mono">Interactive Showcase</h3>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">Featured Projects</h2>
            </div>
            <span className="text-[10px] font-mono text-[#22D3EE] bg-[#0B1026]/60 border border-cyan-500/20 px-3.5 py-1.5 rounded-full uppercase font-bold shadow-inner">
              {projectsList.length} PROJECTS BUILT
            </span>
          </div>

          {/* Grid Layout containing bento project tiles - Premium Glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsList.map((project) => (
              <div
                key={project.id}
                className={`p-5 bg-[#0B1026]/45 border border-white/10 rounded-[22px] space-y-4 flex flex-col justify-between hover:-translate-y-1.5 hover:border-[#22D3EE]/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] transition-all duration-300 shadow-xl shadow-blue-950/10 backdrop-blur-[24px] ${project.gradient}`}
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono uppercase bg-blue-500/10 text-[#22D3EE] border border-[#3B82F6]/25 px-2.5 py-0.5 rounded font-bold">
                      {project.category}
                    </span>
                    <span className={`text-[9px] font-mono uppercase font-bold ${
                      project.status === "Featured" ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-md font-bold text-white font-display flex items-center justify-between">
                      {project.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Skills tags list */}
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-[9px] font-mono px-2 py-0.5 bg-[#050816]/60 text-slate-300 border border-white/5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex gap-2.5">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-1 py-2 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-slate-200 text-center font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all cursor-pointer"
                  >
                    Details
                  </button>
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white text-center font-bold uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 hover:shadow-[0_0_15px_rgba(124,58,237,0.35)] shadow-md cursor-pointer"
                  >
                    Launch <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================== */}
        {/* SECTION 4: HACKATHON FOCUS PANEL */}
        {/* ========================================================== */}
        {privacySettings.showHackathons && (
          <section id="hackathons" className="scroll-reveal space-y-8 scroll-mt-20">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">Hackathons & Competitions</h3>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">First's Wave Prompting 2026</h2>
            </div>

            {hackathonsList.map((hack) => (
              <div key={hack.id} className="bg-[#0B1026]/45 backdrop-blur-[24px] border border-white/10 rounded-[22px] p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-[#22D3EE]/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                {/* Outer decorative ambient glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Side: General Overview Terminal */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold font-display text-white">{hack.eventName}</h3>
                        <p className="text-xs text-slate-400 font-mono">{hack.date} • Role: <strong className="text-indigo-400 uppercase font-sans font-bold">{hack.role}</strong></p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {hack.description}
                    </p>

                    {/* AI Tools Checklist */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">AI Platforms & Developer Tooling</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {hack.tools.map((tool) => (
                          <span key={tool} className="px-2.5 py-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/10 border border-cyan-500/20 rounded font-semibold">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skills lists */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Demonstrated Engineering Capabilities</h4>
                      <div className="flex flex-wrap gap-1">
                        {hack.skills.map((skill) => (
                          <span key={skill} className="px-2.5 py-0.5 text-[9px] text-indigo-300 bg-indigo-950/20 border border-indigo-500/10 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Key Achievements and Slide Screenshots */}
                  <div className="lg:col-span-4 space-y-6 bg-white/5 backdrop-blur-[12px] border border-white/10 rounded-[20px] p-5">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>Hackathon Achievements</span>
                      </h4>
                      <div className="space-y-2 text-[11px] text-slate-300">
                        {hack.achievements.map((ach, i) => (
                          <div key={i} className="flex gap-2 items-start">
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{ach}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Presentation slide preview mockup */}
                    {hack.gallery && hack.gallery.length > 0 && (
                      <div className="pt-4 border-t border-white/5 space-y-2.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Interactive Team Showcase</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {hack.gallery.slice(0, 4).map((gal, idx) => (
                            <div
                              key={idx}
                              onClick={() => setLightboxImage(gal.image)}
                              className="group relative aspect-video bg-slate-900 border border-white/10 rounded-lg overflow-hidden cursor-pointer"
                            >
                              <img
                                src={gal.image}
                                alt={gal.title}
                                loading="lazy"
                                width={320}
                                height={180}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-[8px] text-white text-center">
                                {gal.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </section>
        )}

        {/* ========================================================== */}
        {/* SECTION 5: CERTIFICATIONS GALLERY */}
        {/* ========================================================== */}
        {privacySettings.showCertificates ? (
          <section id="certificates" className="scroll-reveal space-y-8 scroll-mt-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">Academic Credentials</h3>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Cisco & Paragon Certifications</h2>
              </div>

              {/* Keyword Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search certification name..."
                    value={certSearch}
                    onChange={(e) => setCertSearch(e.target.value)}
                    className="w-full bg-[#0B1026]/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#22D3EE]/50 transition-all focus:ring-1 focus:ring-[#22D3EE]/20"
                  />
                </div>

                <select
                  value={certFilter}
                  onChange={(e) => setCertFilter(e.target.value)}
                  className="bg-[#0B1026]/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#22D3EE]/50 transition-all focus:ring-1 focus:ring-[#22D3EE]/20 [&>option]:bg-[#0B1026]"
                >
                  <option value="All">All Categories</option>
                  <option value="AI">AI</option>
                  <option value="Python">Python</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Programming">Programming</option>
                  <option value="Hackathons">Hackathons</option>
                </select>
              </div>
            </div>

            {/* Grid list of certifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-5 bg-[#0B1026]/45 border border-white/10 rounded-[22px] flex flex-col justify-between hover:-translate-y-1.5 hover:border-[#22D3EE]/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] transition-all duration-300 group shadow-xl shadow-blue-950/10 backdrop-blur-[24px]"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-[#3B82F6]/25 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-mono uppercase bg-blue-500/10 text-[#22D3EE] rounded-full border border-[#22D3EE]/25">
                        {cert.category}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-white leading-snug font-display">{cert.title}</h4>
                      <p className="text-xs text-[#22D3EE] font-semibold">{cert.issuer}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{cert.date}</p>
                      <p className="text-xs text-slate-300 leading-normal line-clamp-2">{cert.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10">
                    <button
                      onClick={() => setSelectedCertificate(cert)}
                      className="w-full py-2 bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white hover:shadow-[0_0_12px_rgba(124,58,237,0.3)] font-bold uppercase tracking-widest text-[9px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Certificate
                    </button>
                  </div>
                </div>
              ))}

              {filteredCertificates.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <Info className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">No certification records match your active query.</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section id="certificates" className="scroll-reveal space-y-8 scroll-mt-20">
            <div className="space-y-1 border-b border-white/5 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">Academic Credentials</h3>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Cisco & Paragon Certifications</h2>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center space-y-3">
              <EyeOff className="w-8 h-8 text-blue-400 mx-auto animate-pulse" />
              <h4 className="text-sm font-bold text-white">Credentials Access Restricted</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-normal font-sans">
                Academic and professional certifications have been set to administrative private lock. Please submit a request via the contact portal below to retrieve verified copies of my educational certificates.
              </p>
            </div>
          </section>
        )}

        {/* ========================================================== */}
        {/* SECTION 6: AWARDS & HONORS */}
        {/* ========================================================== */}
        {privacySettings.showAwards && (
          <section id="awards" className="scroll-reveal space-y-8 scroll-mt-20">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">Honorable Recognition</h3>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Awards & Academic Excellence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {awardsList.map((award) => (
                <div
                  key={award.id}
                  className="p-6 bg-gradient-to-br from-[#0B1026]/40 to-[#050816]/35 backdrop-blur-md border border-white/10 hover:border-yellow-500/35 rounded-2xl flex gap-4 items-start relative overflow-hidden transition-all duration-300 shadow-xl shadow-blue-950/10 group"
                >
                  {/* Gold glowing lighting effects */}
                  {award.goldEffect && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}

                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
                    <Trophy className="w-6 h-6 animate-pulse" />
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-yellow-500 uppercase font-bold tracking-wider">{award.organization} • {award.year}</span>
                      <h3 className="text-md font-bold text-white font-display">{award.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{award.description}</p>
                    
                    {award.stats && award.stats.length > 0 && (
                      <div className="flex gap-4 pt-1 text-[10px]">
                        {award.stats.map((st) => (
                          <span key={st.label} className="text-slate-500 font-semibold uppercase tracking-wider">
                            {st.label}: <strong className="text-white">{st.value}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================== */}
        {/* SECTION 7: TIMELINE / WORK HISTORY */}
        {/* ========================================================== */}
        {privacySettings.showWorkHistory && (
          <section id="timeline" className="scroll-reveal space-y-8 scroll-mt-20">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">Professional Milestones</h3>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Interactive Career Roadmap</h2>
            </div>

            <div className="relative pl-6 border-l border-white/10 space-y-12 max-w-4xl mx-auto py-4">
              {timelineList.map((time) => (
                <div key={time.id} className="relative group">
                  {/* Interactive point indicators */}
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#050816] border-2 border-[#22D3EE] group-hover:border-[#7C3AED] group-hover:scale-110 transition-all shadow-md shadow-[#22D3EE]/30" />
                  
                  <div className="p-5 bg-[#0B1026]/40 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-[#0B1026]/60 hover:border-[#22D3EE]/30 transition-all duration-300 space-y-3 max-w-2xl relative shadow-xl shadow-blue-950/10">
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <span className="text-[9px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded font-bold">
                        {time.date}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        {time.type}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-md font-bold text-white font-display">{time.position}</h4>
                      <p className="text-xs text-blue-400 font-semibold">{time.company}</p>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{time.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================== */}
        {/* SECTION 8: GALLERY LIGHTBOX */}
        {/* ========================================================== */}
        {privacySettings.showGallery && (
          <section id="gallery" className="scroll-reveal space-y-8 scroll-mt-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">Visual Archives</h3>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Event & Workshop Logs</h2>
              </div>

              {/* Gallery Navigation Toggles */}
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                {["All", "Competition", "Workshop", "Event", "Project", "Professional"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalleryFilter(cat)}
                    className={`px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                      galleryFilter === cat
                        ? "bg-gradient-to-r from-[#3B82F6] to-[#7C3AED] text-white border-transparent shadow-lg shadow-blue-500/10"
                        : "bg-[#0B1026]/40 border-white/10 text-slate-400 hover:text-white hover:bg-[#0B1026]/60"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setLightboxImage(item.image)}
                  className="group relative aspect-square bg-slate-900 border border-white/10 rounded-xl overflow-hidden cursor-pointer shadow-xl hover:scale-[1.01] hover:border-[#22D3EE]/30 transition-all duration-300"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 space-y-1">
                    <span className="px-2 py-0.5 text-[8px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 rounded-full w-fit font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-white font-display truncate">{item.title}</h4>
                    <p className="text-[9px] text-slate-400 leading-snug line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================== */}
        {/* SECTION 9: RESUME DASHBOARD VIEW */}
        {/* ========================================================== */}
        {privacySettings.showResume && (
          <section id="resume" className="scroll-reveal space-y-8 scroll-mt-20">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">Curriculum Vitae</h3>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Official Interactive Resume</h2>
            </div>

            <ResumeView
              projects={projectsList}
              certificates={certificatesList}
              awards={awardsList}
              hackathons={hackathonsList}
              timeline={timelineList}
              resumeInfo={sampleResumeInfo}
            />
          </section>
        )}

        {/* ========================================================== */}
        {/* SECTION 10: IMPROVED CONTACT & SCHEDULER */}
        {/* ========================================================== */}
        <section id="contact" className="scroll-reveal space-y-8 scroll-mt-20">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 font-mono">Direct Communication</h3>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Let's Establish Connection</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Contact Form card (7 cols) */}
            <div className="lg:col-span-7 bg-[#0B1026]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-2xl relative shadow-blue-950/25">
              {formState === "success" ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white font-display">Message Transmitted</h3>
                    <p className="text-xs text-slate-400">Thank you! Your collaboration parameters have been forwarded to Bunlux.</p>
                  </div>
                  <button
                    onClick={() => setFormState("idle")}
                    className="px-5 py-2.5 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-blue-100 transition-colors cursor-pointer shadow-lg"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-[#22D3EE] tracking-wider">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full bg-[#050816] border border-white/10 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/20 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-[#22D3EE] tracking-wider">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full bg-[#050816] border border-white/10 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/20 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#22D3EE] tracking-wider">Topic of Discussion</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Project Collaboration, Technical Consultation, or Interview"
                      className="w-full bg-[#050816] border border-white/10 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/20 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-[#22D3EE] tracking-wider">Detailed Message Parameters</label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Hi Bunlux, I checked out your RUPP portfolio and First's Wave hackathon details..."
                      className="w-full bg-[#050816] border border-white/10 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/20 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    className="w-full py-3.5 bg-gradient-to-r from-[#3B82F6] via-[#22D3EE] to-[#7C3AED] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] text-white font-extrabold uppercase tracking-widest text-[10px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    {formState === "submitting" ? "Transmitting..." : "Send Message"}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Direct Information, map, and meeting booking panel (5 cols) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              
              {/* Direct Info list */}
              <div className="p-6 bg-[#0B1026]/40 backdrop-blur-md border border-white/10 rounded-2xl space-y-4 shadow-xl shadow-blue-950/10">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Direct Directory</h4>
                <div className="space-y-4 text-xs text-slate-300 font-sans">
                  {privacySettings.showEmail && (
                    <div className="flex gap-3">
                      <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <h5 className="font-bold text-white">Email Gateway</h5>
                        <p className="text-slate-400 select-all">
                          <a href="mailto:ngounbunlux52@gmail.com" className="hover:text-blue-400 transition-colors">ngounbunlux52@gmail.com</a>
                        </p>
                      </div>
                    </div>
                  )}
                  {privacySettings.showPhone && (
                    <div className="flex gap-3">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <h5 className="font-bold text-white">Secure Hotline</h5>
                        <p className="text-slate-400 select-all">
                          <a href="tel:061265383" className="hover:text-emerald-400 transition-colors">061 265 383</a>
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <h5 className="font-bold text-white">Base of Operations</h5>
                      <p className="text-slate-400">Phnom Penh, Cambodia</p>
                    </div>
                  </div>
                  {privacySettings.showLinkedIn && (
                    <div className="flex gap-3">
                      <Linkedin className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <h5 className="font-bold text-white">LinkedIn Network</h5>
                        <a href="https://www.linkedin.com/in/ngoun-bunlux-875b39418" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                          Ngoun Bunlux Profile
                        </a>
                      </div>
                    </div>
                  )}
                  {privacySettings.showGitHub && (
                    <div className="flex gap-3">
                      <Github className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <h5 className="font-bold text-white">GitHub Profile</h5>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                          @bunlux-developer
                        </a>
                      </div>
                    </div>
                  )}
                  {privacySettings.showFacebook && (
                    <div className="flex gap-3">
                      <Facebook className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <h5 className="font-bold text-white">Facebook Identity</h5>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                          Ngoun Bunlux
                        </a>
                      </div>
                    </div>
                  )}
                  {privacySettings.showTelegram && (
                    <div className="flex gap-3">
                      <Send className="w-4 h-4 text-sky-400 shrink-0 rotate-[-15deg]" />
                      <div>
                        <h5 className="font-bold text-white">Telegram Channel</h5>
                        <a href="https://t.me" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                          @bunlux_ai
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking slot scheduling launcher */}
              <div className="p-6 bg-[#020617] border border-blue-500/20 rounded-2xl space-y-3.5 shadow-lg text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Active Recruiter Scheduler</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Skip email ping-pong. Pick a pre-validated video slot directly inside my calendar.</p>
                </div>
                <button
                  onClick={() => setIsScheduleOpen(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold uppercase tracking-widest text-[9px] rounded-lg transition-all shadow-md cursor-pointer"
                >
                  Book Interview Slot
                </button>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full mt-32 border-t border-white/5 bg-[#020617] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-500 text-[10px] font-mono">
          <p>© {new Date().getFullYear()} NGOUN BUNLUX.</p>
          <div className="flex gap-4">
            {privacySettings.showGitHub && (
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            )}
            {privacySettings.showGitHub && privacySettings.showLinkedIn && (
              <span>•</span>
            )}
            {privacySettings.showLinkedIn && (
              <a href="https://www.linkedin.com/in/ngoun-bunlux-875b39418" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            )}
          </div>
        </div>
      </footer>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-zoom-out animate-fade-in"
        >
          <img src={lightboxImage} alt="Fullscreen View" className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl" />
        </div>
      )}

      {/* PROJECT DETAILS MODAL */}
      <ProjectDetailsModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* CERTIFICATE DETAILS MODAL */}
      <CertificateViewerModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />

      {/* INTERACTIVE REC_SCHEDULER MODAL */}
      {isScheduleOpen && (
        <ScheduleModal
          onClose={() => setIsScheduleOpen(false)}
        />
      )}

      {/* SECURE DASHBOARD COMPONENT */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminDashboard
            onClose={() => setIsAdminOpen(false)}
            onRefresh={refreshPortfolioData}
            projects={projectsList}
            certificates={certificatesList}
            awards={awardsList}
            hackathons={hackathonsList}
            timeline={timelineList}
            gallery={galleryList}
          />
        )}
      </AnimatePresence>

      {/* SMOOTH BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => {
              onSectionChange("hero");
              smoothScrollTo("#hero", 850);
            }}
            className="fixed bottom-6 right-6 z-40 p-3 bg-blue-600/90 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 cursor-pointer border border-blue-400/20 backdrop-blur-md flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
