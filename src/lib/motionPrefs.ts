import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const PRESS = { type: "spring" as const, stiffness: 460, damping: 30, mass: 0.7 };

export const LAYOUT = { type: "spring" as const, stiffness: 340, damping: 34, mass: 0.8 };

export function useCalm() {
  const fromLibrary = useReducedMotion();
  const [media, setMedia] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setMedia(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return fromLibrary ?? media;
}
