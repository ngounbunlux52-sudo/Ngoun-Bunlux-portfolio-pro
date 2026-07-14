import React, { useState, useEffect } from "react";

export default function HeaderClock() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }) + " UTC+7");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="hidden lg:block text-[9px] font-mono text-[#22D3EE] bg-[#0B1026]/80 border border-cyan-500/15 px-3 py-1.5 rounded-xl font-bold tracking-wider shadow-inner shadow-cyan-500/5">
      {currentTime || "00:00:00 UTC+7"}
    </span>
  );
}
