import { useEffect, useRef } from "react";
import { questions } from "../data/questions";
import type { Answers } from "../lib/types";

interface QuizProps {
  step: number;
  answers: Answers;
  onChoose: (questionId: string, optionId: string) => void;
  onStep: (step: number) => void;
  onFinish: (answers: Answers) => void;
  onExit: () => void;
}

export function Quiz({ step, answers, onChoose, onStep, onFinish, onExit }: QuizProps) {
  const question = questions[step];
  const legendRef = useRef<HTMLLegendElement>(null);
  const selected = answers[question.id];

  useEffect(() => {
    legendRef.current?.focus();
  }, [step]);

  function goNext() {
    if (!selected) return;
    if (step === questions.length - 1) {
      onFinish({ ...answers, [question.id]: selected });
      return;
    }
    onStep(step + 1);
  }

  return (
    <section className="quiz" aria-labelledby="quiz-title">
      <div className="quiz-top">
        <h1 id="quiz-title">Question {step + 1} of {questions.length}</h1>
        <p className="fine" id="quiz-progress">{Math.round(((step + (selected ? 1 : 0)) / questions.length) * 100)}% answered</p>
      </div>
      <div className="progress" aria-hidden="true">
        {questions.map((item, index) => (
          <span key={item.id} className={index < step || (index === step && selected) ? "pip filled" : index === step ? "pip current" : "pip"} />
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goNext();
        }}
      >
        <fieldset>
          <legend ref={legendRef} tabIndex={-1}>{question.prompt}</legend>
          {question.detail && <p className="detail">{question.detail}</p>}
          <div className="options">
            {question.options.map((option) => {
              const inputId = `${question.id}-${option.id}`;
              return (
                <label key={option.id} className="option" htmlFor={inputId}>
                  <input
                    id={inputId}
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={selected === option.id}
                    onChange={() => onChoose(question.id, option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="quiz-actions">
          <button type="button" className="ghost" onClick={onExit}>Exit</button>
          <div className="quiz-nav">
            <button type="button" className="ghost" onClick={() => onStep(step - 1)} disabled={step === 0}>
              Back
            </button>
            <button type="submit" className="primary" disabled={!selected}>
              {step === questions.length - 1 ? "See results" : "Next"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
