import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { guideUrl } from "../data/articleLinks";
import { questions } from "../data/questions";
import { CATEGORY_LABELS, EDUCATION_LABELS, categoryLabel, formatCount, formatGrowth, formatPay } from "../lib/format";
import { EASE, useCalm } from "../lib/motionPrefs";
import { applyFilters } from "../lib/score";
import type { CareerCatalog, EducationLevel, ResultFilters, ScoredCareer } from "../lib/types";
import { CountUp, ScoreRing, TapButton, useLayoutTransition } from "./motionBits";

interface ResultsProps {
  ranked: ScoredCareer[];
  source: CareerCatalog["source"];
  onRetake: () => void;
}

const EMPTY_FILTERS: ResultFilters = {
  query: "",
  category: "any",
  education: "any",
  minPay: 0,
  minGrowth: -100,
  setting: "any",
};

const PAY_OPTIONS = [
  { value: 0, label: "Any pay" },
  { value: 50000, label: "$50,000+" },
  { value: 75000, label: "$75,000+" },
  { value: 100000, label: "$100,000+" },
];

const GROWTH_OPTIONS = [
  { value: -100, label: "Any, including decline" },
  { value: 0, label: "0% or higher" },
  { value: 5, label: "5% or higher" },
  { value: 10, label: "10% or higher" },
];

const SETTING_OPTIONS = [
  { value: "any" as const, label: "Any setting" },
  { value: "desk" as const, label: "Mostly desk" },
  { value: "active" as const, label: "Active or physical" },
];

export function Results({ ranked, source, onRetake }: ResultsProps) {
  const calm = useCalm();
  const [filters, setFilters] = useState<ResultFilters>(EMPTY_FILTERS);
  const [showAll, setShowAll] = useState(false);
  const [copyNote, setCopyNote] = useState("");
  const shareUrl = window.location.href;

  const filtered = useMemo(() => applyFilters(ranked, filters), [ranked, filters]);
  const top = filtered.slice(0, 5);
  const tableRows = showAll ? filtered : top;
  const animateRows = !calm && tableRows.length <= 8;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyNote("Link copied.");
    } catch {
      setCopyNote("Select the link and copy it.");
    }
  }

  return (
    <section className="results" aria-labelledby="results-title">
      <div className="results-head">
        <div>
          <h1 id="results-title">Your closest matches</h1>
          <p className="lede">
            Scores weigh interests most, then physical work, people, routine, independence, travel,
            the preparation you will consider, pay, and location. They are a fit estimate, not a job offer.
          </p>
        </div>
        <div className="results-actions no-print">
          <TapButton type="button" className="btn btn-primary" onClick={() => window.print()}>Print or save as PDF</TapButton>
          <TapButton type="button" className="btn btn-ghost" onClick={onRetake}>Retake quiz</TapButton>
        </div>
      </div>

      <div className="share glass no-print">
        <label className="field" htmlFor="share-url">Shareable results link</label>
        <div className="share-row">
          <input id="share-url" readOnly value={shareUrl} />
          <TapButton type="button" className="btn btn-ghost" onClick={copyLink}>Copy link</TapButton>
        </div>
        <p className="fine" role="status" aria-live="polite">{copyNote}</p>
      </div>

      <form className="filters glass no-print" aria-label="Filter matches" onSubmit={(event) => event.preventDefault()}>
        <label className="field" htmlFor="match-search">
          Search
          <input
            id="match-search"
            type="search"
            value={filters.query}
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </label>
        <ChipGroup
          label="Field"
          layoutKey="field"
          value={filters.category}
          options={[{ value: "any", label: "All fields" }, ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))]}
          onChange={(category) => setFilters({ ...filters, category })}
        />
        <ChipGroup
          label="Preparation you will consider"
          layoutKey="education"
          value={filters.education}
          options={[{ value: "any", label: "Any preparation" }, ...Object.entries(EDUCATION_LABELS).map(([value, label]) => ({ value, label }))]}
          onChange={(education) => setFilters({ ...filters, education: education as EducationLevel | "any" })}
        />
        <ChipGroup
          label="Minimum median pay"
          layoutKey="pay"
          value={String(filters.minPay)}
          options={PAY_OPTIONS.map((item) => ({ value: String(item.value), label: item.label }))}
          onChange={(minPay) => setFilters({ ...filters, minPay: Number(minPay) })}
        />
        <ChipGroup
          label="Minimum 10-year growth"
          layoutKey="growth"
          value={String(filters.minGrowth)}
          options={GROWTH_OPTIONS.map((item) => ({ value: String(item.value), label: item.label }))}
          onChange={(minGrowth) => setFilters({ ...filters, minGrowth: Number(minGrowth) })}
        />
        <ChipGroup
          label="Setting"
          layoutKey="setting"
          value={filters.setting}
          options={SETTING_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
          onChange={(setting) => setFilters({ ...filters, setting: setting as ResultFilters["setting"] })}
        />
      </form>

      <p className="fine" aria-live="polite">
        {filtered.length === 0
          ? "No careers match these filters."
          : `Showing ${top.length} of ${filtered.length} matches under the current filters.`}
      </p>

      <LayoutGroup>
        <ol className="bento">
          <AnimatePresence mode="popLayout" initial={false}>
            {top.map((item, index) => (
              <ResultCard
                key={item.career.id}
                item={item}
                index={index}
                source={source}
                calm={calm}
                featured={index === 0}
              />
            ))}
          </AnimatePresence>
        </ol>
      </LayoutGroup>

      <div className="table-wrap glass">
        <div className="table-tools no-print">
          <h2>Comparison</h2>
          <TapButton type="button" className="btn btn-ghost" onClick={() => setShowAll((value) => !value)} disabled={filtered.length <= 5}>
            {showAll ? "Show top 5 only" : `Compare all ${filtered.length} filtered matches`}
          </TapButton>
        </div>
        <table>
          <caption>
            {showAll ? "Filtered careers ranked by fit score." : "Top matches ranked by fit score."}
            {" "}All-occupations reference: {formatPay(source.allOccupationsMedianPay)} median pay and {source.allOccupationsGrowthPercent}% projected growth.
          </caption>
          <thead>
            <tr>
              <th scope="col">Career</th>
              <th scope="col">Fit</th>
              <th scope="col">Median pay</th>
              <th scope="col">Growth, {source.outlookPeriod}</th>
              <th scope="col">Entry education</th>
              <th scope="col">Training</th>
              <th scope="col">Handbook</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false} mode="popLayout">
              {tableRows.map((item) => (
                <motion.tr
                  key={item.career.id}
                  layout={animateRows}
                  initial={calm ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: calm ? 0 : 0.16 } }}
                  transition={calm ? { duration: 0 } : { layout: { type: "spring", stiffness: 320, damping: 34 }, opacity: { duration: 0.22 } }}
                  style={{ display: "table-row" }}
                >
                  <th scope="row">{item.career.title}</th>
                  <td>{item.score}</td>
                  <td>{formatPay(item.career.medianPay)}</td>
                  <td>{formatGrowth(item.career.growthPercent, item.career.growthLabel)}</td>
                  <td>{item.career.entryEducation}</td>
                  <td>{item.career.training}</td>
                  <td><a href={item.career.oohUrl}>BLS profile</a></td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <p className="fine source-note">{source.note} The quiz has {questions.length} questions.</p>
    </section>
  );
}

function ChipGroup({
  label,
  layoutKey,
  value,
  options,
  onChange,
}: {
  label: string;
  layoutKey: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const calm = useCalm();
  const layout = useLayoutTransition();
  const labelId = `filter-${layoutKey}`;

  return (
    <div className="chip-group" role="group" aria-labelledby={labelId}>
      <p id={labelId}>{label}</p>
      <div className="chip-row">
        {options.map((option) => {
          const on = option.value === value;
          return (
            <motion.button
              key={option.value}
              type="button"
              className={on ? "chip is-on" : "chip"}
              aria-pressed={on}
              onClick={() => onChange(option.value)}
              whileHover={calm ? undefined : { y: -1 }}
              whileTap={calm ? undefined : { scale: 0.97 }}
              transition={calm ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 30 }}
            >
              {on && <motion.span className="chip-wash" layoutId={`chip-${layoutKey}`} transition={layout} />}
              <span>{option.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({
  item,
  index,
  source,
  calm,
  featured,
}: {
  item: ScoredCareer;
  index: number;
  source: CareerCatalog["source"];
  calm: boolean;
  featured: boolean;
}) {
  return (
    <motion.li
      className={featured ? "card glass card-featured" : "card glass"}
      layout={!calm}
      initial={calm ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={calm ? undefined : { y: -4 }}
      exit={{ opacity: 0, transition: { duration: calm ? 0 : 0.18 } }}
      transition={calm ? { duration: 0 } : { duration: 0.55, ease: EASE, delay: Math.min(index, 4) * 0.05, layout: { type: "spring", stiffness: 280, damping: 32 } }}
    >
      <div className="card-top">
        <p className="rank">#{index + 1}</p>
        <span className="pill" data-category={item.career.category}>{categoryLabel(item.career.category)}</span>
        <ScoreRing score={item.score} />
      </div>
      <h2>{item.career.title}</h2>
      <p>{item.career.summary}</p>
      <h3>Why this match</h3>
      <ul>
        {item.reasons.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>
      <dl className="facts">
        <div>
          <dt>Median pay</dt>
          <dd>
            <CountUp value={item.career.medianPay} kind="pay" />
            {" "}
            <span className="fine">({source.wageYear}, {item.career.payBasis})</span>
          </dd>
        </div>
        <div>
          <dt>10-year outlook</dt>
          <dd>
            <CountUp value={item.career.growthPercent} kind="growth" />
            {` (${item.career.growthLabel})`}
            <span className="fine"> {source.outlookPeriod}, {item.career.outlookBasis}. Employment change {formatCount(item.career.employmentChange)} from {formatCount(item.career.employment2025)} jobs.</span>
          </dd>
        </div>
        <div>
          <dt>Typical entry</dt>
          <dd>{item.career.entryEducation}</dd>
        </div>
        <div>
          <dt>Typical training</dt>
          <dd>{item.career.training}. {item.career.trainingDetail}</dd>
        </div>
      </dl>
      <h3>How to get started</h3>
      <ol className="checklist">
        {item.career.checklist.map((step) => <li key={step}>{step}</li>)}
      </ol>
      <p className="links">
        <a href={item.career.oohUrl}>Occupational Outlook Handbook profile</a>
        <a href={guideUrl(item.career.id)}>Guide on AI TEK SOLUTIONS</a>
      </p>
    </motion.li>
  );
}

export default Results;
