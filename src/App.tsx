import React, { useState, useCallback } from "react";
import Portfolio from "./components/Portfolio";
import RobotCanvas from "./components/RobotCanvas";
import ChatWidget from "./components/ChatWidget";
import AIBackground from "./components/AIBackground";
import { SectionType } from "./types";
import { useSmoothScroll } from "./utils/scroll";

export default function App() {
  useSmoothScroll();
  const [activeSection, setActiveSection] = useState<SectionType>("hero");
  const [eyeState, setEyeState] = useState<"idle" | "happy" | "thinking" | "waving">("idle");

  const handleSectionChange = useCallback((section: SectionType) => {
    setActiveSection(section);
  }, []);

  const handleEyeStateChange = useCallback((state: "idle" | "happy" | "thinking" | "waving") => {
    setEyeState(state);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#050816]">
      {/* Interactive AI Canvas Background */}
      <AIBackground />

      {/* Portfolio layout */}
      <Portfolio
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onEyeStateChange={handleEyeStateChange}
      >
        {/* Mount 3D Robot canvas as children inside the 3D panel */}
        <RobotCanvas activeSection={activeSection} eyeState={eyeState} />
      </Portfolio>

      {/* Floating AI Chat Assistant */}
      <ChatWidget onEyeStateChange={handleEyeStateChange} />
    </div>
  );
}
