import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import foundations from "../../../content/owner-foundations.json";
import story from "../../../content/owner-journey.json";
import { CatalogAtlas } from "./api";

type FieldDefinition = { field_id: string; entity: string; name: string; meaning: string; unit: string; role: string; null_semantics: string; generating_mechanism: string; consumer: string; leakage: string };
type ReadingCatalog = { atlas: CatalogAtlas; fields: FieldDefinition[] };
function focusReading() {
  window.scrollTo({ top: 0, behavior: "instant" });
  document.getElementById("reading-title")?.focus({ preventScroll: true });
}

export function OwnerBasics() {
  useEffect(() => { document.title = "Understand the world · Baton"; focusReading(); }, []);
  return <section className="owner-story owner-reading">
    <header className="owner-masthead"><p className="eyebrow">Start here · The basics</p><h1 id="reading-title" tabIndex={-1}>{foundations.basicsTitle}</h1><p className="lede">{foundations.basicsIntro}</p></header>
    <p className="owner-boundary">Baton uses fictional facilities and synthetic evidence. It teaches reasoning; real designs and operating procedures need site-specific engineering.</p>
    <article className="foundation-basics">{foundations.basics.map((b) => <section key={b.term}><h2>{b.term}</h2><p>{b.explanation}</p></section>)}</article>
    <footer className="owner-pagination"><span>Next, learn what the data can tell you.</span><Link className="owner-button" to="/learn/data">Continue to the data catalog →</Link></footer>
  </section>;
}

export function OwnerDataIntroduction() {
  const location = useLocation();
  const [catalog, setCatalog] = useState<ReadingCatalog | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { document.title = "Read the evidence · Baton"; focusReading(); }, []);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    fetch(`${import.meta.env.BASE_URL}learning-catalog.json?v=1`, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error("Catalog definitions could not be loaded."); return r.json() as Promise<ReadingCatalog>; })
      .then(setCatalog).catch((e: Error) => { if (e.name !== "AbortError") setError(e.message); });
    return () => controller.abort();
  }, [attempt]);
  const search = query.trim().toLowerCase();
  const tables = catalog?.atlas.tables.map((t) => ({ ...t, columns: catalog.fields.filter((f) => f.entity === t.id && (role === "all" || f.role === role) && (!search || `${t.title} ${t.id} ${f.name} ${f.meaning}`.toLowerCase().includes(search))) })).filter((t) => t.columns.length) ?? [];
  const source = new URLSearchParams(location.search);
  const chapter = story.chapters.find((c) => c.id === source.get("chapter"));
  const path = source.get("path");
  const context = path === "build" || path === "operate" ? `?path=${path}` : "";
  const destination = chapter && location.pathname === "/data" ? `/journey/${chapter.id}${context}` : `/journey/arrival${context}`;
  return <section className="owner-story owner-reading">
    <header className="owner-masthead"><p className="eyebrow">Before the story · The evidence</p><h1 id="reading-title" tabIndex={-1}>{foundations.dataTitle}</h1><p className="lede">{foundations.dataIntro}</p></header>
    <article className="owner-prose">{foundations.dataPrinciples.map((p) => <p key={p}>{p}</p>)}</article>
    <h2>Start with these questions</h2><div className="foundation-essentials">{foundations.essentials.map((e) => <section key={e.label}><h3>{e.label}</h3><p>{e.why}</p><p className="muted">Field names: {e.fields.map((f, i) => <span key={f}>{i ? ", " : ""}<code>{f}</code></span>)}</p></section>)}</div>
    <details className="reading-extra foundation-catalog"><summary>Explore the full catalog here</summary>
      <p>These are definitions exported from the Python catalog, not live readings. Evaluator fields are identified for understanding the dictionary; their values are not exposed here.</p>
      {error ? <p role="alert">{error} <button type="button" onClick={() => setAttempt((a) => a + 1)}>Retry catalog loading</button></p> : !catalog ? <p role="status">Loading catalog definitions…</p> : <>
        <p>{catalog.atlas.table_count} tables · {catalog.atlas.column_count} field definitions. Table identifiers group the fields below.</p>
        <label>Find a field, topic, or table<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <label>Field role<select aria-label="Field role" value={role} onChange={(e) => setRole(e.target.value)}><option value="all">All definitions</option>{[...new Set(catalog.fields.map((f) => f.role))].sort().map((r) => <option key={r} value={r}>{r.replaceAll("_", " ")}</option>)}</select></label>
        <p role="status">{tables.reduce((n, t) => n + t.columns.length, 0)} matching fields in {tables.length} tables.</p>
        {tables.length === 0 ? <p>No definitions match. Try a broader term or another role.</p> : null}
        {tables.map((t) => <details key={t.id} className="reading-problem"><summary>{t.title} · {t.columns.length} fields</summary><p>{t.plain}</p><p>Table: <code>{t.id}</code>. Records connect through {t.joins_on}. Potential real-world source: {t.real_world}</p>
          <div className="owner-table-scroll"><table><caption>Definitions in {t.title}</caption><thead><tr><th>Field and role</th><th>Meaning and unit</th><th>Why it matters</th><th>Missing information</th></tr></thead><tbody>{t.columns.map((f) => <tr key={f.field_id}><td><code>{f.name}</code><br />{f.role.replaceAll("_", " ")}</td><td>{f.meaning}<br />Unit: {f.unit}</td><td>{catalog.atlas.tables.find((source) => source.id === t.id)?.columns.find((column) => column.name === f.name)?.impact}<br />Consumer: {f.consumer}</td><td>{f.null_semantics}</td></tr>)}</tbody></table></div>
        </details>)}
      </>}
    </details>
    <footer className="owner-pagination"><Link to="/learn/basics">← Revisit the basics</Link><Link className="owner-button" to={destination}>{chapter && location.pathname === "/data" ? "Return to my reading" : "Continue to the story"} →</Link></footer>
  </section>;
}
