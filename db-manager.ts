import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_PRIVACY_SETTINGS } from "./src/utils/security";
import { ProjectData, CertificateData, AwardData, HackathonData, ExperienceData, GalleryItem, MockFile, PrivacySettings } from "./src/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Initialize Supabase Client if credentials are provided
let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    });
    console.log("[Supabase] Client initialized successfully.");
    
    // Auto-create portfolio-assets storage bucket if it doesn't exist
    supabase.storage.createBucket("portfolio-assets", {
      public: true
    }).then(({ error }) => {
      if (error) {
        console.log("[Supabase] Storage bucket 'portfolio-assets' check/creation:", error.message);
      } else {
        console.log("[Supabase] Storage bucket 'portfolio-assets' created successfully.");
      }
    }).catch(err => {
      console.warn("[Supabase] Storage bucket creation error:", err);
    });
  } catch (err) {
    console.error("[Supabase] Client failed to initialize:", err);
  }
} else {
  console.log("[Supabase] Missing SUPABASE_URL and SUPABASE_ANON_KEY. Operating in Local Offline-First Mode.");
}

export function isSupabaseActive(): boolean {
  return !!supabase;
}

export interface PortfolioDb {
  profile: {
    name: string;
    title: string;
    bio: string;
    photo: string;
    cvUrl: string;
  };
  projects: ProjectData[];
  certificates: CertificateData[];
  awards: AwardData[];
  hackathons: HackathonData[];
  timeline: ExperienceData[];
  gallery: GalleryItem[];
  files: MockFile[];
  privacy: PrivacySettings;
}

// Default initial data to populate db.json on first run
const DEFAULT_PORTFOLIO_DB: PortfolioDb = {
  profile: {
    name: "Ngoun Bunlux",
    title: "Data Science Student & AI Engineer",
    bio: "Passionate student at Royal University of Phnom Penh focusing on Machine Learning and Generative AI application design.",
    photo: "",
    cvUrl: ""
  },
  projects: [
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
  ],
  certificates: [
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
  ],
  awards: [
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
  ],
  hackathons: [
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
  ],
  timeline: [
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
      achievements: ["Successfully completed 8 production-grade applications", "Published repositories open for community collaboration"],
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
  ],
  gallery: [
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
  ],
  files: [
    {
      id: "file-1",
      name: "professional_headshot_2026.png",
      size: 1048576,
      type: "image/png",
      category: "photo",
      uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      dataUrl: "/uploads/professional_headshot_2026.png"
    },
    {
      id: "file-2",
      name: "cisco_ai_fundamentals_certificate.png",
      size: 512000,
      type: "image/png",
      category: "certificate",
      uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      dataUrl: "/uploads/cisco_ai_fundamentals_certificate.png"
    },
    {
      id: "file-3",
      name: "curriculum_vitae_official.pdf",
      size: 786432,
      type: "application/pdf",
      category: "cv",
      uploadedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      dataUrl: "/uploads/curriculum_vitae_official.pdf"
    }
  ],
  privacy: DEFAULT_PRIVACY_SETTINGS
};

// Initialize directory paths
export function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
    fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
  }

  // Create default dummy mock files if they don't exist yet to make standard visuals look complete
  const placeholderImages = {
    "professional_headshot_2026.png": "photo",
    "cisco_ai_fundamentals_certificate.png": "certificate"
  };

  for (const [fName, cat] of Object.entries(placeholderImages)) {
    const fPath = path.join(PUBLIC_UPLOADS_DIR, fName);
    if (!fs.existsSync(fPath)) {
      // Just write a tiny placeholder 1x1 png file to ensure they load without breaking
      const pixel1x1 = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
      fs.writeFileSync(fPath, pixel1x1);
    }
  }

  const cvPath = path.join(PUBLIC_UPLOADS_DIR, "curriculum_vitae_official.pdf");
  if (!fs.existsSync(cvPath)) {
    // Write a tiny simple PDF or text file
    fs.writeFileSync(cvPath, "%PDF-1.4 ... Simulated CV PDF ...");
  }

  // Verify or create the db.json file
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_PORTFOLIO_DB, null, 2), "utf8");
    console.log("[CMS] Initialized portfolio database with premium local-first defaults.");
  } else {
    try {
      // Validate contents
      const data = fs.readFileSync(DB_FILE, "utf8");
      JSON.parse(data);
    } catch (e) {
      console.error("[CMS] Corrupted database found. Overwriting with clean defaults.");
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_PORTFOLIO_DB, null, 2), "utf8");
    }
  }
}

// Fetch database
export async function getPortfolioData(): Promise<PortfolioDb> {
  initDb();
  
  if (supabase) {
    try {
      console.log("[Supabase] Fetching portfolio state...");
      const { data: stateData, error: stateError } = await supabase
        .from("portfolio_state")
        .select("data")
        .eq("id", 1)
        .single();
        
      console.log("[Supabase] Fetching uploaded files catalog...");
      const { data: filesData, error: filesError } = await supabase
        .from("portfolio_files")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (stateError && stateError.code !== "PGRST116") {
        console.warn("[Supabase] Error loading portfolio state, falling back to local:", stateError.message);
      } else {
        let dbState: PortfolioDb;
        if (!stateData) {
          console.log("[Supabase] No state found. Seeding default portfolio state...");
          dbState = { ...DEFAULT_PORTFOLIO_DB };
          const { error: seedError } = await supabase
            .from("portfolio_state")
            .upsert({ id: 1, data: dbState });
          if (seedError) {
            console.error("[Supabase] Failed to seed default state:", seedError.message);
          }
        } else {
          dbState = stateData.data as PortfolioDb;
        }

        // Sync file entries from portfolio_files table
        if (!filesError && filesData) {
          dbState.files = filesData.map(f => ({
            id: f.id,
            name: f.name,
            size: f.size || 0,
            type: f.type || "application/octet-stream",
            category: f.category || "other",
            uploadedAt: f.uploaded_at,
            dataUrl: f.data_url,
            description: f.description || ""
          }));
        } else if (filesError) {
          console.warn("[Supabase] Error loading files catalog from table:", filesError.message);
        }

        // Cache state locally in db.json
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf8");
        } catch (e) {}

        return dbState;
      }
    } catch (err: any) {
      console.error("[Supabase] Error in getPortfolioData, using local fallback:", err);
    }
  }

  // Local Fallback
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("[CMS] Failed reading db.json, returning memory defaults.", err);
    return DEFAULT_PORTFOLIO_DB;
  }
}

// Save database
export async function savePortfolioData(data: Partial<PortfolioDb>): Promise<PortfolioDb> {
  initDb();
  
  const current = await getPortfolioData();
  const updated = {
    ...current,
    ...data,
    profile: { ...current.profile, ...data.profile },
    privacy: { ...current.privacy, ...data.privacy }
  };

  // Sync to local json cache
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), "utf8");
  } catch (err) {
    console.error("[CMS] Failed writing to db.json", err);
  }

  if (supabase) {
    try {
      console.log("[Supabase] Saving portfolio state...");
      const stateToSave = { ...updated };
      const { error } = await supabase
        .from("portfolio_state")
        .upsert({ id: 1, data: stateToSave });
      if (error) {
        console.error("[Supabase] Error saving portfolio state:", error.message);
        throw new Error(`Supabase Database upsert failed: ${error.message}`);
      } else {
        console.log("[Supabase] Portfolio state saved successfully.");
      }
    } catch (err: any) {
      console.error("[Supabase] Failed to save portfolio state:", err);
      throw new Error(err.message || err);
    }
  }

  return updated;
}

// Helper to write a base64 file to uploads
export async function saveUploadedFile(
  fileName: string,
  mimeType: string,
  base64DataUrl: string,
  category: "photo" | "certificate" | "cv" | "other",
  replaceExistingName?: string
): Promise<MockFile> {
  initDb();

  let base64String = base64DataUrl;
  if (base64DataUrl.includes(";base64,")) {
    base64String = base64DataUrl.split(";base64,")[1];
  }

  const buffer = Buffer.from(base64String, "base64");

  const parsed = path.parse(fileName);
  const cleanBase = parsed.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const ext = parsed.ext.toLowerCase();
  
  let finalName = replaceExistingName ? replaceExistingName : `${Date.now()}_${cleanBase}${ext}`;
  finalName = path.basename(finalName);

  let relativeUrl = `/uploads/${finalName}`;
  const fileId = replaceExistingName 
    ? (((await getPortfolioData()).files.find(f => f.name === replaceExistingName)?.id) || `file-${Date.now()}`)
    : `file-${Date.now()}`;

  // Local physical asset sync
  try {
    const targetPath = path.join(PUBLIC_UPLOADS_DIR, finalName);
    fs.writeFileSync(targetPath, buffer);

    const distDir = path.join(process.cwd(), "dist", "uploads");
    if (fs.existsSync(path.join(process.cwd(), "dist"))) {
      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, finalName), buffer);
    }
  } catch (err) {
    console.warn("[CMS] Local file write warning:", err);
  }

  if (supabase) {
    try {
      console.log(`[Supabase] Uploading '${finalName}' to 'portfolio-assets' bucket...`);
      const { data: storageData, error: storageError } = await supabase.storage
        .from("portfolio-assets")
        .upload(finalName, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (storageError) {
        console.error("[Supabase] Storage upload failed:", storageError.message);
        throw new Error(`Supabase Storage upload failed: ${storageError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("portfolio-assets")
        .getPublicUrl(finalName);

      if (urlData?.publicUrl) {
        relativeUrl = urlData.publicUrl;
        console.log(`[Supabase] Public asset URL: ${relativeUrl}`);
      }

      console.log("[Supabase] Saving metadata to 'portfolio_files' table...");
      const { error: dbError } = await supabase
        .from("portfolio_files")
        .upsert({
          id: fileId,
          name: finalName,
          data_url: relativeUrl,
          size: buffer.length,
          type: mimeType,
          category: category,
          uploaded_at: new Date().toISOString(),
          description: ""
        });

      if (dbError) {
        console.error("[Supabase] Failed to write to 'portfolio_files' table:", dbError.message);
      } else {
        console.log("[Supabase] File metadata saved successfully.");
      }
    } catch (err: any) {
      console.error("[Supabase] Upload workflow failed, falling back to local sync:", err);
      throw err;
    }
  }

  const newFile: MockFile = {
    id: fileId,
    name: finalName,
    size: buffer.length,
    type: mimeType,
    category,
    uploadedAt: new Date().toISOString(),
    dataUrl: relativeUrl,
    description: ""
  };

  const db = await getPortfolioData();
  let updatedFiles = [...db.files];
  const existingIdx = updatedFiles.findIndex(f => f.id === fileId);
  if (existingIdx > -1) {
    updatedFiles[existingIdx] = newFile;
  } else {
    updatedFiles.unshift(newFile);
  }

  let updatedProfile = { ...db.profile };
  if (category === "photo" && !replaceExistingName && fileName.toLowerCase().includes("headshot")) {
    updatedProfile.photo = relativeUrl;
  } else if (category === "cv") {
    updatedProfile.cvUrl = relativeUrl;
  }

  await savePortfolioData({ files: updatedFiles, profile: updatedProfile });

  return newFile;
}

// Delete file
export async function deleteUploadedFile(fileId: string): Promise<boolean> {
  initDb();
  const db = await getPortfolioData();
  const file = db.files.find(f => f.id === fileId);
  if (!file) return false;

  const fileName = path.basename(file.name);

  // Local purge
  try {
    const targetPath = path.join(PUBLIC_UPLOADS_DIR, fileName);
    const distPath = path.join(process.cwd(), "dist", "uploads", fileName);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    if (fs.existsSync(distPath)) {
      fs.unlinkSync(distPath);
    }
  } catch (err) {
    console.warn(`[CMS] Could not remove physical file ${fileName} from disk:`, err);
  }

  if (supabase) {
    try {
      console.log(`[Supabase] Deleting '${fileName}' from 'portfolio-assets' bucket...`);
      const { error: storageError } = await supabase.storage
        .from("portfolio-assets")
        .remove([fileName]);

      if (storageError) {
        console.warn("[Supabase] Storage deletion notice:", storageError.message);
      }

      console.log(`[Supabase] Removing metadata from 'portfolio_files' table...`);
      const { error: dbError } = await supabase
        .from("portfolio_files")
        .delete()
        .eq("id", fileId);

      if (dbError) {
        console.warn("[Supabase] Metadata deletion notice:", dbError.message);
      }
    } catch (err: any) {
      console.error("[Supabase] Deletion workflow exception:", err);
    }
  }

  const updatedFiles = db.files.filter(f => f.id !== fileId);
  await savePortfolioData({ files: updatedFiles });
  return true;
}

