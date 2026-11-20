import gsap from "gsap";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { formatPay } from "../lib/format";
import { fitRingOffset } from "../lib/fitRing";
import { useCalm } from "../lib/motionPrefs";

export function RevealRoot({ className, children, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (calm) {
      gsap.set(root.querySelectorAll("[data-line], [data-reveal]"), { clearProps: "all" });
      return;
    }
    const context = gsap.context(() => {
      const lines = root.querySelectorAll("[data-line]");
      if (lines.length) {
        gsap.from(lines, { yPercent: 110, duration: 0.86, stagger: 0.09, ease: "power3.out" });
      }
      const bits = root.querySelectorAll("[data-reveal]");
      if (bits.length) {
        gsap.from(bits, {
          y: 20,
          autoAlpha: 0,
          duration: 0.72,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.06,
        });
      }
    }, root);
    return () => context.revert();
  }, [calm]);

  return (
    <section ref={ref} className={className} {...props}>
      {children}
    </section>
  );
}

export function PhaseFade({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalm();

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || calm) return;
    const tween = gsap.fromTo(
      node,
      { y: 16, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" },
    );
    return () => {
      tween.kill();
      gsap.set(node, { clearProps: "opacity,visibility,transform" });
    };
  }, [calm]);

  return <div ref={ref}>{children}</div>;
}

export function useLift<T extends HTMLElement>(ref: RefObject<T | null>, enabled: boolean, distance = 3) {
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    const enter = () => {
      gsap.to(node, { y: -distance, duration: 0.32, ease: "power2.out", overwrite: "auto" });
    };
    const leave = () => {
      gsap.to(node, { y: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    };
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(node);
      gsap.set(node, { y: 0 });
    };
  }, [enabled, distance]);
}

export function TapButton({ disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const calm = useCalm();
  const ref = useRef<HTMLButtonElement>(null);
  useLift(ref, !calm && !disabled, 2);
  return <button ref={ref} disabled={disabled} {...props} />;
}

export function TapLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const calm = useCalm();
  const ref = useRef<HTMLAnchorElement>(null);
  useLift(ref, !calm, 2);
  return <a ref={ref} {...props} />;
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

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (calm) {
      node.textContent = renderCount(kind, value);
      return;
    }
    node.textContent = renderCount(kind, 0);
    let played = false;
    let tween: gsap.core.Tween | null = null;
    const play = () => {
      if (played) return;
      played = true;
      const proxy = { n: 0 };
      tween = gsap.to(proxy, {
        n: value,
        duration: 0.95,
        ease: "power3.out",
        onUpdate: () => {
          node.textContent = renderCount(kind, proxy.n);
        },
      });
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) play();
    }, { threshold: 0.55 });
    observer.observe(node);
    return () => {
      observer.disconnect();
      tween?.kill();
    };
  }, [calm, kind, value]);

  return <span ref={ref}>{renderCount(kind, calm ? value : 0)}</span>;
}

export function ScoreRing({ score }: { score: number }) {
  const calm = useCalm();
  const ref = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const { circumference, offset } = fitRingOffset(score);
  const radius = 28;

  useEffect(() => {
    const root = ref.current;
    const circle = circleRef.current;
    if (!root || !circle) return;
    if (calm) {
      gsap.set(circle, { strokeDashoffset: offset });
      return;
    }
    gsap.set(circle, { strokeDashoffset: circumference });
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.to(circle, { strokeDashoffset: offset, duration: 1.15, ease: "power3.out" });
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) play();
    }, { threshold: 0.4 });
    observer.observe(root);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(circle);
    };
  }, [calm, circumference, offset]);

  return (
    <div className="ring" ref={ref}>
      <span className="sr-only">Fit score {score} out of 100</span>
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle className="ring-track" cx="36" cy="36" r={radius} />
        <circle
          ref={circleRef}
          className="ring-value"
          cx="36"
          cy="36"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={calm ? offset : circumference}
        />
      </svg>
      <span className="ring-num" aria-hidden="true">
        <CountUp value={score} kind="int" />
        <span className="score-of">/100</span>
      </span>
    </div>
  );
}
