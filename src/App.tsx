import { useEffect, useMemo, useState } from "react";
import { questions } from "./data/questions";
import catalogJson from "./data/careers.json";
import { Quiz } from "./components/Quiz";
import { Results } from "./components/Results";
import { decodeAnswers, encodeAnswers } from "./lib/hash";
import { buildUserProfile, rankCareers } from "./lib/score";
import type { Answers, CareerCatalog } from "./lib/types";

const catalog = catalogJson as CareerCatalog;

type Phase = "intro" | "quiz" | "results";

function readTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [theme, setTheme] = useState<"light" | "dark">(readTheme);

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

  const ranked = useMemo(() => {
    if (phase !== "results") return [];
    return rankCareers(catalog.careers, buildUserProfile(answers, questions));
  }, [answers, phase]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("career-path-theme", next);
    setTheme(next);
  }

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

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="brand">
          <p className="eyebrow">Career Path Finder</p>
          <p className="tagline">Interests, training, and the published outlook</p>
        </div>
        <button
          type="button"
          className="theme-toggle ghost"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </header>
      <main id="main">
        {phase === "intro" && (
          <section className="intro" aria-labelledby="intro-title">
            <h1 id="intro-title">Find a path that fits how you actually want to work.</h1>
            <p className="lede">
              Twenty questions on interests, physical work, people, schooling, pay, and location.
              The result is a ranked list with pay, 10-year growth, and a starting checklist.
              Figures come from the U.S. Bureau of Labor Statistics Occupational Outlook Handbook.
            </p>
            <ol className="intro-steps">
              <li>Pick the closest choice. You can go back and change it.</li>
              <li>Review the top matches and why each one scored.</li>
              <li>Keep a link, print the page, or filter the comparison table.</li>
            </ol>
            <button type="button" className="primary" onClick={start}>Start the quiz</button>
            <p className="fine">Nothing is uploaded. A share link stores your answers in the page address only.</p>
          </section>
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
          <Results ranked={ranked} source={catalog.source} onRetake={retake} />
        )}
      </main>
      <footer className="site-footer">
        <p>
          <a href="https://aiteksolutions.net">by AI TEK SOLUTIONS</a>
        </p>
      </footer>
    </>
  );
}
