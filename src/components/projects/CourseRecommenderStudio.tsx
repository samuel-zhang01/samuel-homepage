"use client";

import { useMemo, useState } from "react";

import { DemoWindow } from "./DemoChrome";
import styles from "./CourseRecommenderStudio.module.css";

type ViewId = "recommend" | "explain" | "counterfactual" | "source";
type ModelMode = "source" | "adapted";
type Difficulty = "Any" | "Beginner" | "Intermediate" | "Advanced";
type TimeCommitment = "Any" | "part-time" | "full-time" | "flexible";
type Budget = "Any" | "free" | "under-100" | "100-500" | "over-500";
type WeightKey = "category" | "difficulty" | "duration" | "budget" | "rating";

type Course = {
  id: number;
  title: string;
  uiAlias?: string;
  category: string;
  difficulty: Exclude<Difficulty, "Any">;
  weeks: number;
  rating: number;
  mockEnrollments: number;
  price: number;
};

type Preferences = {
  categories: string[];
  difficulty: Difficulty;
  time: TimeCommitment;
  budget: Budget;
};

type Weights = Record<WeightKey, number>;

type ScoreComponent = {
  id: WeightKey;
  label: string;
  active: boolean;
  weight: number;
  value: number;
  points: number;
  evidence: string;
};

type ScoredCourse = {
  course: Course;
  score: number;
  eligible: boolean;
  reasons: string[];
  components: ScoreComponent[];
  activeWeight: number;
};

const SOURCE_COMMIT = "f80fa51";

const COURSES: Course[] = [
  { id: 1, title: "Advanced Python Programming", category: "Programming", difficulty: "Advanced", weeks: 8, rating: 4.8, mockEnrollments: 15420, price: 199.99 },
  { id: 2, title: "Machine Learning Fundamentals", category: "AI/ML", difficulty: "Intermediate", weeks: 10, rating: 4.9, mockEnrollments: 23100, price: 299.99 },
  { id: 3, title: "Data Structures & Algorithms", category: "Programming", difficulty: "Intermediate", weeks: 12, rating: 4.7, mockEnrollments: 18900, price: 249.99 },
  { id: 4, title: "Full Stack Web Development", uiAlias: "Web Development Bootcamp", category: "Web Dev", difficulty: "Beginner", weeks: 16, rating: 4.6, mockEnrollments: 31200, price: 399.99 },
  { id: 5, title: "Digital Marketing Strategy", category: "Marketing", difficulty: "Beginner", weeks: 6, rating: 4.5, mockEnrollments: 12800, price: 149.99 },
  { id: 6, title: "Financial Analysis", category: "Finance", difficulty: "Intermediate", weeks: 8, rating: 4.7, mockEnrollments: 9600, price: 279.99 },
];

const CATEGORY_OPTIONS = ["Programming", "AI/ML", "Web Dev", "Data Science", "Marketing", "Finance", "Design", "Business"];

const DEFAULT_PREFERENCES: Preferences = {
  categories: ["Programming", "AI/ML"],
  difficulty: "Intermediate",
  time: "part-time",
  budget: "100-500",
};

const DEFAULT_WEIGHTS: Weights = {
  category: 35,
  difficulty: 25,
  duration: 15,
  budget: 15,
  rating: 10,
};

const WEIGHT_META: { id: WeightKey; label: string; short: string }[] = [
  { id: "category", label: "Category alignment", short: "CATEGORY" },
  { id: "difficulty", label: "Difficulty proximity", short: "LEVEL" },
  { id: "duration", label: "Duration proxy", short: "TIME" },
  { id: "budget", label: "Budget fit", short: "BUDGET" },
  { id: "rating", label: "Mock catalog rating", short: "RATING" },
];

const VIEWS: { id: ViewId; label: string; hint: string }[] = [
  { id: "recommend", label: "Recommend", hint: "Inputs + ranking" },
  { id: "explain", label: "Explain", hint: "Score decomposition" },
  { id: "counterfactual", label: "What if?", hint: "Rank sensitivity" },
  { id: "source", label: "Source map", hint: "Prototype audit" },
];

const DIFFICULTY_INDEX: Record<Exclude<Difficulty, "Any">, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

function currency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function seededReplay(courseId: number, seed: number) {
  let value = Math.imul(courseId, 0x9e3779b1) ^ Math.imul(seed, 0x85ebca6b);
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return (value >>> 0) / 4_294_967_296;
}

function sourceEligible(course: Course, preferences: Preferences) {
  const categoryPass = preferences.categories.length === 0
    || preferences.categories.some((category) => course.category.toLocaleLowerCase().includes(category.toLocaleLowerCase()));
  const difficultyPass = preferences.difficulty === "Any" || course.difficulty.toLocaleLowerCase() === preferences.difficulty.toLocaleLowerCase();
  return categoryPass && difficultyPass;
}

function sourceReasons(course: Course, preferences: Preferences) {
  const reasons: string[] = [];
  if (preferences.categories.includes("Programming") && course.category === "Programming") reasons.push("Matches your programming interests");
  if (preferences.difficulty === course.difficulty) reasons.push("Perfect difficulty level");
  if (preferences.time === "part-time" && course.weeks <= 10) reasons.push("Fits your schedule");
  if (course.rating >= 4.7) reasons.push("Highly rated by students");
  return reasons.slice(0, 2);
}

function sourceReplayPool(preferences: Preferences, seed: number) {
  return COURSES
    .filter((course) => sourceEligible(course, preferences))
    .map<ScoredCourse>((course) => ({
      course,
      score: seededReplay(course.id, seed) * 100,
      eligible: true,
      reasons: sourceReasons(course, preferences),
      components: [],
      activeWeight: 0,
    }))
    .sort((a, b) => b.score - a.score);
}

function difficultyValue(course: Course, preference: Difficulty) {
  if (preference === "Any") return 1;
  const distance = Math.abs(DIFFICULTY_INDEX[course.difficulty] - DIFFICULTY_INDEX[preference]);
  return distance === 0 ? 1 : distance === 1 ? 0.5 : 0;
}

function durationValue(course: Course, preference: TimeCommitment) {
  if (preference === "Any" || preference === "flexible") return 1;
  if (preference === "part-time") return course.weeks <= 10 ? 1 : course.weeks <= 12 ? 0.5 : 0;
  return course.weeks <= 12 ? 1 : 0.75;
}

function budgetValue(course: Course, preference: Budget) {
  if (preference === "Any") return 1;
  if (preference === "free") return course.price === 0 ? 1 : 0;
  if (preference === "under-100") return course.price < 100 ? 1 : 0;
  if (preference === "100-500") return course.price >= 100 && course.price <= 500 ? 1 : 0;
  return course.price > 500 ? 1 : 0;
}

function adaptedComponents(course: Course, preferences: Preferences, weights: Weights) {
  const categoryActive = preferences.categories.length > 0;
  const difficultyActive = preferences.difficulty !== "Any";
  const durationActive = preferences.time !== "Any";
  const budgetActive = preferences.budget !== "Any";
  const categoryMatch = !categoryActive || preferences.categories.includes(course.category);
  const difficultyMatch = difficultyValue(course, preferences.difficulty);
  const durationMatch = durationValue(course, preferences.time);
  const budgetMatch = budgetValue(course, preferences.budget);

  const raw: Omit<ScoreComponent, "points">[] = [
    {
      id: "category",
      label: "Category alignment",
      active: categoryActive,
      weight: weights.category,
      value: categoryMatch ? 1 : 0,
      evidence: categoryActive ? `${course.category} ${categoryMatch ? "is" : "is not"} selected` : "No category preference; component omitted",
    },
    {
      id: "difficulty",
      label: "Difficulty proximity",
      active: difficultyActive,
      weight: weights.difficulty,
      value: difficultyMatch,
      evidence: difficultyActive ? `${course.difficulty} versus ${preferences.difficulty}; adjacent levels receive half credit` : "Any difficulty; component omitted",
    },
    {
      id: "duration",
      label: "Duration proxy",
      active: durationActive,
      weight: weights.duration,
      value: durationMatch,
      evidence: durationActive ? `${course.weeks} weeks evaluated against ${preferences.time}; weekly workload is unavailable` : "No time preference; component omitted",
    },
    {
      id: "budget",
      label: "Budget fit",
      active: budgetActive,
      weight: weights.budget,
      value: budgetMatch,
      evidence: budgetActive ? `${currency(course.price)} evaluated against ${preferences.budget}` : "Any budget; component omitted",
    },
    {
      id: "rating",
      label: "Mock catalog rating",
      active: true,
      weight: weights.rating,
      value: course.rating / 5,
      evidence: `${course.rating.toFixed(1)} / 5 from source mock data; not independently verified`,
    },
  ];
  const activeWeight = raw.filter((component) => component.active).reduce((sum, component) => sum + component.weight, 0);
  return {
    activeWeight,
    components: raw.map((component) => ({
      ...component,
      points: component.active && activeWeight > 0 ? (component.weight * component.value / activeWeight) * 100 : 0,
    })),
  };
}

function adaptedReasons(components: ScoreComponent[]) {
  return components
    .filter((component) => component.active && component.value >= 0.75 && component.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((component) => `${component.label}: ${component.evidence}`);
}

function rankCourses(mode: ModelMode, preferences: Preferences, weights: Weights, seed: number) {
  if (mode === "source") {
    return sourceReplayPool(preferences, seed).slice(0, 4);
  }

  return COURSES
    .map<ScoredCourse>((course) => {
      const { components, activeWeight } = adaptedComponents(course, preferences, weights);
      return {
        course,
        score: components.reduce((sum, component) => sum + component.points, 0),
        eligible: true,
        reasons: adaptedReasons(components),
        components,
        activeWeight,
      };
    })
    .sort((a, b) => b.score - a.score || b.course.rating - a.course.rating || a.course.id - b.course.id)
    .slice(0, 4);
}

function rankAllAdapted(preferences: Preferences, weights: Weights) {
  return COURSES
    .map((course) => {
      const { components, activeWeight } = adaptedComponents(course, preferences, weights);
      return {
        course,
        score: components.reduce((sum, component) => sum + component.points, 0),
        eligible: true,
        reasons: adaptedReasons(components),
        components,
        activeWeight,
      } satisfies ScoredCourse;
    })
    .sort((a, b) => b.score - a.score || b.course.rating - a.course.rating || a.course.id - b.course.id);
}

function toggleCategory(categories: string[], category: string) {
  return categories.includes(category) ? categories.filter((item) => item !== category) : [...categories, category];
}

function ModelSwitch({ mode, setMode }: { mode: ModelMode; setMode: (mode: ModelMode) => void }) {
  return (
    <div className={styles.modelSwitch} aria-label="Recommendation model">
      <button type="button" className={mode === "source" ? styles.activeSource : ""} onClick={() => setMode("source")} aria-pressed={mode === "source"}>
        <span>SOURCE BASELINE</span><strong>Hard filters + random rank</strong><small>Seeded here only for replay</small>
      </button>
      <button type="button" className={mode === "adapted" ? styles.activeAdapted : ""} onClick={() => setMode("adapted")} aria-pressed={mode === "adapted"}>
        <span>SAFETY-IMPROVED PORT</span><strong>Deterministic weighted rubric</strong><small>Illustrative browser math</small>
      </button>
    </div>
  );
}

function PreferenceControls({
  preferences,
  setPreferences,
  mode,
  seed,
  setSeed,
  weights,
  setWeights,
}: {
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
  mode: ModelMode;
  seed: number;
  setSeed: (seed: number) => void;
  weights: Weights;
  setWeights: (weights: Weights) => void;
}) {
  return (
    <section className={`${styles.panel} ${styles.controlsPanel}`} aria-labelledby="course-inputs-title">
      <div className={styles.panelHeading}>
        <div><span>NON-IDENTIFYING INPUTS ONLY</span><h3 id="course-inputs-title">Learning preferences</h3></div>
        <button type="button" onClick={() => { setPreferences(DEFAULT_PREFERENCES); setWeights(DEFAULT_WEIGHTS); setSeed(4); }}>Reset sample</button>
      </div>

      <fieldset className={styles.categoryFieldset}>
        <legend>Interested categories</legend>
        <div>
          {CATEGORY_OPTIONS.map((category) => (
            <label key={category} className={preferences.categories.includes(category) ? styles.checkedCategory : ""}>
              <input
                type="checkbox"
                checked={preferences.categories.includes(category)}
                onChange={() => setPreferences({ ...preferences, categories: toggleCategory(preferences.categories, category) })}
              />
              <span>{category}</span>
              {!COURSES.some((course) => course.category === category) && <small>0 rows</small>}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.selectGrid}>
        <label><span>Preferred difficulty</span><select value={preferences.difficulty} onChange={(event) => setPreferences({ ...preferences, difficulty: event.target.value as Difficulty })}><option>Any</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        <label><span>Time commitment</span><select value={preferences.time} onChange={(event) => setPreferences({ ...preferences, time: event.target.value as TimeCommitment })}><option value="Any">Any</option><option value="part-time">Part-time</option><option value="full-time">Full-time</option><option value="flexible">Flexible</option></select></label>
        <label><span>Budget range</span><select value={preferences.budget} onChange={(event) => setPreferences({ ...preferences, budget: event.target.value as Budget })}><option value="Any">Any</option><option value="free">Free</option><option value="under-100">Under $100</option><option value="100-500">$100–$500</option><option value="over-500">Over $500</option></select></label>
      </div>

      {mode === "source" ? (
        <div className={styles.seedControl}>
          <label><span>Deterministic replay seed <strong>{seed}</strong></span><input type="range" min={1} max={9} step={1} value={seed} onChange={(event) => setSeed(Number(event.target.value))} /></label>
          <p>The repository uses unseeded <code>Math.random()</code>. This seed is an observability adaptation: change it to see ranking instability without pretending the number measures fit.</p>
        </div>
      ) : (
        <div className={styles.weightEditor}>
          <div className={styles.weightTitle}><span>RUBRIC WEIGHTS</span><strong>Renormalised over active preferences</strong></div>
          {WEIGHT_META.map((item) => (
            <label key={item.id}>
              <span>{item.short}</span>
              <input type="range" min={0} max={50} step={5} value={weights[item.id]} onChange={(event) => setWeights({ ...weights, [item.id]: Number(event.target.value) })} />
              <strong>{weights[item.id]}</strong>
            </label>
          ))}
        </div>
      )}

      <div className={styles.privacyFootnote}><strong>Removed from the public port:</strong> name, email and current role. They do not affect the source frontend’s recommendation logic.</div>
    </section>
  );
}

function ResultCard({ result, rank, mode, selected, onSelect }: {
  result: ScoredCourse;
  rank: number;
  mode: ModelMode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article className={`${styles.resultCard} ${selected ? styles.selectedCard : ""}`}>
      <div className={styles.rankStamp}><span>#{rank}</span><small>{mode === "source" ? "REPLAY" : "RANK"}</small></div>
      <div className={styles.courseCopy}>
        <span>{result.course.category} · {result.course.difficulty}</span>
        <h4>{result.course.title}</h4>
        <div className={styles.courseMeta}><span>{result.course.weeks} weeks</span><span>{result.course.rating.toFixed(1)} mock rating</span><span>{currency(result.course.price)}</span></div>
        <ul>{result.reasons.length ? result.reasons.map((reason) => <li key={reason}>{reason}</li>) : <li>No source reason rule fired.</li>}</ul>
      </div>
      <div className={styles.scoreBlock}>
        <div
          className={mode === "source" ? styles.sourceDial : styles.adaptedDial}
          role="meter"
          aria-label={mode === "source" ? "Seeded replay number" : "Illustrative rubric score"}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(result.score)}
          style={{ "--score": `${result.score}%` } as React.CSSProperties}
        ><strong>{result.score.toFixed(1)}</strong><small>{mode === "source" ? "RANDOM" : "POINTS"}</small></div>
        <button type="button" onClick={onSelect} aria-pressed={selected}>{selected ? "Selected" : "Inspect"}</button>
      </div>
    </article>
  );
}

function RecommendView({
  preferences,
  setPreferences,
  mode,
  seed,
  setSeed,
  weights,
  setWeights,
  ranking,
  selectedId,
  setSelectedId,
  openExplain,
}: {
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
  mode: ModelMode;
  seed: number;
  setSeed: (seed: number) => void;
  weights: Weights;
  setWeights: (weights: Weights) => void;
  ranking: ScoredCourse[];
  selectedId: number;
  setSelectedId: (id: number) => void;
  openExplain: () => void;
}) {
  const candidateCount = mode === "source" ? COURSES.filter((course) => sourceEligible(course, preferences)).length : COURSES.length;
  const topMargin = ranking.length > 1 ? ranking[0].score - ranking[1].score : 0;

  return (
    <div className={styles.recommendLayout}>
      <PreferenceControls preferences={preferences} setPreferences={setPreferences} mode={mode} seed={seed} setSeed={setSeed} weights={weights} setWeights={setWeights} />
      <section className={`${styles.panel} ${styles.resultsPanel}`} aria-labelledby="course-results-title" aria-live="polite">
        <div className={styles.panelHeading}>
          <div><span>{mode === "source" ? "SOURCE-BEHAVIOUR REPLAY" : "DETERMINISTIC ADAPTATION"}</span><h3 id="course-results-title">Ranked shortlist</h3></div>
          <button type="button" onClick={openExplain} disabled={!ranking.length}>Explain selection</button>
        </div>
        <div className={styles.resultMetrics}>
          <div><span>CANDIDATES</span><strong>{candidateCount}</strong><small>{mode === "source" ? "after hard filters" : "scored, not filtered"}</small></div>
          <div><span>RETURNED</span><strong>{ranking.length}</strong><small>top four maximum</small></div>
          <div><span>TOP MARGIN</span><strong>{ranking.length > 1 ? `${topMargin.toFixed(1)}pt` : "—"}</strong><small>{mode === "source" ? "random replay gap" : "rubric gap"}</small></div>
        </div>
        {mode === "source" && <div className={styles.sourceWarning}><strong>Not a match score.</strong> Preferences decide who remains; the source then gives each survivor a random number. Reasons do not contribute to that number.</div>}
        {mode === "adapted" && <div className={styles.adaptedNotice}><strong>Illustrative rubric, not an outcome model.</strong> Points expose declared preferences against six mock catalog rows. No completion, satisfaction or learning-impact data exist.</div>}
        <div className={styles.resultList}>
          {ranking.map((result, index) => <ResultCard result={result} rank={index + 1} mode={mode} selected={result.course.id === selectedId} onSelect={() => setSelectedId(result.course.id)} key={result.course.id} />)}
          {!ranking.length && (
            <div className={styles.emptyResults}>
              <strong>EMPTY CANDIDATE POOL</strong>
              <p>The source baseline hard-filters on category and exact difficulty. Try a catalog category, choose “Any” difficulty, or switch to the adapted model to score all rows.</p>
              <button type="button" onClick={() => setPreferences({ ...preferences, categories: [], difficulty: "Any" })}>Clear hard filters</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ExplainView({
  preferences,
  weights,
  mode,
  seed,
  selectedId,
  setSelectedId,
}: {
  preferences: Preferences;
  weights: Weights;
  mode: ModelMode;
  seed: number;
  selectedId: number;
  setSelectedId: (id: number) => void;
}) {
  const sourceRanking = sourceReplayPool(preferences, seed);
  const adaptedRanking = rankAllAdapted(preferences, weights);
  const course = COURSES.find((item) => item.id === selectedId) ?? adaptedRanking[0].course;
  const adapted = adaptedRanking.find((result) => result.course.id === course.id) ?? adaptedRanking[0];
  const source = sourceRanking.find((result) => result.course.id === course.id);
  const sourceRank = sourceRanking.findIndex((result) => result.course.id === course.id) + 1;
  const adaptedRank = adaptedRanking.findIndex((result) => result.course.id === course.id) + 1;

  return (
    <div className={styles.explainLayout}>
      <section className={`${styles.panel} ${styles.courseSelector}`} aria-labelledby="course-selector-title">
        <div className={styles.panelHeading}><div><span>SELECT A CATALOG ROW</span><h3 id="course-selector-title">Course inspector</h3></div></div>
        <div>
          {COURSES.map((item) => (
            <button type="button" className={course.id === item.id ? styles.activeCourse : ""} onClick={() => setSelectedId(item.id)} aria-pressed={course.id === item.id} key={item.id}>
              <span>{item.category}</span><strong>{item.title}</strong><small>{item.difficulty} · {item.weeks}w · {currency(item.price)}</small>
            </button>
          ))}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.formulaPanel}`} aria-labelledby="score-formula-title">
        <div className={styles.panelHeading}><div><span>ADAPTED MODEL · FULL TRACE</span><h3 id="score-formula-title">{course.title}</h3></div><span className={styles.formulaScore}>{adapted.score.toFixed(1)}</span></div>
        <div className={styles.equation}>
          <span>FINAL SCORE</span>
          <code>Σ(active weight × evidence value) ÷ Σ(active weight) × 100</code>
          <p>{adapted.components.reduce((sum, component) => sum + component.points, 0).toFixed(2)} points · {adapted.activeWeight} active weight units · deterministic tie-break: rating, then ID</p>
        </div>
        <div className={styles.componentList}>
          {adapted.components.map((component) => (
            <article className={!component.active ? styles.inactiveComponent : ""} key={component.id}>
              <div><span>{component.label}</span><strong>{component.active ? `${component.points.toFixed(1)} pts` : "OMITTED"}</strong></div>
              <div className={styles.componentTrack}><i style={{ width: `${component.active ? component.value * 100 : 0}%` }} /></div>
              <p><code>w={component.weight}</code><code>v={component.value.toFixed(2)}</code>{component.evidence}</p>
            </article>
          ))}
        </div>
        <div className={styles.boundaryNote}><strong>Model boundary</strong><p>The duration component is only a documented course-length proxy because the source catalog has no weekly workload. Mock rating and enrollment counts are not verified quality or popularity evidence.</p></div>
      </section>

      <aside className={`${styles.panel} ${styles.comparisonPanel}`} aria-labelledby="model-comparison-title">
        <div className={styles.panelHeading}><div><span>SAME INPUT · TWO BEHAVIOURS</span><h3 id="model-comparison-title">Model comparison</h3></div></div>
        <div className={styles.comparisonCards}>
          <article className={mode === "source" ? styles.currentMode : ""}>
            <span>SOURCE BASELINE</span><strong>{source ? source.score.toFixed(1) : "FILTERED"}</strong><small>{source ? `Replay rank #${sourceRank}${sourceRank > 4 ? " · outside returned top four" : ""}` : "Removed before random ranking"}</small>
            <p>{source ? "Number comes only from the deterministic replay of Math.random()." : "Category or exact-difficulty gate failed."}</p>
          </article>
          <article className={mode === "adapted" ? styles.currentMode : ""}>
            <span>ADAPTED RUBRIC</span><strong>{adapted.score.toFixed(1)}</strong><small>Full-catalog rank #{adaptedRank}</small>
            <p>{adapted.reasons[0] ?? "No positive-weight component contributes; tie-break uses mock rating, then course ID."}</p>
          </article>
        </div>
        <dl className={styles.catalogEvidence}>
          <div><dt>Category</dt><dd>{course.category}</dd></div>
          <div><dt>Difficulty</dt><dd>{course.difficulty}</dd></div>
          <div><dt>Duration</dt><dd>{course.weeks} weeks</dd></div>
          <div><dt>Mock rating</dt><dd>{course.rating.toFixed(1)} / 5</dd></div>
          <div><dt>Mock enrollments</dt><dd>{course.mockEnrollments.toLocaleString("en-GB")}</dd></div>
          <div><dt>Seed price</dt><dd>{currency(course.price)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}

function CounterfactualView({ preferences, weights, selectedId, setSelectedId }: {
  preferences: Preferences;
  weights: Weights;
  selectedId: number;
  setSelectedId: (id: number) => void;
}) {
  const currentRanking = rankAllAdapted(preferences, weights);
  const selectedCourse = COURSES.find((course) => course.id === selectedId) ?? currentRanking[0].course;
  const categoryScenario = preferences.categories.length
    ? { ...preferences, categories: [] }
    : { ...preferences, categories: ["Programming"] };
  const difficultyScenario: Preferences = {
    ...preferences,
    difficulty: preferences.difficulty === "Any" ? "Intermediate" : "Any",
  };
  const timeScenario: Preferences = {
    ...preferences,
    time: preferences.time === "part-time" ? "flexible" : "part-time",
  };
  const budgetScenario: Preferences = {
    ...preferences,
    budget: preferences.budget === "under-100" ? "100-500" : "under-100",
  };
  const scenarios: { label: string; change: string; preferences: Preferences }[] = [
    { label: "Current", change: "No change", preferences },
    { label: preferences.categories.length ? "No category" : "Programming", change: preferences.categories.length ? "Remove category preference" : "Add Programming preference", preferences: categoryScenario },
    { label: preferences.difficulty === "Any" ? "Intermediate" : "Any level", change: preferences.difficulty === "Any" ? "Add Intermediate preference" : "Remove exact difficulty pressure", preferences: difficultyScenario },
    { label: preferences.time === "part-time" ? "Flexible" : "Part-time", change: preferences.time === "part-time" ? "Remove duration pressure" : "Use ≤10-week duration proxy", preferences: timeScenario },
    { label: preferences.budget === "under-100" ? "$100–$500" : "Under $100", change: preferences.budget === "under-100" ? "Use the populated seed-price band" : "Apply a strict budget with no matching source rows", preferences: budgetScenario },
  ];
  const rows = scenarios.map((scenario) => {
    const ranking = rankAllAdapted(scenario.preferences, weights);
    const selected = ranking.find((result) => result.course.id === selectedCourse.id) ?? ranking[0];
    return {
      ...scenario,
      top: ranking[0],
      selected,
      rank: ranking.findIndex((result) => result.course.id === selectedCourse.id) + 1,
    };
  });
  const baseline = rows[0];

  return (
    <div className={styles.counterfactualLayout}>
      <section className={`${styles.panel} ${styles.counterfactualHeader}`}>
        <div className={styles.panelHeading}><div><span>ONE-FACTOR PERTURBATIONS</span><h3>Counterfactual laboratory</h3></div></div>
        <div className={styles.counterfactualIntro}>
          <label><span>Track course</span><select value={selectedCourse.id} onChange={(event) => setSelectedId(Number(event.target.value))}>{COURSES.map((course) => <option value={course.id} key={course.id}>{course.title}</option>)}</select></label>
          <div><strong>WHY ADAPTED MODEL ONLY?</strong><p>The source baseline’s random number has no stable causal explanation. These scenarios use the declared deterministic rubric and change exactly one preference at a time.</p></div>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.scenarioPanel}`} aria-labelledby="scenario-table-title">
        <div className={styles.panelHeading}><div><span>RECALCULATED · NO CACHED SCORES</span><h3 id="scenario-table-title">Rank movement</h3></div><span className={styles.scenarioCourse}>{selectedCourse.title}</span></div>
        <div className={styles.scenarioTableWrap} role="region" aria-label="Scrollable counterfactual rank table" tabIndex={0}>
          <table className={styles.scenarioTable}>
            <thead><tr><th>Scenario</th><th>Single change</th><th>Selected score</th><th>Δ score</th><th>Rank</th><th>Δ rank</th><th>Top recommendation</th></tr></thead>
            <tbody>
              {rows.map((row) => {
                const scoreDelta = row.selected.score - baseline.selected.score;
                const rankDelta = baseline.rank - row.rank;
                return (
                  <tr key={row.label}>
                    <td><strong>{row.label}</strong></td>
                    <td>{row.change}</td>
                    <td>{row.selected.score.toFixed(1)}</td>
                    <td className={scoreDelta > 0 ? styles.positiveDelta : scoreDelta < 0 ? styles.negativeDelta : ""}>{scoreDelta > 0 ? "+" : ""}{scoreDelta.toFixed(1)}</td>
                    <td>#{row.rank}</td>
                    <td className={rankDelta > 0 ? styles.positiveDelta : rankDelta < 0 ? styles.negativeDelta : ""}>{rankDelta > 0 ? "+" : ""}{rankDelta}</td>
                    <td>{row.top.course.title}<small>{row.top.score.toFixed(1)} pts</small></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className={styles.scenarioCards}>
        {rows.slice(1).map((row) => (
          <article className={styles.panel} key={row.label}>
            <span>{row.label.toLocaleUpperCase()}</span><strong>#{row.rank} · {row.selected.score.toFixed(1)}</strong>
            <div className={styles.rankTrack}><i style={{ width: `${row.selected.score}%` }} /></div>
            <p>{row.change}. Winner: <b>{row.top.course.title}</b>.</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function SourceMapView() {
  return (
    <div className={styles.sourceMap}>
      <div className={styles.sourceStats}>
        <article><span>UI CATALOG</span><strong>6</strong><small>local mock rows</small></article>
        <article><span>SQL SEED</span><strong>6</strong><small>course rows</small></article>
        <article><span>API CATALOG</span><strong>2</strong><small>fixed mock rows</small></article>
        <article><span>PROFILE TABLES</span><strong>0</strong><small>despite intake fields</small></article>
        <article><span>LICENCE FILE</span><strong>0</strong><small>public ≠ open source</small></article>
      </div>

      <div className={styles.sourceColumns}>
        <section className={`${styles.panel} ${styles.pipelineAudit}`} aria-labelledby="pipeline-audit-title">
          <div className={styles.panelHeading}><div><span>COMMIT {SOURCE_COMMIT}</span><h3 id="pipeline-audit-title">Actual prototype paths</h3></div></div>
          <ol>
            <li><span>01</span><div><strong>React intake</strong><p>Captures name, email, role, goals, categories, level, schedule and budget in local component state.</p></div><em>BUILT</em></li>
            <li><span>02</span><div><strong>Frontend recommender</strong><p>Hard-filters category and exact level, assigns Math.random scores, then attaches up to two rule-based reasons.</p></div><em>BUILT</em></li>
            <li><span>03</span><div><strong>FastAPI mock</strong><p>Returns two fixed recommendations, ignores the profile for ranking, and echoes the submitted request body.</p></div><em>SEPARATE</em></li>
            <li><span>04</span><div><strong>PostgreSQL seed</strong><p>Defines six courses and indexes, but the API module does not query the database.</p></div><em>UNWIRED</em></li>
            <li><span>05</span><div><strong>Redis worker shell</strong><p>Compose declares Redis and an RQ worker; no recommendation job is implemented.</p></div><em>SCAFFOLD</em></li>
          </ol>
        </section>

        <section className={`${styles.panel} ${styles.contractAudit}`} aria-labelledby="contract-audit-title">
          <div className={styles.panelHeading}><div><span>DATA CONTRACT DRIFT</span><h3 id="contract-audit-title">Three catalogs, three behaviours</h3></div></div>
          <table>
            <thead><tr><th>Surface</th><th>Rows</th><th>Price</th><th>Ranking</th></tr></thead>
            <tbody>
              <tr><td>Frontend local array</td><td>6</td><td>No</td><td>Random after filters</td></tr>
              <tr><td>FastAPI response</td><td>2</td><td>Yes</td><td>Fixed 95 / 88</td></tr>
              <tr><td>PostgreSQL seed</td><td>6</td><td>Yes</td><td>None</td></tr>
            </tbody>
          </table>
          <div className={styles.driftFinding}><strong>Example drift</strong><p>Course 4 is “Web Development Bootcamp” in the frontend and “Full Stack Web Development” in SQL. This port uses the SQL title and records the UI alias.</p></div>
          <div className={styles.unusedInputs}><span>CAPTURED BUT UNUSED IN SOURCE RANKING</span><div><code>Name</code><code>Email</code><code>Experience</code><code>Role</code><code>Career goals</code><code>Learning style</code><code>Schedule</code><code>Budget</code></div></div>
        </section>
      </div>

      <div className={styles.adaptationGrid}>
        <section className={`${styles.panel} ${styles.boundaryCard}`}>
          <span>ORIGINAL BEHAVIOUR PRESERVED</span>
          <ul><li>Category substring and exact difficulty gates</li><li>Top-four output</li><li>Up to two source reason rules</li><li>Random ordering exposed through a deterministic replay seed</li></ul>
        </section>
        <section className={`${styles.panel} ${styles.boundaryCard} ${styles.safeBoundary}`}>
          <span>PUBLIC SAFETY ADAPTATION</span>
          <ul><li>No name, email, role or persistence</li><li>Deterministic, decomposable score</li><li>Missing preferences omitted from denominator</li><li>No enrolment action or learning-outcome claim</li></ul>
        </section>
        <section className={`${styles.panel} ${styles.licenceCard}`}>
          <span>LICENCE + SECURITY BOUNDARY</span>
          <p>The source repository is public but has no LICENSE/COPYING/NOTICE file, so it must not be presented as open source. Compose also contains development placeholder credentials and a frontend Dockerfile case mismatch; neither is copied or executed here.</p>
        </section>
      </div>
    </div>
  );
}

export function CourseRecommenderStudio() {
  const [view, setView] = useState<ViewId>("recommend");
  const [mode, setMode] = useState<ModelMode>("adapted");
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [seed, setSeed] = useState(4);
  const [selectedId, setSelectedId] = useState(2);
  const ranking = useMemo(() => rankCourses(mode, preferences, weights, seed), [mode, preferences, seed, weights]);
  const effectiveSelected = ranking.some((result) => result.course.id === selectedId) ? selectedId : (ranking[0]?.course.id ?? selectedId);

  return (
    <DemoWindow
      appName="Course Recommender — Audit Workbench"
      title="Learning Path Recommender Audit"
      status="SYNTHETIC · LOCAL ONLY"
      statusTone="safe"
      className={styles.courseStudio}
      footer={
        <>
          <span>Source snapshot {SOURCE_COMMIT} · 6 mock catalog rows · no student records</span>
          <span>{mode === "source" ? `Baseline replay seed ${seed}` : `Adapted rubric · ${Object.values(weights).reduce((sum, value) => sum + value, 0)} declared weight units`}</span>
        </>
      }
    >
      <div className={styles.safetyBanner} role="note">
        <span aria-hidden="true">✓</span>
        <div><strong>Personalisation without personal identifiers</strong><p>The source prototype asks for name and email, but its frontend scorer never uses them. This public workbench retains only non-identifying preferences, performs every calculation in-browser and stores nothing.</p></div>
        <code>NO NETWORK · NO STORAGE · NO ENROLMENT</code>
      </div>

      <ModelSwitch mode={mode} setMode={setMode} />

      <nav className={styles.viewTabs} aria-label="Course recommender views">
        {VIEWS.map((item) => (
          <button type="button" key={item.id} className={view === item.id ? styles.activeView : ""} onClick={() => setView(item.id)} aria-current={view === item.id ? "page" : undefined}>
            <strong>{item.label}</strong><span>{item.hint}</span>
          </button>
        ))}
      </nav>

      <div className={styles.canvas}>
        {view === "recommend" && <RecommendView preferences={preferences} setPreferences={setPreferences} mode={mode} seed={seed} setSeed={setSeed} weights={weights} setWeights={setWeights} ranking={ranking} selectedId={effectiveSelected} setSelectedId={setSelectedId} openExplain={() => setView("explain")} />}
        {view === "explain" && <ExplainView preferences={preferences} weights={weights} mode={mode} seed={seed} selectedId={effectiveSelected} setSelectedId={setSelectedId} />}
        {view === "counterfactual" && <CounterfactualView preferences={preferences} weights={weights} selectedId={effectiveSelected} setSelectedId={setSelectedId} />}
        {view === "source" && <SourceMapView />}
      </div>
    </DemoWindow>
  );
}

export default CourseRecommenderStudio;
