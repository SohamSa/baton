import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import story from "../../../content/owner-journey.json";

const KEY = "baton-facility-worksheet-v1";
const STATUSES = [
  ["unknown", "Unknown — evidence not yet requested"],
  ["reported", "Team reports a demonstration — review its record"],
  ["gap", "A gap is reported — clarify the response"],
  ["planned", "Planned — demonstration has not happened"],
] as const;
type Answer = { status: string; notes: string; responsible: string; next: string };
type Worksheet = { version: 1; stage: string; name: string; jobSize: string; answers: Record<string, Answer> };
const emptyAnswer = (): Answer => ({ status: "unknown", notes: "", responsible: "", next: "" });
const blank = (): Worksheet => ({ version: 1, stage: "build", name: "", jobSize: "", answers: Object.fromEntries(story.worksheet.topics.map((t) => [t.id, emptyAnswer()])) });
function read(): Worksheet {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (saved?.version !== 1) return blank();
    const text = (v: unknown) => typeof v === "string" ? v.slice(0, 5000) : "";
    return { version: 1, stage: saved.stage === "operate" ? "operate" : "build", name: text(saved.name), jobSize: /^\d+$/.test(saved.jobSize ?? "") ? saved.jobSize : "", answers: Object.fromEntries(story.worksheet.topics.map((t) => {
      const a = saved.answers?.[t.id];
      return [t.id, { status: STATUSES.some(([s]) => s === a?.status) ? a.status : "unknown", notes: text(a?.notes), responsible: text(a?.responsible), next: text(a?.next) }];
    })) };
  } catch { return blank(); }
}
function download(filename: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function OwnerWorksheet() {
  const location = useLocation();
  const [worksheet, setWorksheet] = useState<Worksheet>(read);
  const [persisted, setPersisted] = useState(true);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(worksheet)); setPersisted(true); } catch { setPersisted(false); } }, [worksheet]);
  const answer = (id: string, changes: Partial<Answer>) => setWorksheet((w) => ({ ...w, answers: { ...w.answers, [id]: { ...w.answers[id], ...changes } } }));
  const pending = story.worksheet.topics.filter((t) => worksheet.answers[t.id].status !== "reported");
  const requested = new URLSearchParams(location.search).get("chapter");
  const chapter = story.chapters.some((c) => c.id === requested) ? requested : "dawn";
  function exportReview() {
    const lines = [`# ${story.worksheet.title}`, "", `Facility label: ${worksheet.name || "Not supplied"}`, `Situation: ${worksheet.stage}`, `Affected job size: ${worksheet.jobSize || "Unknown"}`, "", "Owner-reported worksheet. No readiness certification, risk prediction, or engine configuration is implied.", ""];
    for (const topic of story.worksheet.topics) {
      const a = worksheet.answers[topic.id];
      lines.push(`## ${topic.title}`, topic.question, `Status: ${STATUSES.find(([s]) => s === a.status)?.[1]}`, `Evidence to request: ${topic.records.join(", ")}`, `Suggested team: ${topic.owner}`, `Responsible person/team: ${a.responsible || "Not assigned"}`, `Record reference and uncertainty: ${a.notes || "No record supplied"}`, `Next demonstration: ${a.next || topic.request}`, "Relevant learning scenes:");
      for (const id of topic.characters) lines.push(`- ${story.characters.find((c) => c.id === id)?.name}: https://sohamsa.github.io/baton/#/desk?scenario=${id}`);
      lines.push("");
    }
    download("baton-facility-review.md", lines.join("\n"), "text/markdown;charset=utf-8");
  }
  return <section className="owner-worksheet owner-story">
    <p className="eyebrow">From the movie to your own review</p><h1>{story.worksheet.title}</h1><p className="lede">{story.worksheet.intro}</p>
    <section className="panel"><h2>Your review context</h2><div className="owner-inputs">
      <label>Facility or review label<input maxLength={200} value={worksheet.name} onChange={(e) => setWorksheet((w) => ({ ...w, name: e.target.value }))} /></label>
      <label>My situation<select aria-label="My situation" value={worksheet.stage} onChange={(e) => setWorksheet((w) => ({ ...w, stage: e.target.value }))}><option value="build">Planning or building</option><option value="operate">Operating existing equipment</option></select></label>
      <label>Accelerators in the affected job, if known<input type="number" min="1" step="1" value={worksheet.jobSize} onChange={(e) => { const value=e.target.value; if (value === "" || /^\d+$/.test(value) && Number(value)>0) setWorksheet((w) => ({ ...w, jobSize: value })); }} /></label>
    </div><p>Your facility details are separate from the fictional planning example. They do not resize or calibrate a rehearsal.</p></section>
    <section className="panel"><h2>Evidence still to obtain</h2><p>{pending.length} of {story.worksheet.topics.length} topics have unknown, planned, or reported-gap status. This counts your answers; it is not a facility score.</p><ul>{pending.map((t) => <li key={t.id}><a href={`#worksheet-${t.id}`} onClick={(e)=>{e.preventDefault();document.getElementById(`worksheet-${t.id}`)?.scrollIntoView({behavior:"smooth"});}}>{t.title}</a> — suggested team: {t.owner}</li>)}</ul><p>A reported demonstration still needs its record reviewed. A green answer is not independent validation.</p></section>
    {story.worksheet.topics.map((topic) => {
      const a = worksheet.answers[topic.id];
      return <section className="panel worksheet-topic" id={`worksheet-${topic.id}`} key={topic.id}>
        <h2>{topic.title}</h2><p>{topic.question}</p><p><strong>Ask for:</strong> {topic.request}</p><p><strong>Records:</strong> {topic.records.join(", ")}. <strong>Suggested team:</strong> {topic.owner}.</p>
        <div className="worksheet-form"><label>Evidence status — {topic.title}<select value={a.status} onChange={(e) => answer(topic.id, { status: e.target.value })}>{STATUSES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Who will bring the evidence? — {topic.title}<input maxLength={500} value={a.responsible} onChange={(e) => answer(topic.id, { responsible: e.target.value })} /></label>
        <label>Record reference, date, and unresolved questions — {topic.title}<textarea rows={3} maxLength={5000} value={a.notes} onChange={(e) => answer(topic.id, { notes: e.target.value })} /></label>
        <label>Next demonstration to request — {topic.title}<textarea rows={2} maxLength={5000} value={a.next} onChange={(e) => answer(topic.id, { next: e.target.value })} /></label></div>
        <div className="worksheet-print-notes"><p>Status: {STATUSES.find(([s])=>s===a.status)?.[1]}</p><p>Responsible: {a.responsible||"Not assigned"}</p><p>Evidence: {a.notes||"No record supplied"}</p><p>Next: {a.next||topic.request}</p></div>
        <h3>Rehearse this question</h3><div className="owner-actions">{topic.characters.map((id) => { const c = story.characters.find((c) => c.id === id)!; return <Link key={id} to={`/desk?scenario=${id}&chapter=${c.chapter}&path=${worksheet.stage === "build" ? "build" : "operate"}`}>{c.name}</Link>; })}</div>
      </section>;
    })}
    <section className="panel"><h2>Take the review to your team</h2><p>{persisted ? "Answers stay in this browser and are not sent to the API. Export a copy to keep or share your review." : "Browser storage is unavailable. Export or print before leaving this page."}</p><div className="owner-actions"><button type="button" onClick={exportReview}>Download my review</button><button type="button" onClick={() => download("baton-facility-worksheet.json", JSON.stringify(worksheet,null,2), "application/json")}>Download my worksheet data</button><button type="button" onClick={() => window.print()}>Print my facility review</button><button type="button" onClick={() => setWorksheet(blank())}>Clear my facility worksheet</button><Link to={`/journey/${chapter}?path=${worksheet.stage === "build" ? "build" : "operate"}`}>Return to my chapter</Link></div></section>
  </section>;
}
