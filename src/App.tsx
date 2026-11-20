import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import logoUrl from "./assets/logo-mark.svg";
import { Constellation } from "./components/Constellation";
import { PhaseFade, RevealRoot, TapButton, TapLink } from "./components/motionBits";
import { Quiz } from "./components/Quiz";
import catalogJson from "./data/careers.json";
import { questions } from "./data/questions";
import { decodeAnswers, encodeAnswers } from "./lib/hash";
import { buildUserProfile, rankCareers } from "./lib/score";
import type { Answers, CareerCatalog } from "./lib/types";

const Results = lazy(() => import("./components/Results"));

const catalog = catalogJson as CareerCatalog;
const SITE = "https://aiteksolutions.net";

const NAV = [
  { href: `${SITE}/services`, label: "Services" },
  { href: `${SITE}/employers`, label: "Employers" },
  { href: `${SITE}/talent`, label: "Talent" },
  { href: `${SITE}/about`, label: "About" },
  { href: `${SITE}/apps`, label: "Apps" },
  { href: `${SITE}/articles`, label: "Articles" },
  { href: `${SITE}/docs`, label: "Docs" },
  { href: `${SITE}/contact`, label: "Contact" },
] as const;

type Phase = "intro" | "quiz" | "results";

function Brand() {
  return (
    <span className="brand">
      <img src={logoUrl} width={40} height={40} alt="" />
      <span className="brand-text">
        <span className="brand-name">AI TEK</span>
        <span className="brand-sub">Solutions LLC</span>
      </span>
    </span>
  );
}

export function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 12);

  useEffect(() => {
    function applyHash() {
      const decoded = decodeAnswers(window.location.hash, questions);
      if (decoded) {
        setAnswers(decoded);
        setPhase("results");
        return;
      }
      if (!window.location.hash) {
        setPhase((current) => (current === "results" ? "intro" : current));
      }
    }
    applyHash();
    window.addEventListener("popstate", applyHash);
    return () => window.removeEventListener("popstate", applyHash);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 981px)");
    function closeIfWide() {
      if (query.matches) setMenuOpen(false);
    }
    query.addEventListener("change", closeIfWide);
    return () => query.removeEventListener("change", closeIfWide);
  }, []);

  const ranked = useMemo(() => {
    if (phase !== "results") return [];
    return rankCareers(catalog.careers, buildUserProfile(answers, questions));
  }, [answers, phase]);

  function start() {
    setPhase("quiz");
    setStep(0);
  }

  function choose(questionId: string, optionId: string) {
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
  }

  function finish(nextAnswers: Answers) {
    const hash = encodeAnswers(nextAnswers);
    const url = `${window.location.pathname}${window.location.search}#${hash}`;
    window.history.pushState(null, "", url);
    setAnswers(nextAnswers);
    setPhase("results");
  }

  function retake() {
    window.history.pushState(null, "", window.location.pathname + window.location.search);
    setAnswers({});
    setStep(0);
    setPhase("intro");
  }

  const year = new Date().getFullYear();

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className={`nav-shell${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-open" : ""}`}>
        <a className="brand-link" href={`${SITE}/`} aria-label="AI TEK SOLUTIONS LLC, home">
          <Brand />
        </a>
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="nav-end">
          <TapLink className="btn btn-primary btn-sm" href={`${SITE}/contact`}>Submit a query</TapLink>
          <button
            className="menu-btn"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <span />
            <span />
          </button>
        </div>
      </header>
      <div id="mobile-menu" className="mobile-menu" hidden={!menuOpen}>
        <nav aria-label="Mobile">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
          ))}
          <TapLink className="btn btn-primary" href={`${SITE}/contact`} onClick={() => setMenuOpen(false)}>
            Submit a query
          </TapLink>
        </nav>
      </div>
      <main id="main" tabIndex={-1}>
        <div className="page">
          <div className="wrap">
            <PhaseFade key={phase}>
              {phase === "intro" && (
                <div className="intro-stage">
                  <div className="mesh" aria-hidden="true">
                    <span className="blob blob-a" />
                    <span className="blob blob-b" />
                    <span className="blob blob-c" />
                  </div>
                  <RevealRoot className="intro-hero" aria-labelledby="intro-title">
                    <div className="intro-copy">
                      <p className="eyebrow" data-reveal>Career Path Finder</p>
                      <h1 id="intro-title">
                        <span className="line-mask"><span className="line" data-line>Find a path that fits</span></span>
                        <span className="line-mask"><span className="line" data-line>how you actually</span></span>
                        <span className="line-mask"><span className="line" data-line>want to work.</span></span>
                      </h1>
                      <p className="lede" data-reveal>
                        Twenty questions on interests, physical work, people, schooling, pay, and location.
                        The result is a ranked list with pay, 10-year growth, and a starting checklist.
                        Figures come from the U.S. Bureau of Labor Statistics Occupational Outlook Handbook.
                      </p>
                      <div className="actions" data-reveal>
                        <TapButton type="button" className="btn btn-primary" onClick={start}>Start the quiz</TapButton>
                      </div>
                      <p className="fine" data-reveal>Nothing is uploaded. A share link stores your answers in the page address only.</p>
                    </div>
                    <Constellation />
                    <aside className="intro-card glass" data-reveal>
                      <p className="kicker">How it works</p>
                      <ol>
                        <li>Pick the closest choice. You can go back and change it.</li>
                        <li>Review the top matches and why each one scored.</li>
                        <li>Keep a link, print the page, or filter the comparison table.</li>
                      </ol>
                    </aside>
                  </RevealRoot>
                </div>
              )}
              {phase === "quiz" && (
                <Quiz
                  step={step}
                  answers={answers}
                  onChoose={choose}
                  onStep={setStep}
                  onFinish={finish}
                  onExit={retake}
                />
              )}
              {phase === "results" && (
                <Suspense fallback={<p className="loading glass" role="status">Preparing your matches.</p>}>
                  <Results ranked={ranked} source={catalog.source} onRetake={retake} />
                </Suspense>
              )}
            </PhaseFade>
          </div>
        </div>
      </main>
      <footer className="site-footer">
        <div className="wrap footer-top">
          <div>
            <a href={`${SITE}/`} aria-label="Home">
              <Brand />
            </a>
            <p className="footer-blurb">
              AI TEK SOLUTIONS LLC is a staffing firm for professional and skilled industrial work, including technology, cybersecurity, artificial intelligence, and skilled roles across industries.
            </p>
          </div>
          <div>
            <h2>Explore</h2>
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Write to us</h2>
            <p>
              <a href="mailto:hr@aiteksolutions.net">hr@aiteksolutions.net</a>
            </p>
            <p className="footer-note">We read every form on this site and reply from that address.</p>
          </div>
        </div>
        <p className="giant" aria-hidden="true">AI TEK</p>
        <div className="wrap legal">
          <p>© {year} AI TEK SOLUTIONS LLC</p>
          <p>Professional · Skilled and industrial · Cybersecurity · AI</p>
        </div>
      </footer>
    </>
  );
}
