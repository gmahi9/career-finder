import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef } from "react";
import { questions } from "../data/questions";
import { useCalm } from "../lib/motionPrefs";
import type { Answers, Question } from "../lib/types";
import { TapButton, useLift } from "./motionBits";

interface QuizProps {
  step: number;
  answers: Answers;
  onChoose: (questionId: string, optionId: string) => void;
  onStep: (step: number) => void;
  onFinish: (answers: Answers) => void;
  onExit: () => void;
}

export function Quiz({ step, answers, onChoose, onStep, onFinish, onExit }: QuizProps) {
  const calm = useCalm();
  const question = questions[step];
  const selected = answers[question.id];
  const percent = ((step + (selected ? 1 : 0)) / questions.length) * 100;
  const paneRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const direction = useRef(1);
  const moving = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const node = fillRef.current;
    if (!node) return;
    if (calm) {
      gsap.set(node, { scaleX: percent / 100 });
      return;
    }
    const tween = gsap.to(node, { scaleX: percent / 100, duration: 0.65, ease: "power3.out" });
    return () => {
      tween.kill();
    };
  }, [calm, percent]);

  useLayoutEffect(() => {
    const node = paneRef.current;
    if (!node) return;
    if (calm) {
      gsap.set(node, { x: 0, opacity: 1 });
      gsap.set(node.querySelectorAll(".option"), { clearProps: "transform,opacity" });
      return;
    }
    const tween = gsap.fromTo(
      node,
      { x: direction.current * 46, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.46, ease: "power3.out" },
    );
    const options = gsap.fromTo(
      node.querySelectorAll(".option"),
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.42, stagger: 0.045, ease: "power3.out", delay: 0.06 },
    );
    return () => {
      tween.kill();
      options.kill();
    };
  }, [calm, step]);

  function goTo(next: number) {
    if (moving.current || next === step) return;
    const dir = next > step ? 1 : -1;
    direction.current = dir;
    const node = paneRef.current;
    if (calm || !node) {
      onStep(next);
      return;
    }
    moving.current = true;
    gsap.to(node, {
      x: dir * -36,
      opacity: 0,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => {
        moving.current = false;
        if (alive.current) onStep(next);
      },
    });
  }

  function goNext() {
    if (!selected) return;
    if (step === questions.length - 1) {
      onFinish({ ...answers, [question.id]: selected });
      return;
    }
    goTo(step + 1);
  }

  return (
    <section className="quiz glass" aria-labelledby="quiz-title">
      <div className="quiz-top">
        <h1 id="quiz-title">Question {step + 1} of {questions.length}</h1>
        <p className="fine" id="quiz-progress">{Math.round(percent)}% answered</p>
      </div>
      <div className="progress" aria-hidden="true">
        <span ref={fillRef} className="progress-fill" />
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goNext();
        }}
      >
        <div className="question-viewport">
          <div className="question-pane" ref={paneRef}>
            <QuestionPane key={question.id} question={question} selected={selected} onChoose={onChoose} />
          </div>
        </div>
        <div className="quiz-actions">
          <TapButton type="button" className="btn btn-ghost" onClick={onExit}>Exit</TapButton>
          <div className="quiz-nav">
            <TapButton type="button" className="btn btn-ghost" onClick={() => goTo(step - 1)} disabled={step === 0}>
              Back
            </TapButton>
            <TapButton type="submit" className="btn btn-primary" disabled={!selected}>
              {step === questions.length - 1 ? "See results" : "Next"}
            </TapButton>
          </div>
        </div>
      </form>
    </section>
  );
}

function QuestionPane({
  question,
  selected,
  onChoose,
}: {
  question: Question;
  selected: string | undefined;
  onChoose: (questionId: string, optionId: string) => void;
}) {
  const legendRef = useRef<HTMLLegendElement>(null);

  useEffect(() => {
    legendRef.current?.focus();
  }, []);

  return (
    <fieldset>
      <legend ref={legendRef} tabIndex={-1}>{question.prompt}</legend>
      {question.detail && <p className="detail">{question.detail}</p>}
      <div className="options">
        {question.options.map((option) => (
          <OptionRow
            key={option.id}
            id={`${question.id}-${option.id}`}
            name={question.id}
            value={option.id}
            label={option.label}
            checked={selected === option.id}
            onChoose={() => onChoose(question.id, option.id)}
          />
        ))}
      </div>
    </fieldset>
  );
}

function OptionRow({
  id,
  name,
  value,
  label,
  checked,
  onChoose,
}: {
  id: string;
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChoose: () => void;
}) {
  const calm = useCalm();
  const ref = useRef<HTMLLabelElement>(null);
  useLift(ref, !calm, 2);
  return (
    <label ref={ref} className={checked ? "option is-on" : "option"} htmlFor={id}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChoose}
      />
      <span>{label}</span>
    </label>
  );
}
