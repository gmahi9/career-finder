import { useMemo, useState } from "react";
import { guideUrl } from "../data/articleLinks";
import { questions } from "../data/questions";
import { CATEGORY_LABELS, EDUCATION_LABELS, categoryLabel, formatCount, formatGrowth, formatPay } from "../lib/format";
import { applyFilters } from "../lib/score";
import type { CareerCatalog, EducationLevel, ResultFilters, ScoredCareer } from "../lib/types";

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

export function Results({ ranked, source, onRetake }: ResultsProps) {
  const [filters, setFilters] = useState<ResultFilters>(EMPTY_FILTERS);
  const [showAll, setShowAll] = useState(false);
  const [copyNote, setCopyNote] = useState("");
  const shareUrl = window.location.href;

  const filtered = useMemo(() => applyFilters(ranked, filters), [ranked, filters]);
  const top = filtered.slice(0, 5);
  const tableRows = showAll ? filtered : top;

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
          <button type="button" className="primary" onClick={() => window.print()}>Print or save as PDF</button>
          <button type="button" className="ghost" onClick={onRetake}>Retake quiz</button>
        </div>
      </div>

      <div className="share no-print">
        <label htmlFor="share-url">Shareable results link</label>
        <div className="share-row">
          <input id="share-url" readOnly value={shareUrl} />
          <button type="button" className="ghost" onClick={copyLink}>Copy link</button>
        </div>
        <p className="fine" role="status" aria-live="polite">{copyNote}</p>
      </div>

      <form className="filters no-print" aria-label="Filter matches" onSubmit={(event) => event.preventDefault()}>
        <label>
          Search
          <input
            type="search"
            value={filters.query}
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </label>
        <label>
          Field
          <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
            <option value="any">All fields</option>
            {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Preparation you will consider
          <select
            value={filters.education}
            onChange={(event) => setFilters({ ...filters, education: event.target.value as EducationLevel | "any" })}
          >
            <option value="any">Any</option>
            {Object.entries(EDUCATION_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Minimum median pay
          <select value={filters.minPay} onChange={(event) => setFilters({ ...filters, minPay: Number(event.target.value) })}>
            <option value={0}>Any</option>
            <option value={50000}>$50,000</option>
            <option value={75000}>$75,000</option>
            <option value={100000}>$100,000</option>
          </select>
        </label>
        <label>
          Minimum 10-year growth
          <select value={filters.minGrowth} onChange={(event) => setFilters({ ...filters, minGrowth: Number(event.target.value) })}>
            <option value={-100}>Any, including decline</option>
            <option value={0}>0% or higher</option>
            <option value={5}>5% or higher</option>
            <option value={10}>10% or higher</option>
          </select>
        </label>
        <label>
          Setting
          <select
            value={filters.setting}
            onChange={(event) => setFilters({ ...filters, setting: event.target.value as ResultFilters["setting"] })}
          >
            <option value="any">Any</option>
            <option value="desk">Mostly desk</option>
            <option value="active">Active or physical</option>
          </select>
        </label>
      </form>

      <p className="fine" aria-live="polite">
        {filtered.length === 0
          ? "No careers match these filters."
          : `Showing ${top.length} of ${filtered.length} matches under the current filters.`}
      </p>

      <ol className="cards">
        {top.map((item, index) => (
          <li key={item.career.id} className="card">
            <div className="card-top">
              <p className="rank">#{index + 1}</p>
              <span className="pill" data-category={item.career.category}>{categoryLabel(item.career.category)}</span>
              <p className="score">
                <meter min={0} max={100} value={item.score} aria-label={`Fit score ${item.score} out of 100`} />
                <span>{item.score}<span className="score-of"> / 100</span></span>
              </p>
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
                <dd>{formatPay(item.career.medianPay)} <span className="fine">({source.wageYear}, {item.career.payBasis})</span></dd>
              </div>
              <div>
                <dt>10-year outlook</dt>
                <dd>
                  {formatGrowth(item.career.growthPercent, item.career.growthLabel)}
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
          </li>
        ))}
      </ol>

      <div className="table-wrap">
        <div className="table-tools no-print">
          <h2>Comparison</h2>
          <button type="button" className="ghost" onClick={() => setShowAll((value) => !value)} disabled={filtered.length <= 5}>
            {showAll ? "Show top 5 only" : `Compare all ${filtered.length} filtered matches`}
          </button>
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
            {tableRows.map((item) => (
              <tr key={item.career.id}>
                <th scope="row">{item.career.title}</th>
                <td>{item.score}</td>
                <td>{formatPay(item.career.medianPay)}</td>
                <td>{formatGrowth(item.career.growthPercent, item.career.growthLabel)}</td>
                <td>{item.career.entryEducation}</td>
                <td>{item.career.training}</td>
                <td><a href={item.career.oohUrl}>BLS profile</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fine source-note">{source.note} The quiz has {questions.length} questions.</p>
    </section>
  );
}
