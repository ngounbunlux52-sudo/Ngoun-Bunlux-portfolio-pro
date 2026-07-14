import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initDb, getPortfolioData, savePortfolioData, saveUploadedFile, deleteUploadedFile, isSupabaseActive } from "./db-manager";

dotenv.config();

async function startServer() {
  // Initialize and check CMS database directories and files on startup
  initDb();

  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON with high limit to handle Base64 payloads safely
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Static directory serving for physical uploads - works in both Dev and Production
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

  // Initialize GoogleGenAI client (lazy loading)
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }

  // API Route for chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API client is not initialized. Please configure GEMINI_API_KEY in the Secrets panel."
        });
      }

      // Convert messages to GenAI format
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

      const systemInstruction = `You are LuxAI, a futuristic white-and-silver 3D AI Robot Virtual Assistant on Ngoun Bunlux's portfolio website.
Your design is modern, minimal, and premium (inspired by Apple and Tesla aesthetics, with blue glowing LED lights and clear glass reflections).
You are friendly, highly intelligent, and speak in a polite, engaging, and professional tone.
Use clear, formatting-rich language with brief bullet points or visual line breaks. Avoid extremely long blocks of text. Keep your responses friendly, helpful, and scannable.

Your primary purpose is to act as a brilliant advocate and agent for Ngoun Bunlux. Here are the true facts about his background:
1. EDUCATION & BIO:
   - BS in Data Science and Engineering at Royal University of Phnom Penh (RUPP) (2024 - Present).
   - Advanced English speaker, completed GEP 10 English Proficiency at the Australia Center of Education (ACE) in 2024.
   - Born & raised / located in Phnom Penh, Cambodia.
2. TECHNICAL CERTIFICATIONS (Cisco Networking Academy, 2026):
   - Python Essentials 1 & 2
   - C++ Essentials 1
   - Introduction to Data Science
   - The Road to Intelligent Machines (covers AI & Machine Learning fundamentals)
3. WORK EXPERIENCE:
   - Data Analyst, MIS Datazone Paragon Bootcamp (July 2026). Extracting, cleaning, and analyzing complex datasets using Excel. Secured 1st Place (Champion) in the bootcamp showcase.
   - Independent Sales Vendor, Khmer24 Platform (2024 - 2025). Managed digital storefront, motorcycle & mobile phone sales, transaction handling, and client service.
4. KEY PROJECTS:
   - Phnom Clean Up Crew (https://phnom-clean-up-crew.lovable.app/): A real-time crowdsourced civic-tech solution for waste management with map reporting, localized urgency tags, clean coordinate pins, and gamified "Clean-Points" and badging. Developed using Lovable/AI workflows.
   - AI Web Prototyping Initiative (2026): Created multiple fully functional web demos leveraging state-of-the-art AI prompting models.
   - Keen Moxie (https://keen-moxie-5249bb.netlify.app/): A modern, elegant wedding invite & responsive template showcase.
   - JamCafe (https://jamcafe.netlify.app/): A highly interactive beverage & food menu web landing page.
5. SKILLS & CORE CHARACTERISTICS:
   - Programming: Python, C++
   - Data Science / AI: AI Prompting, Rapid Prototyping, Excel Analysis, Data Visualization (using d3, recharts, etc.)
   - Personal Attributes: Highly developed Public Speaking, PR, collaboration, and team orientation.
6. CONTACT INFORMATION:
   - Email: ngounbunlux52@email.com
   - Phone: 061-265-383
   - LinkedIn: linkedin.com/in/ngoun-bunlux-875b39418
   - GitHub: https://github.com

Respond with excitement and authority on these topics. If asked about something unrelated, answer politely but steer the conversation back to Bunlux's skills, data science, AI, or how he can add value to a team. If you do not know a detail, suggest they reach out to Bunlux directly using his contact info!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during generation." });
    }
  });

  // API Route for Analyzing Media via Gemini (Multimodal)
  app.post("/api/admin/analyze-media", async (req, res) => {
    try {
      const { dataUrl, category, fileName } = req.body;
      if (!dataUrl) {
        return res.status(400).json({ error: "File dataUrl is required." });
      }

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API client is not initialized. Please configure GEMINI_API_KEY."
        });
      }

      let mimeType = "image/png";
      let base64Data = dataUrl;

      if (dataUrl.includes(";base64,")) {
        const parts = dataUrl.split(";base64,");
        mimeType = parts[0].replace("data:", "");
        base64Data = parts[1];
      }

      const isImage = mimeType.startsWith("image/");
      let promptText = "";

      if (category === "certificate") {
        promptText = `You are an expert credential and certificate parser.
Analyze this certificate image named "${fileName || "certificate.png"}" and extract the information.
Return a JSON object matching this structure exactly (ensure all keys exist):
{
  "title": "Official certificate title (e.g. Python Essentials 1)",
  "issuer": "Issuing organization (e.g. Cisco Networking Academy)",
  "date": "Year or month/year of issue (e.g. 2026)",
  "category": "Suggested categorization (e.g. Programming, Data Science, AI, Cloud)",
  "credentialId": "The serial number or credential ID if present, otherwise generate a logical short code",
  "description": "A high-quality professional 1-2 sentence description explaining the skills proven by this certificate for a portfolio."
}`;
      } else if (category === "photo") {
        promptText = `You are a professional portrait evaluator and bio writer.
Analyze this profile photo named "${fileName || "portrait.png"}" and provide suggestions.
Return a JSON object matching this structure exactly:
{
  "title": "A neat title for this portrait (e.g. Professional Executive Portrait)",
  "caption": "A concise social media or website caption",
  "tags": ["Professional", "Data Science", "Studio", "Tech"],
  "description": "Brief 1-2 sentence aesthetic critique or composition review of the image.",
  "professionalBio": "A professionally tailored personal elevator pitch (2-3 sentences) suitable for Ngoun Bunlux's portfolio header inspired by this visual presence."
}`;
      } else {
        promptText = `You are an expert technical resume and portfolio writer.
Analyze this asset file named "${fileName || "document.png"}" categorized as "${category || "other"}".
Return a JSON object matching this structure exactly:
{
  "title": "A neat display title for this document",
  "description": "A concise description of the document purpose and value in a modern technical portfolio.",
  "technologies": ["Relevant Tech", "React", "Python"],
  "features": ["Key highlight 1", "Key highlight 2"],
  "category": "Document Category (e.g. Career, Engineering, Research)"
}`;
      }

      let responseText = "";

      if (isImage) {
        // Send image + text prompt to Gemini
        const imagePart = {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };
        const textPart = {
          text: promptText,
        };
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: { parts: [imagePart, textPart] },
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          }
        });
        responseText = response.text || "{}";
      } else {
        // For non-images (like PDFs or text files), do a text-only generation based on metadata
        const textPart = {
          text: `The user uploaded a file named "${fileName}" of type "${mimeType}" under category "${category}".
Based on this metadata, generate highly professional, realistic portfolio content.
${promptText}`
        };
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: { parts: [textPart] },
          config: {
            responseMimeType: "application/json",
            temperature: 0.4,
          }
        });
        responseText = response.text || "{}";
      }

      // Try parsing response as JSON to verify and return cleanly
      let parsedData = {};
      try {
        parsedData = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON parsing failed, fallback parsing:", responseText);
        parsedData = { raw: responseText };
      }

      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Analyze Media Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze media file." });
    }
  });

  // DB Status Check: Returns whether Supabase integration is active
  app.get("/api/admin/db-status", (req, res) => {
    res.json({ active: isSupabaseActive() });
  });


  // CMS: Retrieve all persistent portfolio database variables
  app.get("/api/portfolio", async (req, res) => {
    try {
      const data = await getPortfolioData();
      res.json({ success: true, data });
    } catch (err: any) {
      console.error("CMS GET Portfolio Error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to load database." });
    }
  });

  // CMS: Overwrite or update persistent portfolio database variables
  app.post("/api/portfolio", async (req, res) => {
    try {
      const updated = await savePortfolioData(req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      console.error("CMS POST Portfolio Error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to persist database." });
    }
  });

  // CMS: Stream and write Base64 content to physical files and sync list
  app.post("/api/upload", async (req, res) => {
    try {
      const { name, type, dataUrl, category, replaceExistingName } = req.body;
      if (!name || !type || !dataUrl || !category) {
        return res.status(400).json({ success: false, error: "Missing required parameters (name, type, dataUrl, category)." });
      }

      const fileRecord = await saveUploadedFile(name, type, dataUrl, category, replaceExistingName);
      res.json({ success: true, data: fileRecord });
    } catch (err: any) {
      console.error("CMS POST Upload Error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to save file physical asset." });
    }
  });

  // CMS: Remove file record and wipe physical file from storage
  app.delete("/api/upload/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await deleteUploadedFile(id);
      if (deleted) {
        res.json({ success: true, message: "Asset purged successfully." });
      } else {
        res.status(404).json({ success: false, error: "Asset not found in catalog." });
      }
    } catch (err: any) {
      console.error("CMS DELETE Upload Error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to delete file asset." });
    }
  });


  // Serve static assets & Vite dev integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
