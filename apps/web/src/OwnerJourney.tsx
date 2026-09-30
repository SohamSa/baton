import { ScenarioNotes } from "./ScenarioNotes";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import story from "../../../content/owner-journey.json";

const STORAGE_KEY = "baton-owner-journey-v1";
type OwnerPath = "build" | "operate" | "explore";
type Journal = { path: OwnerPath; completed: string[]; choices: Record<string, number>; note: string };
const blank: Journal = { path: "explore", completed: [], choices: {}, note: "" };
function readJournal(): Journal {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!value || !["build", "operate", "explore"].includes(value.path)) return blank;
    return {
      path: value.path,
      completed: Array.isArray(value.completed) ? value.completed.filter((id: unknown) => story.chapters.some((c) => c.id === id)) : [],
      choices: Object.fromEntries(story.finale.flatMap((q) => Number.isInteger(value.choices?.[q.id]) && q.options[value.choices[q.id]] ? [[q.id, value.choices[q.id]]] : [])),
      note: typeof value.note === "string" ? value.note.slice(0, 10000) : "",
    };
  } catch { return blank; }
}
function pathFrom(search: string): OwnerPath | null {
  const value = new URLSearchParams(search).get("path");
  return value === "build" || value === "operate" || value === "explore" ? value : null;
}
function chapterLink(id: string, path: OwnerPath) { return `/journey/${id}?path=${path}`; }

export function OwnerJourney() {
  const { chapter: requestedChapter } = useParams();
  const chapterId = requestedChapter ?? "arrival";
  const location = useLocation();
  const navigate = useNavigate();
  const [journal, setJournal] = useState<Journal>(readJournal);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const path = pathFrom(location.search) ?? journal.path;
  const index = story.chapters.findIndex((c) => c.id === chapterId);
  const chapter = story.chapters[index];
  const cast = story.characters.filter((c) => c.chapter === chapterId);
  const answered = story.finale.every((q) => journal.choices[q.id] !== undefined);
  const supported = story.finale.every((q) => q.options[journal.choices[q.id]]?.supported);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...journal, path })); }
    catch { setStorageAvailable(false); }
  }, [journal, path]);
  useEffect(() => {
    document.title = chapter ? `${chapter.title} · Baton` : "Baton · The owner’s story";
    window.scrollTo({ top: 0, behavior: "instant" });
    // Keyboard readers arrive at the new passage rather than the old footer.
    document.getElementById("reading-title")?.focus({ preventScroll: true });
  }, [chapter]);
  function finishChapter() {
    if (chapter) setJournal((j) => ({ ...j, completed: [...new Set([...j.completed, chapter.id])] }));
  }
  return <section className="owner-story owner-reading">
    <header className="owner-masthead">
      <p className="eyebrow">{index <= 0 ? "Follow the work" : `The investigation · ${index + 1} of ${story.chapters.length}`}</p>
      <h1 id="reading-title" tabIndex={-1}>{index === 0 ? story.title : chapter?.title ?? "This page is missing"}</h1>
      <p className="lede">{chapter?.teaser}</p>
      {index === 0 ? <p className="owner-boundary">A fictional learning story with synthetic evidence. Real facility decisions need site-specific engineering.</p> : null}
    </header>
    {!chapter ? <p role="alert">That page is not in this story. <Link to="/">Start with the stalled job.</Link></p> : <>
      <article className="owner-prose" aria-label="The investigation">{chapter.paragraphs.map((p) => <p key={p}>{p}</p>)}</article>
      {chapterId === "finale" ? <p className="reading-extra"><Link className="owner-button" to={`/desk?scenario=recovery_crossroads&chapter=finale&path=${path}`}>Run the combined recovery scenario</Link></p> : null}
      {chapterId === "finale" ? <details className="reading-extra owner-finale">
        <summary>What would you tell the team? Try the decisions.</summary>
        <p>You can change your answers. This discussion is a tabletop exercise. You can also run the related combined scenario below.</p>
        {story.finale.map((q) => <fieldset key={q.id}><legend>{q.prompt}</legend>{q.options.map((option, choice) => <label key={option.label}>
          <input type="radio" name={q.id} checked={journal.choices[q.id] === choice} onChange={() => setJournal((j) => ({ ...j, choices: { ...j.choices, [q.id]: choice } }))} />{option.label}
        </label>)}{journal.choices[q.id] !== undefined ? <p className="owner-feedback" role="status">{q.options[journal.choices[q.id]].feedback}</p> : null}</fieldset>)}
        {answered ? <div className="owner-resolution" role="status"><h2>{supported ? "The clues become a recovery plan" : "The investigation has unfinished business"}</h2><p>{supported ? "Your plan asks for current evidence, a usable save, and a recovery the runtime and available capacity support. If a prerequisite is absent, the team identifies the blocker." : "An old report, an unfinished save, or unsupported membership can undermine the plan. Follow those clues again and revise your response."}</p></div> : null}
      </details> : null}
      {chapterId === "dawn" ? <section className="owner-pack reading-extra">
        <h2>Your next conversation</h2>
        <p>{path === "build" ? "Turn one question into a request for your design or supplier review." : path === "operate" ? "Turn one question into a request for your operating review or restore drill." : "Choose one question you want a datacenter team to explain with evidence."}</p>
        <Link className="owner-button" to={`/worksheet?chapter=dawn&path=${path}`}>Build my facility review worksheet</Link>
        <details><summary>Find a question from the investigation</summary><ul>{story.characters.map((c) => <li key={c.id}><strong>{c.name}:</strong> {c.question}</li>)}</ul></details>
        <label htmlFor="owner-note">What is missing, who can bring the evidence, and what should they demonstrate?</label>
        <textarea id="owner-note" rows={5} maxLength={10000} value={journal.note} onChange={(e) => setJournal((j) => ({ ...j, note: e.target.value }))} />
        <p className="muted">{storageAvailable ? "Reading progress, decisions, and notes stay in this browser. They are not sent to a service." : "Browser storage is unavailable. Print your notes before leaving."}</p>
        <div className="owner-actions"><button type="button" onClick={() => window.print()}>Print my notes</button><button type="button" onClick={() => setJournal({ ...blank, path })}>Clear my progress and notes</button></div>
      </section> : null}
      <footer className="owner-pagination reading-pagination">
        {index > 0 ? <Link to={chapterLink(story.chapters[index - 1].id, path)}>← {story.chapters[index - 1].title}</Link> : <span>You can read without opening any tools.</span>}
        {index < story.chapters.length - 1 ? <Link className="owner-button" onClick={finishChapter} to={chapterLink(story.chapters[index + 1].id, path)}>Continue: {story.chapters[index + 1].title} →</Link> : <Link onClick={finishChapter} to={`/worksheet?chapter=dawn&path=${path}`}>Carry a question into my facility review →</Link>}
      </footer>
      {cast.length ? <details className="reading-extra reading-evidence" key={chapterId}>
        <summary>Explore the evidence and rehearse the decisions</summary>
        <p>The investigation uses invented scenarios. Open a problem below to see its observations, model assumptions, limits, and alternative responses.</p>
        {cast.map((c) => <details className="reading-problem" key={c.id} id={c.id}>
          <summary>{c.name}</summary><p>{c.scene}</p>
          <h3>What to observe</h3><p>{c.clue}</p><p>{c.lesson}</p>
          <h3>Ask your team</h3><p>{c.question}</p>
          <details><summary>Evidence fields and rehearsal scope</summary><ul>{c.fields.map((f) => <li key={f}>{f}</li>)}</ul><p>{c.coverage}</p></details>
          <ScenarioNotes id={c.id} />
          <div className="owner-actions"><Link to={`/desk?scenario=${c.id}&chapter=${chapter.id}&path=${path}`}>Compare responses to this problem</Link><Link to={`${c.route}?chapter=${chapter.id}&path=${path}`}>Explore the supporting tool</Link></div>
        </details>)}
      </details> : null}
      <details className="reading-extra" key={`context-${chapterId}`}><summary>{path === "build" ? "Bring this question to my design review" : path === "operate" ? "Bring this question to my operating review" : "Connect this question to my facility"}</summary>
        <p>{chapter.question}</p><Link to={`/worksheet?chapter=${chapter.id}&path=${path}`}>Record my evidence request</Link><p><Link to={`${chapter.route}?chapter=${chapter.id}&path=${path}`}>{chapter.routeLabel}</Link></p>
      </details>
    </>}
    <details className="reading-extra" key={`browse-${chapterId}`}><summary>Find an earlier part or explore the tools</summary>
      <nav className="owner-chapters" aria-label="Story chapters">{story.chapters.map((c) => <Link key={c.id} to={chapterLink(c.id, path)} aria-current={c.id === chapterId ? "page" : undefined}>{c.title}{journal.completed.includes(c.id) ? <small>Read</small> : null}</Link>)}</nav>
      <div className="owner-actions"><Link to="/portfolio">Executive overview</Link><Link to="/desk">Practice floor</Link><Link to="/data">Data catalog</Link><Link to="/worksheet">Facility worksheet</Link><Link to="/stories">Problem questions</Link></div>
      <label className="reading-path">Use questions relevant to my situation<select aria-label="Owner reading context" value={path} onChange={(e) => { const next = e.target.value as OwnerPath; setJournal((j) => ({ ...j, path: next })); navigate(chapterLink(chapterId, next)); }}><option value="explore">Learning about datacenters</option><option value="build">Planning my first facility</option><option value="operate">Operating existing facilities</option></select></label>
    </details>
  </section>;
}

export function OwnerJourneyContext() {
  const location = useLocation();
  if (location.pathname === "/" || location.pathname.startsWith("/journey")) return null;
  const query = new URLSearchParams(location.search);
  const source = story.chapters.find((c) => c.id === query.get("chapter"));
  const path = pathFrom(location.search) ?? "explore";
  return <aside className="owner-context" aria-label="Owner journey context"><div><strong>{source ? source.title : "Follow the work"}</strong><p>{source ? source.question : "Follow one stalled job to understand how these systems connect."} These tools use synthetic evidence and simplified models.</p></div><Link to={source ? chapterLink(source.id, path) : "/"}>{source ? "Return to my reading" : "Read the investigation"}</Link></aside>;
}
