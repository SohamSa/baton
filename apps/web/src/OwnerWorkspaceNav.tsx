import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import story from "../../../content/owner-journey.json";
type Context = { chapter: string; path: string };
const key = "baton-workspace-context-v1";
function valid(v: Partial<Context> | null): Context { return { chapter: story.chapters.some(c => c.id === v?.chapter) ? v!.chapter! : "arrival", path: ["build", "operate", "explore"].includes(v?.path ?? "") ? v!.path! : "explore" }; }
function read(): Context { try { return valid(JSON.parse(localStorage.getItem(key) ?? "null")); } catch { return valid(null); } }
export function OwnerWorkspaceNav({ groups, theme, onTheme }: { groups: readonly { readonly category: string; readonly links: readonly (readonly string[])[] }[]; theme: string; onTheme: () => void }) {
 const location = useLocation(); const [saved, setSaved] = useState<Context>(read); const query = new URLSearchParams(location.search);
 const requested = location.pathname.startsWith("/journey/") ? location.pathname.split("/")[2] : query.get("chapter");
 const context = valid({chapter: requested ?? saved.chapter, path: query.get("path") ?? saved.path});
 useEffect(() => { setSaved(context); try { localStorage.setItem(key, JSON.stringify(context)); } catch { /* Navigation works without storage. */ } }, [context.chapter, context.path]);
 const suffix = `?chapter=${context.chapter}&path=${context.path}`;
 const practical = !["/", "/data"].includes(location.pathname) && !location.pathname.startsWith("/learn") && !location.pathname.startsWith("/journey");
 const links = [["/learn/basics","Basics"],["/learn/data","Data"],[`/journey/${context.chapter}`,"Story"],["/planner","Plan"],["/desk","Rehearse"],["/dispatch","Operations"],["/worksheet","My review"]];
 return <header className="workspace-header"><div className="workspace-brand"><NavLink to="/">Baton</NavLink><span>Learn, plan, and practise in one workspace</span><button type="button" onClick={onTheme}>{theme === "dark" ? "Light theme" : "Dark theme"}</button></div>
 <nav className="workspace-navigation" aria-label="Owner workspace">{links.map(([route,label]) => <NavLink key={label} to={route+suffix} className={({isActive}) => isActive || (label === "Basics" && location.pathname === "/") || (label === "Data" && location.pathname === "/data") ? "active" : ""}>{label}</NavLink>)}
 <details key={location.pathname} className="workspace-tools"><summary>More tools</summary><div><NavLink to={"/portfolio"+suffix}>Executive overview</NavLink><NavLink to={"/fleet"+suffix}>Facility map</NavLink><NavLink to={"/stories"+suffix}>Problem questions</NavLink>{groups.map(g => <section key={g.category}><strong>{g.category}</strong>{g.links.map(([route,label]) => <NavLink key={route} to={route+suffix}>{label}</NavLink>)}</section>)}</div></details></nav>
 {practical ? <p className="workspace-return"><NavLink to={`/journey/${context.chapter}?path=${context.path}`}>Return to my story</NavLink><span>Fictional planning and rehearsal tools; real equipment is not connected.</span></p> : null}</header>;
}
