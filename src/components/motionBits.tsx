import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { formatPay } from "../lib/format";
import { EASE, LAYOUT, PRESS, useCalm } from "../lib/motionPrefs";

export function Reveal({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  const calm = useCalm();
  return (
    <motion.div
      className={className}
      initial={calm ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={calm ? { duration: 0 } : { duration: 0.62, ease: EASE, delay: 0.04 + index * 0.07 }}
    >
      {children}
    </motion.div>
  );
}

export function TapButton({
  disabled,
  ...props
}: ComponentProps<typeof motion.button>) {
  const calm = useCalm();
  const still = Boolean(calm || disabled);
  return (
    <motion.button
      {...props}
      disabled={disabled}
      whileHover={still ? undefined : { y: -2 }}
      whileTap={still ? undefined : { scale: 0.975 }}
      transition={still ? { duration: 0 } : PRESS}
    />
  );
}

export function TapLink(props: ComponentProps<typeof motion.a>) {
  const calm = useCalm();
  return (
    <motion.a
      {...props}
      whileHover={calm ? undefined : { y: -2 }}
      whileTap={calm ? undefined : { scale: 0.975 }}
      transition={calm ? { duration: 0 } : PRESS}
    />
  );
}

type CountKind = "pay" | "growth" | "int";

function renderCount(kind: CountKind, value: number): string {
  const rounded = Math.round(value);
  if (kind === "pay") return formatPay(rounded);
  if (kind === "growth") return `${rounded > 0 ? "+" : ""}${rounded}%`;
  return String(rounded);
}

export function CountUp({ value, kind }: { value: number; kind: CountKind }) {
  const calm = useCalm();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (calm) {
      node.textContent = renderCount(kind, value);
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 0.9,
      ease: EASE,
      onUpdate: (latest) => {
        node.textContent = renderCount(kind, latest);
      },
    });
    return () => controls.stop();
  }, [calm, inView, kind, value]);

  return <span ref={ref}>{renderCount(kind, calm ? value : 0)}</span>;
}

export function ScoreRing({ score }: { score: number }) {
  const calm = useCalm();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const target = circumference * (1 - score / 100);
  const shown = inView || calm ? target : circumference;

  return (
    <div className="ring" ref={ref}>
      <span className="sr-only">Fit score {score} out of 100</span>
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle className="ring-track" cx="36" cy="36" r={radius} />
        <motion.circle
          className="ring-value"
          cx="36"
          cy="36"
          r={radius}
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: shown }}
          transition={calm ? { duration: 0 } : { duration: 1.05, ease: EASE }}
        />
      </svg>
      <span className="ring-num" aria-hidden="true">
        <CountUp value={score} kind="int" />
        <span className="score-of">/100</span>
      </span>
    </div>
  );
}

export function useLayoutTransition() {
  const calm = useCalm();
  return calm ? { duration: 0 } : LAYOUT;
}
