import { useEffect } from "react";

/**
 * Custom smooth scroll easing function using cubic-bezier-like easing.
 * Provides an elegant, high-end 60+ FPS scrolling feel.
 */
export function smoothScrollTo(targetSelector: string, duration: number = 850) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  // Check user's reduced-motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.scrollIntoView({ behavior: "auto" });
    return;
  }

  const startPosition = window.scrollY;
  // Account for the sticky header
  const headerOffset = 80;
  const targetPosition = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  // Easing function: easeInOutCubic (extremely elegant deceleration curve)
  function easeInOutCubic(t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
  }

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutCubic(Math.min(timeElapsed, duration), startPosition, distance, duration);
    
    window.scrollTo(0, run);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      window.scrollTo(0, targetPosition);
    }
  }

  requestAnimationFrame(animation);
}

/**
 * Determines if an element or its parents are scrollable.
 * Crucial to prevent locking users out of scrollable containers, dialogs, or dropdowns.
 */
function isScrollableElement(el: HTMLElement | null): boolean {
  if (!el) return false;
  let current: HTMLElement | null = el;
  while (current && current !== document.body && current !== document.documentElement) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const isScrollableType = overflowY === "auto" || overflowY === "scroll";
    const canScroll = current.scrollHeight > current.clientHeight;
    
    if (isScrollableType && canScroll) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

/**
 * React hook that enables a premium inertial momentum scroll for desktop mouse wheels.
 * - Detects trackpads (e.g. Mac trackpads) to bypass rendering, letting native macOS inertia work perfectly.
 * - Respects prefers-reduced-motion.
 * - Bypasses completely on touchscreen mobile/tablet devices.
 * - Excludes active inner scrollable areas like dropdowns, text areas, and maps.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Accessibility: respect reduced motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // 2. Mobile/Tablet: preserve native touch gestures and momentum scrolling
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      return;
    }

    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let isAnimating = false;
    let wheelEventCount = 0;
    let trackpadChecked = false;
    let isTrackpad = false;
    let checkTimeout: NodeJS.Timeout | null = null;

    const onWheel = (e: WheelEvent) => {
      // Allow default behavior for modifier keys (pinch-to-zoom, horizontal scroll)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      // Allow scrolling inside dropdowns, code blocks, or modally opened sub-scrollable frames
      if (isScrollableElement(e.target as HTMLElement)) {
        return;
      }

      // Trackpad Detection:
      // Trackpads fire high-frequency, tiny, non-integer scroll delta events.
      // Mice fire discrete, larger integer steps (e.g. multiples of 120, or >30).
      if (!trackpadChecked) {
        wheelEventCount++;
        const isNonInteger = !Number.isInteger(e.deltaY);
        const isVerySmallDelta = Math.abs(e.deltaY) < 15;
        
        if (isNonInteger || isVerySmallDelta || wheelEventCount > 4) {
          isTrackpad = isNonInteger || isVerySmallDelta;
          trackpadChecked = true;
        }

        // Reset trackpad check state if scrolling stops for 1.5 seconds
        if (checkTimeout) clearTimeout(checkTimeout);
        checkTimeout = setTimeout(() => {
          trackpadChecked = false;
          wheelEventCount = 0;
        }, 1500);
      }

      // If user is on a trackpad, bypass custom wheel handling so native macOS/hardware smooth inertia is kept.
      if (isTrackpad) {
        return;
      }

      // Prevent the browser's default jumpy scroll for external mice
      e.preventDefault();

      let delta = e.deltaY;

      // Normalize delta modes (0: pixel, 1: line, 2: page)
      if (e.deltaMode === 1) {
        delta *= 33;
      } else if (e.deltaMode === 2) {
        delta *= window.innerHeight;
      }

      // Smooth scroll scaling: apply moderate logarithmic clamping for extremely rapid mouse scrolling
      if (Math.abs(delta) > 120) {
        delta = Math.sign(delta) * (120 + Math.log(Math.abs(delta) - 119) * 25);
      }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollY = Math.max(0, Math.min(maxScroll, targetScrollY + delta));

      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(updateScroll);
      }
    };

    const updateScroll = () => {
      const diff = targetScrollY - currentScrollY;
      
      // Lerp (Linear Interpolation) factor. 
      // 0.085 gives an incredibly buttery, organic, luxury-tier deceleration decay.
      const lerpFactor = 0.085;

      if (Math.abs(diff) > 0.4) {
        currentScrollY += diff * lerpFactor;
        window.scrollTo(0, currentScrollY);
        requestAnimationFrame(updateScroll);
      } else {
        currentScrollY = targetScrollY;
        window.scrollTo(0, currentScrollY);
        isAnimating = false;
      }
    };

    // Keep scrolling coordinates in sync when scrolling through other means (scrollbar dragging, arrows, anchor clicks)
    const onScroll = () => {
      if (!isAnimating) {
        currentScrollY = window.scrollY;
        targetScrollY = window.scrollY;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      if (checkTimeout) clearTimeout(checkTimeout);
    };
  }, []);
}

/**
 * React hook that uses IntersectionObserver to add a fade-in/slide-up animation
 * to elements when they enter the viewport. It's GPU-accelerated and highly performant.
 * Integrates a MutationObserver to instantly capture dynamically rendered lists (projects, certificates).
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect user's reduced-motion preference by instantly showing everything
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".scroll-reveal").forEach((el) => {
        el.classList.add("reveal-visible");
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -60px 0px", // triggers slightly before entering fully
      threshold: 0.02,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          // Once revealed, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Initial observation of already mounted elements
    const observeExisting = () => {
      const revealElements = document.querySelectorAll(".scroll-reveal:not(.reveal-visible)");
      revealElements.forEach((el) => observer.observe(el));
    };

    observeExisting();

    // Use MutationObserver to detect dynamically added scroll-reveal nodes
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.classList.contains("scroll-reveal")) {
              observer.observe(node);
            }
            node.querySelectorAll(".scroll-reveal").forEach((child) => {
              observer.observe(child);
            });
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
