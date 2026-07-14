export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export type SectionType =
  | "hero"
  | "about"
  | "skills"
  | "achievements"
  | "projects"
  | "hackathons"
  | "experience"
  | "certificates"
  | "awards"
  | "gallery"
  | "resume"
  | "contact";

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  features: string[];
  technologies: string[];
  challenges: string;
  solutions: string;
  futureImprovements: string[];
  image: string; // Base64 or URL
  gradient: string;
  tags: string[];
  category: string;
  status: "Completed" | "In Progress" | "Featured";
  demoUrl: string;
  githubUrl: string;
  stats?: { label: string; value: string }[];
}

export interface CertificateData {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: "AI" | "Python" | "Data Science" | "Machine Learning" | "Programming" | "Hackathons" | "Leadership" | "Soft Skills";
  credentialId?: string;
  credentialUrl?: string;
  image?: string; // Base64 or placeholder
  description: string;
}

export interface AwardData {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  iconName: string; // "Trophy", "Award", "Medal", "Star"
  image?: string; // Base64 or URL
  goldEffect?: boolean;
  stats?: { label: string; value: string }[];
}

export interface HackathonData {
  id: string;
  eventName: string;
  date: string;
  category: string;
  role: string;
  description: string;
  tools: string[];
  skills: string[];
  highlights: string[];
  achievements: string[];
  gallery: { title: string; image: string }[]; // Base64 or placeholder
  certificate?: {
    title: string;
    image: string;
    credentialId?: string;
  };
}

export interface ExperienceData {
  id: string;
  date: string;
  position: string;
  company: string;
  description: string;
  achievements: string[];
  type: "Student" | "Personal Projects" | "Freelance Development" | "Hackathon Participant" | "Research" | "Future Career Goal";
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "Competition" | "Certificate" | "Workshop" | "Event" | "Project" | "Professional";
  image: string; // Base64 or URL
  description: string;
}

export interface AchievementStats {
  projectsCompleted: number;
  certificatesEarned: number;
  competitionsJoined: number;
  awardsWon: number;
  programmingLanguages: number;
  technologies: number;
  githubRepos: number;
  yearsLearning: number;
}

export interface ResumeData {
  summary: string;
  languages: { name: string; level: string }[];
  references: { name: string; role: string; contact: string }[];
}

export interface MockFile {
  id: string;
  name: string;
  size: number; // bytes
  type: string; // e.g., "image/png", "application/pdf"
  category: "photo" | "certificate" | "cv" | "other";
  uploadedAt: string; // ISO date string
  dataUrl: string; // Base64 data URL
  description?: string;
}

export interface PrivacySettings {
  showPhone: boolean;
  showEmail: boolean;
  showLinkedIn: boolean;
  showGitHub: boolean;
  showFacebook: boolean;
  showTelegram: boolean;
  showResume: boolean;
  showCertificates: boolean;
  showAwards: boolean;
  showGallery: boolean;
  showWorkHistory: boolean;
  showHackathons: boolean;
  enableDownloads: boolean;
  watermarkText: string;
  visibilityMode: "public" | "recruiters" | "private" | "password";
  passwordAccessCode: string;
  recruiterToken: string;
  shareLinkExpiry: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  action: string;
  ipAddress: string;
  device: string;
  browser: string;
}

