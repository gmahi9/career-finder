import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { questions } from "../data/questions";
import type { Answers, Question } from "../lib/types";
import { EASE, useCalm } from "../lib/motionPrefs";
import { TapButton, useLayoutTransition } from "./motionBits";

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
  const [direction, setDirection] = useState(1);
  const percent = ((step + (selected ? 1 : 0)) / questions.length) * 100;

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    onStep(next);
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
        <motion.span
          className="progress-fill"
          initial={false}
          animate={{ scaleX: percent / 100 }}
          transition={calm ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 24, mass: 0.7 }}
        />
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goNext();
        }}
      >
        <div className="question-viewport">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <QuestionPane
              key={question.id}
              question={question}
              selected={selected}
              direction={direction}
              calm={calm}
              onChoose={onChoose}
            />
          </AnimatePresence>
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
  direction,
  calm,
  onChoose,
}: {
  question: Question;
  selected: string | undefined;
  direction: number;
  calm: boolean;
  onChoose: (questionId: string, optionId: string) => void;
}) {
  const legendRef = useRef<HTMLLegendElement>(null);
  const layout = useLayoutTransition();

  useEffect(() => {
    legendRef.current?.focus();
  }, []);

  return (
    <motion.div
      className="question-pane"
      custom={direction}
      variants={{
        enter: (dir: number) => ({ x: calm ? 0 : dir * 36, opacity: calm ? 1 : 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: calm ? 0 : dir * -32, opacity: calm ? 1 : 0, pointerEvents: "none" as const }),
      }}
      initial="enter"
      animate="center"
      exit="exit"
      transition={calm ? { duration: 0 } : { duration: 0.38, ease: EASE }}
    >
      <fieldset>
        <legend ref={legendRef} tabIndex={-1}>{question.prompt}</legend>
        {question.detail && <p className="detail">{question.detail}</p>}
        <LayoutGroup id={question.id}>
          <div className="options">
            {question.options.map((option) => {
              const inputId = `${question.id}-${option.id}`;
              const checked = selected === option.id;
              return (
                <motion.label
                  key={option.id}
                  className={checked ? "option is-on" : "option"}
                  htmlFor={inputId}
                  whileHover={calm ? undefined : { y: -2 }}
                  whileTap={calm ? undefined : { scale: 0.99 }}
                  transition={calm ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 28 }}
                >
                  {checked && (
                    <motion.span
                      className="option-wash"
                      layoutId={`selected-${question.id}`}
                      transition={layout}
                    />
                  )}
                  <input
                    id={inputId}
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={checked}
                    onChange={() => onChoose(question.id, option.id)}
                  />
                  <span>{option.label}</span>
                </motion.label>
              );
            })}
          </div>
        </LayoutGroup>
      </fieldset>
    </motion.div>
  );
}
