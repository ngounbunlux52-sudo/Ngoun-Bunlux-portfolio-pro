import React, { useState, useEffect } from "react";

interface HeroTypingProps {
  titles: string[];
}

export default function HeroTyping({ titles }: HeroTypingProps) {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Respect accessibility options by displaying the first title instantly with no animation
      setTypedText(titles[0]);
      return;
    }

    let timer: NodeJS.Timeout;
    const currentTitle = titles[currentTitleIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText(currentTitle.substring(0, typedText.length - 1));
      }, 50);
    } else {
      timer = setTimeout(() => {
        setTypedText(currentTitle.substring(0, typedText.length + 1));
      }, 100);
    }

    if (!isDeleting && typedText === currentTitle) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && typedText === "") {
      setIsDeleting(false);
      setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, currentTitleIndex, titles]);

  return (
    <div className="h-10 flex items-center">
      <p className="text-lg sm:text-2xl font-mono text-[#22D3EE] font-extrabold flex items-center">
        <span>{typedText}</span>
        <span className="w-1.5 h-6 bg-[#22D3EE] ml-1.5 animate-pulse" />
      </p>
    </div>
  );
}
