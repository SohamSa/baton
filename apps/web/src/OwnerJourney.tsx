import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import story from "../../../content/owner-journey.json";

const STORAGE_KEY = "baton-owner-journey-v1";
type OwnerPath = "build" | "operate" | "explore";
type Journal = { path: OwnerPath; completed: string[]; choices: Record<string, number>; note: string };
const blank: Journal = { path: "explore", completed: [], choices: {}, note: "" };
function readJournal(): Journal {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!value || !["build", "operate", "explore"].includes(value.path)) return blank;
    return { path: value.path, completed: Array.isArray(value.completed) ? value.completed.filter((id: unknown) => story.chapters.some((c) => c.id === id)) : [], choices: Object.fromEntries(story.finale.flatMap((q) => Number.isInteger(value.choices?.[q.id]) && q.options[value.choices[q.id]] ? [[q.id, value.choices[q.id]]] : [])), note: typeof value.note === "string" ? value.note.slice(0, 10000) : "" };
  } catch { return blank; }
}
function pathFrom(search: string): OwnerPath | null {
  const value = new URLSearchParams(search).get("path");
  return value === "build" || value === "operate" || value === "explore" ? value : null;
}
function chapterLink(id: string, path: OwnerPath) { return `/journey/${id}?path=${path}`; }
const PATHS: { id: OwnerPath; title: string; description: string }[] = [
  { id: "build", title: "I’m building my first datacenter", description: "Carry the story into design reviews, procurement, and launch readiness." },
  { id: "operate", title: "I already operate datacenters", description: "Carry the story into recovery drills, incident reviews, and maintenance." },
  { id: "explore", title: "I want to understand the world", description: "Meet the cast and learn the language, with no setup required." },
];

export function OwnerJourney() {
  const { chapter: chapterId } = useParams();
  const location = useLocation();
  const [journal, setJournal] = useState<Journal>(readJournal);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const path = pathFrom(location.search) ?? journal.path;
  const index = story.chapters.findIndex((c) => c.id === chapterId);
  const chapter = story.chapters[index];
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...journal, path })); }
    catch { setStorageAvailable(false); }
  }, [journal, path]);
  useEffect(() => { document.title = chapter ? `${chapter.title} · Baton` : "Baton · The owner’s story"; }, [chapter]);
  const cast = story.characters.filter((c) => c.chapter === chapterId);
  const answered = story.finale.every((q) => journal.choices[q.id] !== undefined);
  const supported = story.finale.every((q) => q.options[journal.choices[q.id]]?.supported);
  function finishChapter() {
    if (chapter) setJournal((j) => ({ ...j, completed: [...new Set([...j.completed, chapter.id])] }));
  }
  return <section className="owner-story">
    <header className="owner-masthead">
      <p className="eyebrow">Baton · An interactive datacenter story</p>
      <h1>{chapter?.title ?? story.title}</h1>
      <p className="lede">{chapter ? chapter.act : story.subtitle}</p>
      <p className="owner-boundary">Fictional facilities. Synthetic evidence. Illustrative outcomes. Learn the questions; validate real decisions with your team.</p>
    </header>
    {!chapter ? <>
      {chapterId ? <p role="alert">That chapter is not in this story. Choose a chapter below.</p> : null}
      <div className="owner-opening"><p>The lights come on. Your team is ready. Then one machine falls silent.</p><p>What follows is a story about the owner who learns to read the clues, question the first diagnosis, and protect useful work. You are that owner.</p></div>
      <div className="owner-paths">{PATHS.map((p) => <article className="panel" key={p.id}><h2>{p.title}</h2><p>{p.description}</p><Link className="owner-button" to={chapterLink("arrival", p.id)}>Enter the opening scene</Link></article>)}</div>
      <h2>The chapters</h2>
      <p>Read in order for the full story, or return to a scene when you need it.</p>
    </> : null}
    <nav className="owner-chapters" aria-label="Story chapters">{story.chapters.map((c) => <Link key={c.id} to={chapterLink(c.id, path)} aria-current={c.id === chapterId ? "page" : undefined}><span>{c.act}</span>{c.title}{journal.completed.includes(c.id) ? <small>Read</small> : null}</Link>)}</nav>
    {chapter ? <>
      <article className="owner-prose">{chapter.paragraphs.map((p) => <p key={p}>{p}</p>)}<blockquote>{chapter.question}</blockquote></article>
      {chapterId === "rhythm" ? <div className="owner-fundamentals panel"><h2>The world, in everyday language</h2><dl>{[["Accelerator", "A machine doing the calculations."], ["Network", "The connections between cooperating workers."], ["Power and cooling", "The supply and heat removal that keep work possible."], ["Training job", "An assigned team working toward one training objective."], ["Checkpoint", "A saved position that recovery may return to."], ["Goodput", "New useful progress per elapsed time; repeated work does not count as new."]].map(([term, explanation]) => <div key={term}><dt>{term}</dt><dd>{explanation}</dd></div>)}</dl><p>A chip, server, rack, job, and facility are different scopes. The existing rehearsals trace a small assigned job inside a larger counted inventory.</p></div> : null}
      {cast.length ? <><h2>Enter the cast</h2><div className="owner-cast">{cast.map((c) => <article className="panel owner-character" key={c.id} id={c.id}>
        <p className="eyebrow">A character in {chapter.act}</p><h3>{c.name}</h3><p>{c.scene}</p>
        <details><summary>Follow the clues and uncover the lesson</summary><h4>The clue</h4><p>{c.clue}</p><h4>The revelation</h4><p>{c.lesson}</p><h4>Ask your team</h4><p>{c.question}</p><h4>The evidence drawer</h4><ul>{c.fields.map((f) => <li key={f}>{f}</li>)}</ul><p className="muted">{c.coverage}</p></details>
        <div className="owner-actions"><Link to={`/desk?scenario=${c.id}&chapter=${chapter.id}&path=${path}`}>Open this rehearsal</Link><Link to={`${c.route}?chapter=${chapter.id}&path=${path}`}>Explore the supporting room</Link><Link to={`/data?chapter=${chapter.id}&path=${path}`}>Open the data catalog</Link></div>
      </article>)}</div></> : null}
      {chapterId === "finale" ? <div className="owner-finale panel"><h2>You have the floor</h2><p>Choose a response at each turn. You can revise your decisions and see why they matter.</p>{story.finale.map((q) => <fieldset key={q.id}><legend>{q.prompt}</legend>{q.options.map((option, choice) => <label key={option.label}><input type="radio" name={q.id} checked={journal.choices[q.id] === choice} onChange={() => setJournal((j) => ({ ...j, choices: { ...j.choices, [q.id]: choice } }))} />{option.label}</label>)}{journal.choices[q.id] !== undefined ? <p className="owner-feedback" role="status">{q.options[journal.choices[q.id]].feedback}</p> : null}</fieldset>)}{answered ? <div className="owner-resolution" role="status"><h3>{supported ? "The clues become a recovery plan" : "The investigation has unfinished business"}</h3><p>{supported ? "You seek fresh evidence, reject an unfinished save, and require a supported recovery. The owner’s contribution is a defensible plan, not a promise that every interruption disappears." : "Return to the responses above. An old report, an unfinished checkpoint, or unsupported membership can undermine the plan. Revisit the characters and try again."}</p><p>If a usable save or compatible capacity is missing, the team must report that recovery is blocked. This exercise does not execute a compound failure simulation.</p></div> : null}</div> : null}
      {chapterId === "dawn" ? <div className="owner-pack panel"><h2>Your owner’s action pack</h2><p>{path === "build" ? "Bring this to your next design or procurement review." : path === "operate" ? "Bring this to your next operating review or recovery drill." : "Use this to begin a grounded conversation with a datacenter team."}</p>
        <ul>{(path === "build" ? ["Ask for a dependency map covering power, cooling, network, storage, and jobs.", "Ask vendors which telemetry, lifecycle records, and recovery capabilities they actually provide.", "Require a demonstrated checkpoint restore and failure-response drill before launch.", "Review capacity and compatible spare assumptions with engineering specialists."] : ["Review an incident where the first diagnosis changed after new evidence.", "Demonstrate restoration from a verified checkpoint, including rejection of an incomplete save.", "Inspect stale-data handling and independent liveness checks.", "Review return-to-service qualification and compatible spare capacity."]).map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>Questions to carry into the room</h3><ul>{story.characters.map((c) => <li key={c.id}><strong>{c.name}:</strong> {c.question}</li>)}</ul>
        <label htmlFor="owner-note">My next conversation: what evidence is missing, who should bring it, and what should they demonstrate?</label><textarea id="owner-note" rows={5} maxLength={10000} value={journal.note} onChange={(e) => setJournal((j) => ({ ...j, note: e.target.value }))} />
        <p className="muted">{storageAvailable ? "Reading progress, exercise responses, and notes stay in this browser. They are not sent to a service." : "Browser storage is unavailable. Keep this page open or print your notes before leaving."}</p>
        <div className="owner-actions"><button type="button" onClick={() => window.print()}>Print my action pack</button><button type="button" onClick={() => setJournal({ ...blank, path })}>Clear my progress and notes</button></div>
        <p>These are learning prompts, not equipment-control instructions. Real procedures require site-specific evidence and qualified specialists.</p>
      </div> : null}
      <aside className="panel owner-next"><h2>{path === "build" ? "From the story to your first facility" : path === "operate" ? "From the story to your operating floor" : "Behind the scene"}</h2><p>{path === "build" ? "Ask what your design and suppliers must demonstrate before launch." : path === "operate" ? "Ask which existing practice or evidence gap this chapter suggests reviewing." : "Explore the supporting tool, then return here for the next act."}</p><Link to={`${chapter.route}?chapter=${chapter.id}&path=${path}`}>{chapter.routeLabel}</Link></aside>
      <footer className="owner-pagination">{index > 0 ? <Link to={chapterLink(story.chapters[index - 1].id, path)}>← Previous scene</Link> : <Link to="/">Choose my owner path</Link>}<button type="button" onClick={finishChapter}>{journal.completed.includes(chapter.id) ? "Chapter marked as read" : "Mark chapter as read"}</button>{index < story.chapters.length - 1 ? <Link to={chapterLink(story.chapters[index + 1].id, path)}>Continue: {story.chapters[index + 1].title} →</Link> : <Link to={`/journey?path=${path}`}>Return to the chapters</Link>}</footer>
    </> : <div className="owner-actions"><Link to="/portfolio">Explore the executive portfolio</Link><Link to="/stories">Browse the character questions</Link></div>}
  </section>;
}

export function OwnerJourneyContext() {
  const location = useLocation();
  if (location.pathname === "/" || location.pathname.startsWith("/journey")) return null;
  const query = new URLSearchParams(location.search);
  const source = story.chapters.find((c) => c.id === query.get("chapter"));
  const path = pathFrom(location.search) ?? "explore";
  return <aside className="owner-context" aria-label="Owner journey context"><div><strong>{source ? `A room in “${source.title}”` : "Behind the scenes of Baton"}</strong><p>Synthetic learning examples. Financial figures are illustrations; advanced diagnostics may be conceptual. {source ? source.question : "Follow the owner’s story to connect these tools and understand their limits."}</p></div><Link to={source ? chapterLink(source.id, path) : "/journey"}>{source ? "Return to my chapter" : "Start the owner’s story"}</Link></aside>;
}
