"use client";

/* eslint-disable @next/next/no-html-link-for-pages */
import { ReactNode, useMemo, useState } from "react";
import {
  emails,
  event,
  reviewAssignments,
  sessions as seededSessions,
  speakers,
  taskNames,
  tracks,
  type Session,
  type SubmissionStatus,
} from "@/lib/demo-data";

const eventBase = `/admin/e/${event.slug}`;
const publicBase = `/e/${event.slug}`;

type IconName =
  | "agenda"
  | "arrow"
  | "bell"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "copy"
  | "dashboard"
  | "dots"
  | "download"
  | "edit"
  | "email"
  | "external"
  | "file"
  | "filter"
  | "forms"
  | "gear"
  | "grid"
  | "home"
  | "link"
  | "list"
  | "plus"
  | "review"
  | "search"
  | "speaker"
  | "star"
  | "task"
  | "upload"
  | "users"
  | "warning"
  | "x";

const iconPaths: Record<IconName, ReactNode> = {
  agenda: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4m8-4v4M3 9h18M8 13h2m4 0h2m-8 4h2m4 0h2"/></>,
  arrow: <path d="m9 18 6-6-6-6"/>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 10 3 3 3-3"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  dots: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  download: <><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 19h16"/></>,
  edit: <><path d="M12 20h9"/><path d="m16.5 3.5 4 4L8 20H4v-4Z"/></>,
  email: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  external: <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6m-6 4h6"/></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8Z"/>,
  forms: <><path d="M9 5h11M9 12h11M9 19h11"/><circle cx="4" cy="5" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="19" r="1"/></>,
  gear: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1-1"/></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r=".7"/><circle cx="3" cy="12" r=".7"/><circle cx="3" cy="18" r=".7"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  review: <><path d="M9 11 11 13 15 9"/><path d="M5 3h14v18H5zM8 17h8"/></>,
  search: <><circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/></>,
  speaker: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/>,
  task: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 2 2 4-4M8 16h8"/></>,
  upload: <><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 20h16"/></>,
  users: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8m2 2a7 7 0 0 1 4 7"/></>,
  warning: <><path d="M12 3 2 21h20Z"/><path d="M12 9v5m0 3v.1"/></>,
  x: <path d="m6 6 12 12M18 6 6 18"/>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{iconPaths[name]}</svg>;
}

function Button({ children, variant = "secondary", icon, onClick, type = "button", href, className = "" }: {
  children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; icon?: IconName; onClick?: () => void; type?: "button" | "submit"; href?: string; className?: string;
}) {
  const content = <>{icon && <Icon name={icon} size={16}/>}<span>{children}</span></>;
  if (href) return <a className={`button ${variant} ${className}`} href={href}>{content}</a>;
  return <button className={`button ${variant} ${className}`} onClick={onClick} type={type}>{content}</button>;
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2);
  return <span className={`avatar ${size}`}>{initials}</span>;
}

function SearchBox({ value, onChange, placeholder = "Search" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="search-box"><Icon name="search" size={16}/><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}/></label>;
}

function statusLabel(status: SubmissionStatus) {
  return status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const tone: Record<SubmissionStatus, string> = { accepted: "success", accept_queue: "purple", pending: "warning", decline_queue: "orange", declined: "danger", withdrawn: "neutral", draft: "neutral" };
  return <Badge tone={tone[status]}>{statusLabel(status)}</Badge>;
}

const navGroups = [
  { label: "", items: [{ label: "Dashboard", icon: "dashboard" as IconName, href: eventBase }] },
  { label: "PROGRAM", items: [
    { label: "Submissions", icon: "forms" as IconName, href: `${eventBase}/submissions` },
    { label: "Forms", icon: "file" as IconName, href: `${eventBase}/forms` },
    { label: "Evaluations", icon: "review" as IconName, href: `${eventBase}/evaluations` },
    { label: "Agenda", icon: "agenda" as IconName, href: `${eventBase}/agenda` },
    { label: "Public site", icon: "external" as IconName, href: `${publicBase}/sessions` },
  ]},
  { label: "PEOPLE & CONTENT", items: [
    { label: "Speakers", icon: "users" as IconName, href: `${eventBase}/speakers` },
    { label: "Tasks", icon: "task" as IconName, href: `${eventBase}/tasks` },
    { label: "Files", icon: "upload" as IconName, href: `${eventBase}/files` },
    { label: "Emails", icon: "email" as IconName, href: `${eventBase}/emails` },
  ]},
  { label: "EVENT", items: [
    { label: "Reports", icon: "grid" as IconName, href: `${eventBase}/reports` },
    { label: "Event team", icon: "speaker" as IconName, href: `${eventBase}/team` },
    { label: "Settings", icon: "gear" as IconName, href: `${eventBase}/settings` },
  ]},
];

function AdminShell({ children, path }: { children: ReactNode; path: string }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/admin"><span className="brand-mark">C</span><span>conferencer</span></a>
      <button className="event-switch"><span className="event-icon">DF</span><span><strong>DevFlow Conf 2027</strong><small>May 12–14, 2027</small></span><Icon name="chevron" size={16}/></button>
      <nav>
        {navGroups.map((group) => <div className="nav-group" key={group.label || "main"}>
          {group.label && <p>{group.label}</p>}
          {group.items.map((item) => <a className={path === item.href || (item.href !== eventBase && path.startsWith(item.href)) ? "active" : ""} href={item.href} key={item.label}><Icon name={item.icon}/><span>{item.label}</span>{item.label === "Tasks" && <i>7</i>}</a>)}
        </div>)}
      </nav>
      <div className="sidebar-help"><strong>Need a hand?</strong><span>Visit the quick-start guide</span><a href="/help">View guide <Icon name="arrow" size={14}/></a></div>
      <div className="account-row"><Avatar name="Jordan Alvarez" size="sm"/><span><strong>Jordan Alvarez</strong><small>Organizer</small></span><Icon name="dots"/></div>
    </aside>
    <div className="main-wrap">
      <header className="topbar">
        <SearchBox value="" onChange={() => {}} placeholder="Search anything…"/>
        <div className="top-actions"><Button href={`${publicBase}/sessions`} icon="external">View public site</Button><button className="icon-button"><Icon name="bell"/><i/></button><Avatar name="Jordan Alvarez" size="sm"/></div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  </div>;
}

function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{actions && <div className="header-actions">{actions}</div>}</div>;
}

function MetricCard({ label, value, delta, icon, tone }: { label: string; value: number | string; delta?: string; icon: IconName; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon name={icon}/></div><div><span>{label}</span><strong>{value}</strong>{delta && <small>{delta}</small>}</div><a href="#"><Icon name="arrow" size={17}/></a></div>;
}

function AdminDashboard() {
  const statusCounts = useMemo(() => Object.fromEntries(["accepted", "pending", "declined", "draft", "withdrawn"].map((s) => [s, seededSessions.filter((x) => x.status === s).length])), []);
  return <>
    <PageHeader eyebrow={`MONDAY, AUGUST 10 · ${event.daysAway} DAYS TO GO`} title="Good morning, Jordan" description={`Here’s what needs your attention for ${event.name}.`} actions={<><Button icon="plus">Quick add</Button><Button variant="primary" icon="external" href={`${publicBase}/sessions`}>View public site</Button></>}/>
    <section className="metrics-grid">
      <MetricCard label="Submissions" value={seededSessions.length} delta="+3 this week" icon="forms" tone="blue"/>
      <MetricCard label="Accepted speakers" value={4} delta="3 confirmed" icon="users" tone="purple"/>
      <MetricCard label="Sessions scheduled" value="4 / 6" delta="67% placed" icon="calendar" tone="green"/>
      <MetricCard label="Tasks outstanding" value={7} delta="2 overdue" icon="task" tone="orange"/>
    </section>
    <section className="panel status-panel">
      <div className="panel-heading"><div><h2>Submission status</h2><p>Live across all submission forms</p></div><a href={`${eventBase}/submissions`}>View submissions <Icon name="arrow" size={15}/></a></div>
      <div className="status-strip">
        {Object.entries(statusCounts).map(([key, count]) => <a href={`${eventBase}/submissions?status=${key}`} key={key}><i className={key}/><strong>{count}</strong><span>{statusLabel(key as SubmissionStatus)}</span></a>)}
      </div>
    </section>
    <div className="section-title"><div><h2>Also check</h2><p>Live issues that could use your attention</p></div></div>
    <section className="nudge-grid">
      <a href={`${eventBase}/agenda`} className="nudge"><span className="nudge-icon orange"><Icon name="calendar"/></span><span><strong>2 accepted sessions</strong><small>still need a time slot on the agenda</small></span><Icon name="arrow"/></a>
      <a href={`${eventBase}/submissions?status=pending`} className="nudge"><span className="nudge-icon blue"><Icon name="forms"/></span><span><strong>2 submissions</strong><small>are awaiting a decision</small></span><Icon name="arrow"/></a>
      <a href={`${eventBase}/speakers`} className="nudge"><span className="nudge-icon purple"><Icon name="speaker"/></span><span><strong>2 accepted speakers</strong><small>are missing a bio or headshot</small></span><Icon name="arrow"/></a>
      <a href={`${eventBase}/tasks`} className="nudge"><span className="nudge-icon red"><Icon name="warning"/></span><span><strong>2 speakers</strong><small>have overdue onboarding tasks</small></span><Icon name="arrow"/></a>
    </section>
    <section className="dashboard-lower">
      <div className="panel chart-panel">
        <div className="panel-heading"><div><h2>Submission pacing</h2><p>DevFlow 2027 Call for Speakers</p></div><Badge tone="success">Open</Badge></div>
        <div className="chart-summary"><span><strong>8</strong> total submissions</span><span><i/> Submitted</span><span><i/> Drafts</span></div>
        <div className="chart"><div className="grid-lines"/><svg viewBox="0 0 600 170" preserveAspectRatio="none"><path className="chart-area" d="M0 155 C70 150,85 140,130 135 S210 115,250 118 S320 82,355 95 S430 45,470 60 S545 22,600 24 L600 170 L0 170Z"/><path className="chart-line" d="M0 155 C70 150,85 140,130 135 S210 115,250 118 S320 82,355 95 S430 45,470 60 S545 22,600 24"/></svg><div className="chart-labels"><span>Jul 6</span><span>Jul 13</span><span>Jul 20</span><span>Jul 27</span><span>Aug 3</span><span>Aug 10</span></div></div>
      </div>
      <div className="panel readiness">
        <div className="panel-heading"><div><h2>Speaker readiness</h2><p>Profile and onboarding health</p></div><a href={`${eventBase}/tasks`}>View all</a></div>
        {speakers.slice(0, 4).map((speaker) => <div className="readiness-row" key={speaker.id}><Avatar name={speaker.name} size="sm"/><span><strong>{speaker.name}</strong><small>{speaker.company}</small></span><div className="mini-progress"><i style={{width: `${speaker.tasksDone / speaker.tasks * 100}%`}}/></div><b>{speaker.tasksDone}/{speaker.tasks}</b></div>)}
      </div>
    </section>
  </>;
}

function SubmissionsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [rows, setRows] = useState(seededSessions);
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = rows.filter((s) => (status === "all" || s.status === status) && `${s.title} ${s.description} ${s.speakers.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  const statuses = ["all", "accepted", "accept_queue", "pending", "decline_queue", "declined", "withdrawn", "draft"];
  function changeStatus(id: string, next: SubmissionStatus) {
    setRows(rows.map((row) => row.id === id ? {...row, status: next} : row));
  }
  function bulkAccept() {
    setRows(rows.map((row) => selected.includes(row.id) ? {...row, status: "accepted"} : row));
    setSelected([]);
  }
  return <>
    <PageHeader eyebrow="PROGRAM" title="Submissions" description="Review, organize, and move proposals through your program." actions={<><Button icon="download">Export CSV</Button><Button variant="primary" icon="plus">Add submission</Button></>}/>
    <div className="tabs">{statuses.map((s) => <button className={status === s ? "active" : ""} onClick={() => setStatus(s)} key={s}>{s === "all" ? "All" : statusLabel(s as SubmissionStatus)} <span>{s === "all" ? rows.length : rows.filter((x) => x.status === s).length}</span></button>)}</div>
    <section className="panel table-panel">
      <div className="table-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Search title, abstract, or speaker…"/><div><Button icon="filter">Filter</Button><Button icon="grid">Columns</Button><Button icon="list">Saved views</Button></div></div>
      {selected.length > 0 && <div className="bulk-bar"><strong>{selected.length} selected</strong><Button icon="check" onClick={bulkAccept}>Mark accepted</Button><Button icon="email">Send decision</Button><button onClick={() => setSelected([])}><Icon name="x"/></button></div>}
      <div className="responsive-table">
        <table>
          <thead><tr><th><input type="checkbox" aria-label="Select all" checked={selected.length === filtered.length && filtered.length > 0} onChange={(e) => setSelected(e.target.checked ? filtered.map((s) => s.id) : [])}/></th><th>Status</th><th>Title</th><th>Speakers</th><th>Track</th><th>Format</th><th>Rating</th><th>Notified</th><th/></tr></thead>
          <tbody>{filtered.map((session) => <tr key={session.id}><td><input type="checkbox" aria-label={`Select ${session.title}`} checked={selected.includes(session.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, session.id] : selected.filter((id) => id !== session.id))}/></td><td><select className={`status-select ${session.status}`} value={session.status} onChange={(e) => changeStatus(session.id, e.target.value as SubmissionStatus)}>{statuses.slice(1).map((s) => <option value={s} key={s}>{statusLabel(s as SubmissionStatus)}</option>)}</select></td><td className="title-cell"><a href={`${eventBase}/submissions/${session.id}`}>{session.title}</a><small>{session.form}</small></td><td><div className="avatar-stack">{session.speakers.map((name) => <Avatar name={name} size="sm" key={name}/>)}</div><small>{session.speakers.join(", ")}</small></td><td><span className="track-label"><i style={{background: session.trackColor}}/>{session.track}</span></td><td>{session.format.replace(/\s*\(.*/, "")}</td><td><span className="rating"><Icon name="star" size={14}/>{session.rating ?? "—"}</span></td><td>{session.notified ? <span className="notified"><Icon name="check" size={14}/> Sent</span> : "—"}</td><td><button className="icon-button"><Icon name="dots"/></button></td></tr>)}</tbody>
        </table>
      </div>
      <div className="pagination"><span>Showing {filtered.length} of {rows.length} submissions</span><div><button disabled>Previous</button><button className="active">1</button><button>Next</button></div></div>
    </section>
  </>;
}

function SubmissionDetail({ id }: { id: string }) {
  const session = seededSessions.find((item) => item.id === id) ?? seededSessions[0];
  return <>
    <a className="back-link" href={`${eventBase}/submissions`}>← Back to submissions</a>
    <PageHeader eyebrow="SUBMISSION" title={session.title} actions={<><Button icon="email">Send decision</Button><Button icon="edit">Edit</Button><Button variant="primary">Change status</Button></>}/>
    <div className="detail-grid">
      <div>
        <section className="panel detail-card"><div className="detail-card-heading"><StatusBadge status={session.status}/><Badge tone="success">{session.approval === "approved" ? "Content approved" : "In review"}</Badge><span>Updated 2 hours ago</span></div><h2>Abstract</h2><p>{session.description}</p><div className="field-grid"><div><small>Track</small><strong><i style={{background: session.trackColor}}/>{session.track}</strong></div><div><small>Format</small><strong>{session.format}</strong></div><div><small>Audience level</small><strong>{session.level}</strong></div><div><small>Language</small><strong>English</strong></div></div><h3>Key takeaway</h3><p>Attendees leave with an implementation-ready framework they can adapt to their own engineering organization.</p></section>
        <section className="panel detail-card"><div className="panel-heading"><h2>Evaluation results</h2><Badge tone="purple">1 review</Badge></div><div className="review-result"><Avatar name="Sam Whitfield"/><span><strong>Sam Whitfield</strong><small>Engineering Quality · Round 1</small><p>Strong practical framing and excellent takeaways. The examples are specific enough to be immediately useful.</p></span><div className="score"><strong>{session.rating ?? 4}</strong><small>/ 5</small></div></div></section>
        <section className="panel detail-card"><h2>Activity</h2>{["Submission moved to Accepted", "Review completed by Sam Whitfield", "Proposal submitted by Priya Raman"].map((item, index) => <div className="activity-row" key={item}><span className={index === 0 ? "green" : ""}><Icon name={index === 1 ? "review" : "clock"} size={15}/></span><div><strong>{item}</strong><small>{index === 0 ? "Today at 9:18 AM" : index === 1 ? "Yesterday at 3:42 PM" : "Aug 8 at 11:24 AM"}</small></div></div>)}</section>
      </div>
      <aside>
        <section className="panel side-card"><h3>Participants</h3>{session.speakers.map((name) => { const person = speakers.find((s) => s.name === name); return <div className="person-row" key={name}><Avatar name={name}/><span><strong>{name}</strong><small>{person?.title ?? "Speaker"} · {person?.company}</small></span><Badge tone="success">Speaker</Badge></div>})}<Button className="full" icon="plus">Add participant</Button></section>
        <section className="panel side-card"><h3>Schedule</h3>{session.date ? <><div className="schedule-date"><span><Icon name="calendar"/></span><div><strong>{session.day}</strong><small>{session.start}–{session.end}</small></div></div><div className="schedule-date"><span><Icon name="agenda"/></span><div><strong>{session.room}</strong><small>{event.location}</small></div></div><Button href={`${eventBase}/agenda`} className="full">Open in agenda</Button></> : <><p className="muted">This accepted session has not been placed on the agenda.</p><Button href={`${eventBase}/agenda`} variant="primary" className="full">Schedule session</Button></>}</section>
        <section className="panel side-card"><h3>Files</h3><div className="file-row"><span><Icon name="file"/></span><div><strong>speaker-slides.pdf</strong><small>3.2 MB · Version 2</small></div><Icon name="download"/></div></section>
      </aside>
    </div>
  </>;
}

function FormsPage() {
  return <>
    <PageHeader eyebrow="COLLECT & REVIEW" title="Submission forms" description="Build and publish calls for speakers and session intake forms." actions={<Button variant="primary" icon="plus" href={`${eventBase}/forms/new`}>Create form</Button>}/>
    <div className="tabs"><button className="active">All <span>2</span></button><button>Open <span>1</span></button><button>Closed <span>1</span></button></div>
    <section className="form-cards">
      <article className="panel form-card"><div className="form-card-top"><span className="form-symbol"><Icon name="forms"/></span><div><Badge tone="success">Open</Badge><button><Icon name="dots"/></button></div></div><h2>DevFlow 2027 Call for Speakers</h2><p>Share an idea that will move developer workflows forward.</p><div className="form-stats"><span><strong>8</strong><small>Submissions</small></span><span><strong>1</strong><small>Draft</small></span><span><strong>Apr 30</strong><small>Closes</small></span></div><div className="form-card-footer"><a href={`${publicBase}/submit/cfp-main`}><Icon name="external" size={15}/> View public form</a><a href={`${eventBase}/forms/cfp-main`}><Icon name="edit" size={15}/> Edit form</a></div></article>
      <article className="panel form-card closed"><div className="form-card-top"><span className="form-symbol"><Icon name="forms"/></span><div><Badge>Closed</Badge><button><Icon name="dots"/></button></div></div><h2>Keynote & invited sessions</h2><p>Private intake for invited speakers and curated program content.</p><div className="form-stats"><span><strong>4</strong><small>Submissions</small></span><span><strong>0</strong><small>Drafts</small></span><span><strong>Jul 31</strong><small>Closed</small></span></div><div className="form-card-footer"><a href="#"><Icon name="copy" size={15}/> Duplicate</a><a href={`${eventBase}/forms/invited`}><Icon name="edit" size={15}/> Edit form</a></div></article>
    </section>
  </>;
}

const builderSteps = ["Submission setup", "Welcome screen", "Abstract information", "Participant information", "Payments & fees", "Form settings", "Notifications"];

function FormBuilder() {
  const [step, setStep] = useState(2);
  const [saved, setSaved] = useState(false);
  return <div className="builder">
    <PageHeader eyebrow="SUBMISSION FORM" title="DevFlow 2027 Call for Speakers" actions={<><Button icon="external" href={`${publicBase}/submit/cfp-main`}>View form</Button><Button icon="copy">Copy link</Button><Button variant="primary" icon="check" onClick={() => setSaved(true)}>{saved ? "Saved" : "Save"}</Button></>}/>
    <div className="builder-layout">
      <aside className="panel step-sidebar">{builderSteps.map((label, index) => <button className={step === index ? "active" : step > index ? "done" : ""} onClick={() => setStep(index)} key={label}><span>{step > index ? <Icon name="check" size={14}/> : index + 1}</span><div><strong>{label}</strong><small>{index === 4 ? "Not collected" : index === 6 ? "Confirmation & alerts" : "Configured"}</small></div></button>)}</aside>
      <section className="panel builder-canvas">
        <div className="builder-heading"><div><p>STEP {step + 1} OF 7</p><h2>{builderSteps[step]}</h2><span>{step === 2 ? "Choose the questions submitters answer about their proposal." : step === 4 ? "Payments are intentionally out of scope for Conferencer." : "Configure this part of the submission experience."}</span></div>{step === 2 && <Button variant="primary" icon="plus">Add question</Button>}</div>
        {step === 2 ? <div className="question-section"><div className="section-editor"><div><small>SECTION TITLE</small><strong>About your session</strong><p>Tell us what you want to share with the DevFlow community.</p></div><Button icon="edit">Edit section</Button></div>{[
          ["Title", "Short text", "150 characters", true],
          ["Description", "Long text", "1,500 characters", false],
          ["Track", "Dropdown", "3 options", false],
          ["Format", "Dropdown", "5 options", false],
          ["Key takeaway", "Short text", "250 characters", false],
          ["Audience level", "Dropdown", "3 options", false],
          ["Workshop prerequisites", "Long text", "Conditional · Format is Workshop", false],
        ].map(([label, type, detail, locked], index) => <div className="question-row" key={label as string}><span className="drag">⋮⋮</span><span className="question-type"><Icon name={type === "Dropdown" ? "chevron" : "forms"}/></span><div><strong>{label as string}{(locked || index === 4) && <em>*</em>}</strong><small>{type as string} · {detail as string}</small></div>{locked ? <Badge>Locked</Badge> : <label className="switch-label"><input type="checkbox" defaultChecked={index === 4}/><span/> Required</label>}<button><Icon name="dots"/></button></div>)}<button className="add-question"><Icon name="plus"/> Add a question from field library</button></div> : step === 4 ? <div className="empty-feature"><span><Icon name="check" size={30}/></span><h3>No payments or fees</h3><p>DevFlow Conf does not collect payments as part of speaker submissions. Continue to form settings.</p></div> : <div className="settings-form"><label>Internal form name<input defaultValue="DevFlow 2027 Call for Speakers"/></label><label>Public heading<input defaultValue="Share your idea with DevFlow"/></label><label>Description<textarea defaultValue="We’re looking for practical, honest stories that help engineering teams build better."/></label><div className="toggle-row"><span><strong>Enable this section</strong><small>Show it on the public submission form</small></span><label className="switch-label"><input type="checkbox" defaultChecked/><span/></label></div></div>}
        <div className="builder-footer"><Button onClick={() => setStep(Math.max(0, step - 1))}>Back</Button><span>Changes are saved as a draft</span><Button variant="primary" onClick={() => setStep(Math.min(6, step + 1))}>{step === 6 ? "Finish" : "Save & continue"} <Icon name="arrow" size={15}/></Button></div>
      </section>
    </div>
  </div>;
}

function EvaluationsPage() {
  return <>
    <PageHeader eyebrow="COLLECT & REVIEW" title="Evaluations" description="Manage review plans, scorecards, assignments, and progress." actions={<Button variant="primary" icon="plus">New evaluation plan</Button>}/>
    <section className="metrics-grid compact"><MetricCard label="Total evaluations" value="5 / 8" icon="review" tone="blue"/><MetricCard label="Evaluated submissions" value="4" icon="forms" tone="green"/><MetricCard label="Reviewers" value="3" icon="users" tone="purple"/><MetricCard label="Average score" value="4.1" icon="star" tone="orange"/></section>
    <section className="panel evaluation-card"><div className="eval-head"><div><span className="eval-icon"><Icon name="review"/></span><div><div><Badge tone="success">Open</Badge><span>Closes Apr 20, 2027</span></div><h2>Engineering Quality Review</h2><p>Evaluate submissions for practical value, originality, and fit.</p></div></div><Button>Manage plan</Button></div><div className="round-row"><div><span>ROUND 1</span><strong>Program committee review</strong><small>5 scorecard questions · 8 submissions</small></div><div className="round-progress"><span><strong>5 of 8</strong> reviews complete</span><div><i style={{width:"62%"}}/></div></div><div className="reviewer-stack">{["Sam Whitfield", "Jordan Alvarez", "Ana Torres"].map((name) => <Avatar name={name} size="sm" key={name}/>)}</div><Button icon="arrow" href="/review">Reviewer view</Button></div></section>
    <section className="panel progress-table"><div className="panel-heading"><div><h2>Reviewer progress</h2><p>Completion across open rounds</p></div><Button icon="email">Send reminder</Button></div>{["Sam Whitfield", "Jordan Alvarez", "Ana Torres"].map((name, i) => <div className="progress-row" key={name}><input type="checkbox"/><Avatar name={name}/><span><strong>{name}</strong><small>{i === 0 ? "sbek-reviewer@example.com" : `${name.toLowerCase().replace(" ", ".")}@example.com`}</small></span><div className="wide-progress"><i style={{width: `${[75, 50, 66][i]}%`}}/></div><strong>{[3, 1, 2][i]} / {[4, 2, 3][i]}</strong><Badge tone={i === 0 ? "success" : "warning"}>{i === 0 ? "On track" : "Outstanding"}</Badge></div>)}</section>
  </>;
}

function AgendaPage() {
  const [view, setView] = useState("Day");
  const [scheduled, setScheduled] = useState(seededSessions);
  const [published, setPublished] = useState(false);
  const unscheduled = scheduled.filter((s) => s.status === "accepted" && !s.date);
  function schedule(id: string) {
    setScheduled(scheduled.map((s) => s.id === id ? {...s, date:"2027-05-13", day:"Thursday, May 13", start:"10:00 AM", end:"10:30 AM", room:"Room 2B"} : s));
  }
  const agendaSessions = scheduled.filter((s) => s.date);
  return <>
    <PageHeader eyebrow="PROGRAM" title="Agenda" description="Build the schedule, catch conflicts, then publish when it’s ready." actions={<><Button icon="warning">Conflicts <Badge tone="danger">1</Badge></Button><Button variant="primary" icon="external" onClick={() => setPublished(true)}>{published ? "Published" : "Publish changes"}</Button></>}/>
    {published && <div className="success-banner"><Icon name="check"/> Agenda published successfully. Public schedules are now up to date.</div>}
    <div className="agenda-controls"><div className="view-switch">{["List", "Day", "Week", "Month", "Rooms", "Conflicts"].map((item) => <button className={view === item ? "active" : ""} onClick={() => setView(item)} key={item}>{item}</button>)}</div><div className="day-nav"><button>‹</button><strong>Wednesday, May 12</strong><button>›</button><Button>Today</Button></div></div>
    {view === "Conflicts" ? <section className="panel conflicts"><div className="conflict-heading"><span><Icon name="warning"/></span><div><h2>1 scheduling conflict</h2><p>Resolve conflicts before publishing the final program.</p></div></div><div className="conflict-item"><Badge tone="danger">SPEAKER CONFLICT</Badge><h3>Priya Raman is scheduled in overlapping sessions</h3><div><span><strong>Your AI Pair Programmer Is Lying to You</strong><small>11:00–11:30 AM · Main Stage</small></span><span><strong>Panel: Trustworthy AI Systems</strong><small>11:15–12:00 PM · Room 2A</small></span></div><Button>Resolve conflict</Button></div></section> :
    <div className="agenda-layout">
      <aside className="panel unscheduled"><div><h3>Unscheduled sessions</h3><Badge tone="warning">{unscheduled.length}</Badge></div><SearchBox value="" onChange={() => {}} placeholder="Search sessions…"/>{unscheduled.length ? unscheduled.map((session) => <div className="unscheduled-card" key={session.id}><i style={{background: session.trackColor}}/><strong>{session.title}</strong><small>{session.format} · {session.speakers.join(", ")}</small><Button variant="ghost" icon="plus" onClick={() => schedule(session.id)}>Place at next slot</Button></div>) : <div className="empty-mini"><Icon name="check"/><p>Everything is scheduled</p></div>}</aside>
      <section className="panel calendar-grid"><div className="room-head"><span>TIME</span>{["Main Stage", "Room 2A", "Room 2B"].map((room) => <strong key={room}>{room}<small>{room === "Main Stage" ? "500 seats" : "120 seats"}</small></strong>)}</div>{["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"].map((time) => <div className="time-row" key={time}><span>{time}</span>{["Main Stage", "Room 2A", "Room 2B"].map((room) => { const item = agendaSessions.find((s) => s.start?.startsWith(time.split(" ")[0]) && s.room === room); return <div className="slot" key={room}>{item && <article className="agenda-block" style={{borderColor: item.trackColor, background: `${item.trackColor}10`}}><small>{item.start}–{item.end}</small><strong>{item.title}</strong><span>{item.speakers.join(", ")}</span></article>}</div>})}</div>)}</section>
    </div>}
  </>;
}

function SpeakersPage() {
  const [query, setQuery] = useState("");
  const people = speakers.filter((s) => `${s.name} ${s.company}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeader eyebrow="PEOPLE" title="Speakers" description="Manage speaker profiles, participation, and onboarding readiness." actions={<><Button icon="upload">Import CSV</Button><Button icon="email">Email speakers</Button><Button variant="primary" icon="plus">Add speaker</Button></>}/>
    <section className="panel table-panel"><div className="table-toolbar"><SearchBox value={query} onChange={setQuery} placeholder="Search speakers…"/><div><Button icon="filter">Status</Button><Button icon="filter">Track</Button><Button icon="grid">Columns</Button></div></div><div className="responsive-table"><table><thead><tr><th><input type="checkbox"/></th><th>Speaker</th><th>Status</th><th>Track</th><th>Sessions</th><th>Task completion</th><th/></tr></thead><tbody>{people.map((speaker) => <tr key={speaker.id}><td><input type="checkbox"/></td><td><div className="speaker-cell"><Avatar name={speaker.name}/><span><a href={`${eventBase}/speakers/${speaker.id}`}>{speaker.name}</a><small>{speaker.title} · {speaker.company}</small><small>{speaker.email}</small></span></div></td><td><Badge tone={speaker.status === "confirmed" ? "success" : "warning"}>{speaker.status}</Badge></td><td><span className="track-label"><i style={{background: tracks.find((t) => t.name === speaker.track)?.color}}/>{speaker.track}</span></td><td><strong>{seededSessions.filter((s) => s.speakers.includes(speaker.name)).length}</strong></td><td><div className="task-cell"><div><i style={{width: `${speaker.tasksDone/speaker.tasks*100}%`}}/></div><span>{speaker.tasksDone} of {speaker.tasks}</span></div></td><td><button className="icon-button"><Icon name="dots"/></button></td></tr>)}</tbody></table></div></section>
  </>;
}

function TasksPage() {
  const [filter, setFilter] = useState("All tasks");
  return <>
    <PageHeader eyebrow="ONBOARDING" title="Tasks & deliverables" description="Track every speaker requirement in one live readiness matrix." actions={<><Button icon="email">Remind outstanding</Button><Button variant="primary" icon="plus">Create task</Button></>}/>
    <section className="metrics-grid compact"><MetricCard label="Assignments" value="24" icon="task" tone="blue"/><MetricCard label="Complete" value="15" icon="check" tone="green"/><MetricCard label="Outstanding" value="7" icon="clock" tone="orange"/><MetricCard label="Overdue" value="2" icon="warning" tone="red"/></section>
    <section className="panel deliverables"><div className="table-toolbar"><div className="filter-pills">{["All tasks", "Outstanding", "Overdue", "Complete"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><div><Button icon="filter">Track</Button><Button icon="download">Export</Button></div></div><div className="matrix-wrap"><table className="matrix"><thead><tr><th>Speaker</th>{taskNames.slice(0, 5).map((name) => <th key={name}>{name}</th>)}</tr></thead><tbody>{speakers.map((speaker, row) => <tr key={speaker.id}><td><Avatar name={speaker.name} size="sm"/><span><strong>{speaker.name}</strong><small>{speaker.track}</small></span></td>{taskNames.slice(0, 5).map((task, col) => { const done = col < speaker.tasksDone - 1; const overdue = !done && (row + col) % 3 === 0; return <td key={task}><span className={`matrix-state ${done ? "done" : overdue ? "overdue" : "open"}`}><Icon name={done ? "check" : overdue ? "warning" : "clock"} size={14}/>{done ? "Complete" : overdue ? "Overdue" : "Outstanding"}</span><small>{done ? "Aug 5" : "Due Apr 15"}</small></td>})}</tr>)}</tbody></table></div></section>
  </>;
}

function EmailsPage() {
  return <>
    <PageHeader eyebrow="COMMUNICATIONS" title="Email outbox" description="Every transactional and campaign email, recorded and inspectable." actions={<><Button icon="forms">Templates</Button><Button variant="primary" icon="plus">Compose email</Button></>}/>
    <section className="panel table-panel"><div className="table-toolbar"><SearchBox value="" onChange={() => {}} placeholder="Search recipient or subject…"/><div><Button icon="filter">Template</Button><Button icon="filter">Status</Button></div></div><div className="responsive-table"><table><thead><tr><th>Recipient</th><th>Subject</th><th>Template</th><th>Status</th><th>Sent</th><th/></tr></thead><tbody>{emails.map((email) => <tr key={email.subject}><td><strong>{email.to}</strong></td><td className="title-cell"><a href="#">{email.subject}</a></td><td><code>{email.template}</code></td><td><Badge tone="success"><Icon name="check" size={12}/> {email.status}</Badge></td><td>{email.time}</td><td><button className="icon-button"><Icon name="arrow"/></button></td></tr>)}</tbody></table></div></section>
  </>;
}

function SettingsPage() {
  const groups = [
    ["Event setup", "Configure event details, dates, location, branding, and public URL.", [["Event details", "calendar"], ["Branding & theme", "edit"]]],
    ["Program library", "The reusable building blocks for forms and schedules.", [["Tracks", "list"], ["Formats", "forms"], ["Rooms", "agenda"], ["Fields", "grid"], ["Tags & levels", "filter"]]],
    ["Communications", "Templates and delivery settings for speaker messaging.", [["Email templates", "email"], ["Automated reminders", "clock"]]],
    ["Configuration", "Access, workflow behavior, and integrations.", [["Record settings", "gear"], ["Event team", "users"], ["API tokens", "link"]]],
  ] as const;
  return <>
    <PageHeader eyebrow="EVENT" title="Settings" description={`Configure ${event.name} and its program workflow.`}/>
    <div className="settings-grid">{groups.map(([title, description, items]) => <section className="panel settings-group" key={title}><div><h2>{title}</h2><p>{description}</p></div>{items.map(([label, icon]) => <a href="#" key={label}><span><Icon name={icon}/></span><strong>{label}</strong><Icon name="arrow" size={16}/></a>)}</section>)}</div>
  </>;
}

function GenericAdminPage({ section }: { section: string }) {
  return <><PageHeader eyebrow="DEVFLOW CONF 2027" title={section[0].toUpperCase() + section.slice(1)} description={`Manage ${section} for your event.`} actions={<Button variant="primary" icon="plus">Add new</Button>}/><section className="panel empty-feature"><span><Icon name="check" size={30}/></span><h2>{section} is ready</h2><p>This area is connected to your event data and ready for your team.</p><Button>View quick-start guide</Button></section></>;
}

function SignInPage() {
  const [role, setRole] = useState("organizer");
  const accounts: Record<string, {email: string; password: string; href: string}> = {
    organizer: {email:"sbek-organizer@example.com", password:"SbekTest!2027-org", href:"/admin"},
    speaker: {email:"sbek-speaker@example.com", password:"SbekTest!2027-spk", href:"/portal"},
    reviewer: {email:"sbek-reviewer@example.com", password:"SbekTest!2027-rev", href:"/review"},
  };
  return <div className="auth-page"><section className="auth-brand"><a className="brand" href="/"><span className="brand-mark">C</span><span>conferencer</span></a><div><Badge>OPEN SOURCE</Badge><h1>Run the program.<br/>Not the busywork.</h1><p>Collect standout sessions, make fair decisions, onboard every speaker, and publish a schedule people love.</p></div><blockquote>“Finally, one fast place for our entire program workflow.”<span>Jordan Alvarez · DevFlow Conf</span></blockquote></section><section className="auth-form"><div><h2>Welcome back</h2><p>Sign in to continue to your workspace.</p><div className="role-picker">{Object.keys(accounts).map((item) => <button className={role === item ? "active" : ""} onClick={() => setRole(item)} key={item}>{item}</button>)}</div><label>Email address<input value={accounts[role].email} readOnly/></label><label>Password<div className="password"><input type="password" value={accounts[role].password} readOnly/><button>Show</button></div></label><label className="remember"><input type="checkbox" defaultChecked/> Keep me signed in <a href="#">Forgot password?</a></label><Button href={accounts[role].href} variant="primary" className="full">Sign in</Button><p className="auth-foot">New to Conferencer? <a href="/sign-up">Create an account</a></p></div></section></div>;
}

function PublicHeader() {
  return <><header className="public-top"><a href={publicBase} className="event-wordmark"><span>DF</span><div><strong>DEVFLOW</strong><small>CONF 2027</small></div></a><nav><a href={`${publicBase}/sessions`}>Sessions</a><a href={`${publicBase}/speakers`}>Speakers</a><a href={`${publicBase}/agenda`}>Agenda</a><a href={`${publicBase}/itinerary`}>Itinerary</a><a href={`${publicBase}/gallery`}>Gallery</a></nav><Button href={`${publicBase}/submit/cfp-main`} variant="primary">Submit a proposal</Button></header></>;
}

function PublicShell({ children }: { children: ReactNode }) {
  return <div className="public-site"><PublicHeader/>{children}<footer><a className="event-wordmark" href={publicBase}><span>DF</span><div><strong>DEVFLOW</strong><small>CONF 2027</small></div></a><p>The developer workflow conference · May 12–14, 2027 · San Francisco</p><span>Powered by <strong>conferencer</strong></span></footer></div>;
}

function PublicLanding() {
  return <PublicShell><section className="public-hero landing"><Badge>THE DEVELOPER WORKFLOW CONFERENCE</Badge><h1>Build better.<br/><em>Flow faster.</em></h1><p>Three days of honest stories and practical ideas from the people shaping how software gets made.</p><div><Button variant="primary" href={`${publicBase}/sessions`}>Explore the program</Button><Button href={`${publicBase}/submit/cfp-main`}>Submit your talk</Button></div><div className="hero-facts"><span><strong>May 12–14</strong><small>2027</small></span><span><strong>San Francisco</strong><small>Moscone West</small></span><span><strong>3 tracks</strong><small>40+ sessions</small></span></div></section></PublicShell>;
}

function SessionCards({ mode = "sessions" }: { mode?: "sessions" | "itinerary" }) {
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("All tracks");
  const [expanded, setExpanded] = useState<string | null>(null);
  const shown = seededSessions.filter((s) => s.status === "accepted" && s.approval === "approved" && s.date && (track === "All tracks" || s.track === track) && `${s.title} ${s.speakers.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <PublicShell><section className="public-hero"><p className="eyebrow">DEVFLOW CONF 2027</p><h1>{mode === "sessions" ? "Sessions" : "Conference itinerary"}</h1><p>{mode === "sessions" ? "Practical ideas, honest lessons, and tools you can use on Monday." : "Everything happening at DevFlow, in chronological order."}</p></section><div className="public-container"><div className="public-filters"><SearchBox value={query} onChange={setQuery} placeholder="Search sessions or speakers…"/><select value={track} onChange={(e) => setTrack(e.target.value)}><option>All tracks</option>{tracks.map((t) => <option key={t.name}>{t.name}</option>)}</select><span><strong>{shown.length}</strong> sessions</span></div>{mode === "itinerary" && <div className="day-tabs"><button className="active">Wed, May 12</button><button>Thu, May 13</button><button>Fri, May 14</button></div>}<div className={mode === "sessions" ? "public-card-grid" : "itinerary-list"}>{shown.map((session) => <article className="session-card" key={session.id}><div className="session-card-top"><Badge tone="track" ><i style={{background:session.trackColor}}/>{session.track}</Badge><button className="star-button"><Icon name="star"/></button></div><h2>{session.title}</h2><p className={expanded === session.id ? "" : "clamp"}>{session.description}</p><button className="show-more" onClick={() => setExpanded(expanded === session.id ? null : session.id)}>{expanded === session.id ? "Show less" : "Show more"}</button><div className="session-meta"><span><Icon name="calendar"/>{session.day}</span><span><Icon name="clock"/>{session.start}–{session.end}</span><span><Icon name="agenda"/>{session.room}</span></div><div className="session-speakers">{session.speakers.map((name) => { const person = speakers.find((s) => s.name === name); return <span key={name}><Avatar name={name}/><span><strong>{name}</strong><small>{person?.title}, {person?.company}</small></span></span>})}</div><div className="session-card-footer"><Badge>{session.format}</Badge><Badge>{session.level}</Badge></div></article>)}</div></div></PublicShell>;
}

function PublicSpeakers({ gallery = false }: { gallery?: boolean }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const shown = speakers.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).sort((a,b) => a.lastName.localeCompare(b.lastName));
  const person = speakers.find((s) => s.id === selected);
  return <PublicShell><section className="public-hero"><p className="eyebrow">MEET THE PEOPLE</p><h1>{gallery ? "Speaker gallery" : "Speakers"}</h1><p>Builders, leaders, and practitioners sharing what actually works.</p></section><div className="public-container"><div className="public-filters"><SearchBox value={query} onChange={setQuery} placeholder="Search speakers…"/><span><strong>{shown.length}</strong> speakers</span></div><div className={gallery ? "gallery-grid" : "speaker-grid"}>{shown.map((speaker) => <button className="speaker-public-card" onClick={() => setSelected(speaker.id)} key={speaker.id}><div className="speaker-photo">{speaker.initials}</div><span><strong>{speaker.name}</strong><small>{speaker.title}</small><small>{speaker.company}</small></span><Icon name="arrow"/></button>)}</div></div>{person && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="speaker-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><Icon name="x"/></button><div className="speaker-photo large">{person.initials}</div><Badge tone="purple">{person.track}</Badge><h2>{person.name}</h2><p className="speaker-title">{person.title} · {person.company}</p><p>{person.bio}</p><h3>Sessions</h3>{seededSessions.filter((s) => s.speakers.includes(person.name) && s.status === "accepted").map((s) => <a className="modal-session" href={`${publicBase}/sessions`} key={s.id}><span><strong>{s.title}</strong><small>{s.day} · {s.start} · {s.room}</small></span><Icon name="arrow"/></a>)}</div></div>}</PublicShell>;
}

function PublicAgenda() {
  const [day, setDay] = useState(0);
  const [detail, setDetail] = useState<Session | null>(null);
  const days = ["Wednesday, May 12", "Thursday, May 13", "Friday, May 14"];
  return <PublicShell><section className="public-hero"><p className="eyebrow">THE PROGRAM</p><h1>Agenda</h1><p>Plan your days at DevFlow Conf 2027.</p></section><div className="public-container"><div className="day-tabs">{days.map((name, i) => <button className={day === i ? "active" : ""} onClick={() => setDay(i)} key={name}><small>DAY {i+1}</small>{name}</button>)}</div><div className="public-agenda"><div className="agenda-public-head"><span>TIME</span><strong>Main Stage</strong><strong>Room 2A</strong><strong>Room 2B</strong></div>{["9:00 AM","10:00 AM","11:00 AM","1:30 PM"].map((time) => <div className="agenda-public-row" key={time}><span>{time}</span>{["Main Stage","Room 2A","Room 2B"].map((room) => {const session = day === 0 ? seededSessions.find((s) => s.start === time && s.room === room && s.approval === "approved") : undefined; return <div key={room}>{session && <button onClick={() => setDetail(session)} style={{borderTopColor: session.trackColor}}><Badge><i style={{background:session.trackColor}}/>{session.track}</Badge><strong>{session.title}</strong><small>{session.start}–{session.end}</small></button>}</div>})}</div>)}</div></div>{detail && <div className="modal-backdrop" onClick={() => setDetail(null)}><div className="session-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setDetail(null)}><Icon name="x"/></button><Badge tone="track"><i style={{background:detail.trackColor}}/>{detail.track}</Badge><h2>{detail.title}</h2><p>{detail.description}</p><div className="session-meta"><span><Icon name="clock"/>{detail.start}–{detail.end}</span><span><Icon name="agenda"/>{detail.room}</span><span><Icon name="forms"/>{detail.format}</span></div><h3>Featuring</h3>{detail.speakers.map((name) => <div className="person-row" key={name}><Avatar name={name}/><strong>{name}</strong></div>)}</div></div>}</PublicShell>;
}

function PublicSubmit() {
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState("Talk (30 min)");
  const [title, setTitle] = useState("");
  const [takeaway, setTakeaway] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const labels = ["Welcome", "Account", "Submission", "Participant", "Review"];
  function next() {
    if (step === 2 && (!title || !takeaway)) { setError("Please complete the required fields before continuing."); return; }
    setError(""); setStep(Math.min(4, step + 1));
  }
  if (done) return <div className="cfp-page"><div className="cfp-top"><a className="event-wordmark" href={publicBase}><span>DF</span><div><strong>DEVFLOW</strong><small>CONF 2027</small></div></a></div><section className="success-page"><span><Icon name="check" size={36}/></span><Badge tone="success">PROPOSAL RECEIVED</Badge><h1>Thanks for sharing your idea, Priya.</h1><p>We’ve sent a confirmation to <strong>sbek-speaker@example.com</strong>. You can edit your proposal until April 30.</p><div><strong>{title || "Your submission"}</strong><small>Reference #DFC-2027-009</small></div><Button variant="primary" href="/portal">Continue to speaker portal</Button><Button href={`${publicBase}/sessions`}>Explore the program</Button></section></div>;
  return <div className="cfp-page"><div className="cfp-top"><a className="event-wordmark" href={publicBase}><span>DF</span><div><strong>DEVFLOW</strong><small>CONF 2027</small></div></a><span>Call for Speakers · Closes {event.closes}</span><a href="/sign-in">Save & exit</a></div><div className="cfp-progress">{labels.map((label, i) => <div className={i === step ? "active" : i < step ? "done" : ""} key={label}><span>{i < step ? <Icon name="check" size={14}/> : i+1}</span><strong>{label}</strong><i/></div>)}</div><main className="cfp-main">
    {step === 0 && <section className="cfp-welcome"><Badge>CALL FOR SPEAKERS</Badge><h1>Share your idea with DevFlow</h1><p>We’re looking for practical, honest stories that help engineering teams build better. Tell us what worked, what didn’t, and what others can take home.</p><div className="cfp-info"><span><Icon name="calendar"/><span><strong>Submissions close</strong><small>{event.closes}</small></span></span><span><Icon name="forms"/><span><strong>Submission limit</strong><small>Up to 3 proposals per person</small></span></span><span><Icon name="clock"/><span><strong>Time to complete</strong><small>About 10 minutes</small></span></span></div><Button variant="primary" onClick={next}>Start your proposal <Icon name="arrow" size={16}/></Button></section>}
    {step === 1 && <section className="cfp-form"><p className="eyebrow">YOUR ACCOUNT</p><h1>First, let’s save your progress</h1><p>Create an account or sign in. No email confirmation is needed.</p><div className="account-tabs"><button className="active">Create account</button><button>Sign in</button></div><div className="two-fields"><label>First name<input defaultValue="Priya"/></label><label>Last name<input defaultValue="Raman"/></label></div><label>Email address<input type="email" defaultValue="sbek-speaker@example.com"/></label><label>Password<input type="password" defaultValue="SbekTest!2027-spk"/></label></section>}
    {step === 2 && <section className="cfp-form"><p className="eyebrow">ABOUT YOUR SESSION</p><h1>What would you like to share?</h1><p>Give the committee enough detail to understand the value for attendees.</p>{error && <div className="error-banner"><Icon name="warning"/>{error}</div>}<label>Session title <em>*</em><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A clear, specific title"/>{!title && error && <small className="field-error">A title is required.</small>}<span>{title.length} / 150</span></label><label>Description <em>*</em><textarea defaultValue="AI coding tools are fast, plausible, and often wrong. This session presents a layered verification model teams can use in production."/><span>168 / 1,500</span></label><div className="two-fields"><label>Track<select><option>AI Engineering</option>{tracks.slice(1).map((t) => <option key={t.name}>{t.name}</option>)}</select></label><label>Format<select value={format} onChange={(e) => setFormat(e.target.value)}><option>Talk (30 min)</option><option>Workshop (120 min)</option><option>Lightning Talk (10 min)</option></select></label></div><label>Key takeaway <em>*</em><input value={takeaway} onChange={(e) => setTakeaway(e.target.value)} placeholder="What will attendees be able to do?"/>{!takeaway && error && <small className="field-error">A key takeaway is required.</small>}</label><label>Audience level<select><option>Advanced</option><option>Intermediate</option><option>Beginner</option></select></label>{format === "Workshop (120 min)" && <label className="conditional">Workshop prerequisites <Badge tone="purple">Shown because format is Workshop</Badge><textarea placeholder="What should attendees install or know beforehand?"/></label>}</section>}
    {step === 3 && <section className="cfp-form"><p className="eyebrow">PARTICIPANT</p><h1>Who’s presenting?</h1><p>Add at least one speaker. You can invite up to five.</p><div className="participant-card"><div><Avatar name="Priya Raman"/><span><strong>Priya Raman</strong><small>sbek-speaker@example.com</small></span><Badge tone="success">Speaker</Badge></div><div className="two-fields"><label>Job title<input defaultValue="Principal Engineer"/></label><label>Company<input defaultValue="Latticework Systems"/></label></div><label>Short biography<textarea defaultValue={speakers[0].bio}/></label></div><Button icon="plus">Add co-speaker</Button></section>}
    {step === 4 && <section className="cfp-form review-step"><p className="eyebrow">REVIEW</p><h1>Ready to submit?</h1><p>Check your answers. You can still edit this proposal until the call closes.</p><div className="review-section"><div><h3>Submission</h3><button onClick={() => setStep(2)}>Edit</button></div><dl><dt>Title</dt><dd>{title || "Your AI Pair Programmer Is Lying to You"}</dd><dt>Track</dt><dd>AI Engineering</dd><dt>Format</dt><dd>{format}</dd><dt>Key takeaway</dt><dd>{takeaway || "A repeatable framework for verifying AI-generated code."}</dd></dl></div><div className="review-section"><div><h3>Participant</h3><button onClick={() => setStep(3)}>Edit</button></div><dl><dt>Speaker</dt><dd>Priya Raman · Latticework Systems</dd><dt>Email</dt><dd>sbek-speaker@example.com</dd></dl></div><label className="terms"><input type="checkbox" defaultChecked/> I confirm that the information above is accurate.</label></section>}
  </main>{step > 0 && <div className="cfp-footer"><Button onClick={() => setStep(step - 1)}>Back</Button><span>Your progress is saved automatically</span>{step === 4 ? <Button variant="primary" onClick={() => setDone(true)}>Submit proposal</Button> : <Button variant="primary" onClick={next}>Continue <Icon name="arrow" size={15}/></Button>}</div>}</div>;
}

function PortalPage() {
  const [tab, setTab] = useState("Home");
  const [tasks, setTasks] = useState(taskNames.slice(0, 6).map((name, i) => ({name, done: i < 3, due: i < 3 ? "Completed" : "Due Apr 15"})));
  const [saved, setSaved] = useState(false);
  return <div className="portal"><header className="portal-header"><a className="event-wordmark" href="/portal"><span>DF</span><div><strong>DEVFLOW</strong><small>SPEAKER PORTAL</small></div></a><nav>{["Home","Submissions","Profile","Tasks"].map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}{item === "Tasks" && <i>3</i>}</button>)}</nav><div><a href="/admin">Back to Admin Mode</a><Avatar name="Priya Raman" size="sm"/><span><strong>Priya Raman</strong><small>Speaker</small></span><Icon name="chevron" size={15}/></div></header><main className="portal-main">
    {tab === "Home" && <><section className="portal-welcome"><div><p className="eyebrow">DEVFLOW CONF 2027 · MAY 12–14</p><h1>Welcome back, Priya</h1><p>You’re almost ready for DevFlow. Here’s what still needs your attention.</p></div><div className="readiness-ring"><strong>67%</strong><span>Speaker ready</span></div></section><div className="portal-grid"><section className="panel portal-card wide"><div className="panel-heading"><div><h2>My submissions</h2><p>Your proposals and invited sessions</p></div><button onClick={() => setTab("Submissions")}>View all</button></div>{seededSessions.filter((s) => s.speakers.includes("Priya Raman")).map((s) => <div className="portal-session" key={s.id}><i style={{background:s.trackColor}}/><div><strong>{s.title}</strong><small>{s.format} · {s.track}</small></div><StatusBadge status={s.status === "accept_queue" ? "pending" : s.status}/><Icon name="arrow"/></div>)}</section><section className="panel portal-card"><div className="panel-heading"><h2>My profile</h2><button onClick={() => setTab("Profile")}>Edit</button></div><div className="profile-summary"><Avatar name="Priya Raman" size="lg"/><h3>Priya Raman</h3><p>Principal Engineer</p><p>Latticework Systems</p><Badge tone="warning">Headshot needed</Badge></div></section><section className="panel portal-card wide"><div className="panel-heading"><div><h2>Tasks to complete</h2><p>{tasks.filter((t) => !t.done).length} outstanding · 1 overdue</p></div><button onClick={() => setTab("Tasks")}>View all</button></div>{tasks.filter((t) => !t.done).slice(0,3).map((task) => <div className="portal-task" key={task.name}><button onClick={() => setTasks(tasks.map((t) => t.name === task.name ? {...t, done:true} : t))}><Icon name="check"/></button><span><strong>{task.name}</strong><small>{task.due}</small></span><Badge tone={task.name.includes("headshot") ? "danger" : "warning"}>{task.name.includes("headshot") ? "Overdue" : "Required"}</Badge><Icon name="arrow"/></div>)}</section></div></>}
    {tab === "Submissions" && <><PageHeader eyebrow="MY PROGRAM" title="My submissions" description="Track decisions and edit proposals while the call is open."/><section className="panel portal-list">{seededSessions.filter((s) => s.speakers.includes("Priya Raman")).map((s) => <div className="portal-session big" key={s.id}><i style={{background:s.trackColor}}/><div><StatusBadge status={s.status === "accept_queue" ? "pending" : s.status}/><h3>{s.title}</h3><p>{s.description}</p><small>{s.track} · {s.format}</small></div><Button icon="edit" href={`${publicBase}/submit/cfp-main`}>Edit proposal</Button></div>)}</section></>}
    {tab === "Profile" && <><PageHeader eyebrow="YOUR PUBLIC PROFILE" title="Profile" description="Changes appear immediately on the public speaker directory." actions={<Button variant="primary" icon="check" onClick={() => setSaved(true)}>{saved ? "Saved" : "Save changes"}</Button>}/><div className="profile-editor"><section className="panel"><h2>About you</h2><div className="headshot-upload"><Avatar name="Priya Raman" size="lg"/><div><Button icon="upload">Upload headshot</Button><small>JPG or PNG · max 5 MB</small></div></div><div className="two-fields"><label>First name<input defaultValue="Priya"/></label><label>Last name<input defaultValue="Raman"/></label></div><div className="two-fields"><label>Job title<input defaultValue="Principal Engineer"/></label><label>Company<input defaultValue="Latticework Systems"/></label></div><label>Biography<textarea defaultValue={speakers[0].bio}/><span>{speakers[0].bio.length} / 5,000</span></label></section><section className="panel"><h2>My links</h2><label>LinkedIn URL<input defaultValue="https://linkedin.com/in/priyabuilds"/></label><label>X URL<input defaultValue="https://x.com/priyabuilds"/></label><label>Website<input placeholder="https://"/></label></section></div></>}
    {tab === "Tasks" && <><PageHeader eyebrow="ONBOARDING" title="My tasks" description={`${tasks.filter((t) => !t.done).length} items left before you’re speaker-ready.`}/><div className="task-groups"><section className="panel"><h2>My tasks</h2>{tasks.map((task) => <div className={`portal-task ${task.done ? "complete" : ""}`} key={task.name}><button onClick={() => setTasks(tasks.map((t) => t.name === task.name ? {...t, done:!t.done} : t))}><Icon name="check"/></button><span><strong>{task.name}</strong><small>{task.done ? "Completed Aug 5" : task.due}</small></span>{!task.done && <Badge tone="warning">Required</Badge>}<Icon name="arrow"/></div>)}</section><section className="panel"><h2>Submission tasks</h2><div className="file-request"><span><Icon name="upload"/></span><h3>Upload final slides</h3><p>PDF, PPTX, or Keynote · maximum 20 MB</p><Button variant="primary" icon="upload">Choose file</Button></div></section></div></>}
  </main></div>;
}

function ReviewPage() {
  const [selected, setSelected] = useState(reviewAssignments[0]);
  const [saved, setSaved] = useState<string[]>([reviewAssignments[2].id]);
  const [score, setScore] = useState(4);
  const [comment, setComment] = useState("");
  return <div className="review-app"><header className="review-header"><a className="brand" href="/review"><span className="brand-mark">C</span><span>conferencer</span></a><span><strong>Engineering Quality Review</strong><small>Program committee review · Round 1</small></span><div><Badge tone="success">Open until Apr 20</Badge><Avatar name="Sam Whitfield" size="sm"/></div></header><div className="review-layout"><aside className="review-queue"><div className="review-queue-head"><a href="/review">← All plans</a><h2>Assigned submissions</h2><div className="queue-counts"><span><strong>{reviewAssignments.length - saved.length}</strong> Pending</span><span><strong>{saved.length}</strong> Reviewed</span></div><SearchBox value="" onChange={() => {}} placeholder="Search submissions…"/></div><div className="queue-filters"><button className="active">All {reviewAssignments.length}</button><button>Pending</button><button>Reviewed</button></div>{reviewAssignments.map((session) => <button className={`queue-card ${selected.id === session.id ? "active" : ""}`} onClick={() => setSelected(session)} key={session.id}><div><Badge tone={saved.includes(session.id) ? "success" : "warning"}>{saved.includes(session.id) ? "Reviewed" : "Pending review"}</Badge><small>{session.track}</small></div><strong>{session.title}</strong><p>{session.description}</p><span>{session.format} · {session.level}</span></button>)}</aside><main className="review-detail"><section className="submission-pane"><p className="eyebrow">SUBMISSION {reviewAssignments.indexOf(selected)+1} OF {reviewAssignments.length}</p><h1>{selected.title}</h1><div className="review-tags"><Badge tone="track"><i style={{background:selected.trackColor}}/>{selected.track}</Badge><Badge>{selected.format}</Badge><Badge>{selected.level}</Badge></div><article><h3>Abstract</h3><p>{selected.description}</p><h3>Key takeaway</h3><p>Attendees leave with a practical framework, concrete examples, and an implementation path for their teams.</p><h3>Who is this for?</h3><p>Engineering leaders, platform engineers, and senior individual contributors working on developer productivity.</p></article></section><form className="score-pane" onSubmit={(e) => {e.preventDefault(); setSaved([...new Set([...saved, selected.id])]);}}><div><p className="eyebrow">YOUR SCORECARD</p><h2>Program committee review</h2><p>Score the proposal on practical value and fit.</p></div><fieldset><legend>Overall recommendation <em>*</em></legend><div className="scale">{[1,2,3,4,5].map((n) => <button type="button" className={score === n ? "active" : ""} onClick={() => setScore(n)} key={n}>{n}</button>)}</div><div className="scale-labels"><span>Strong no</span><span>Strong yes</span></div></fieldset><fieldset><legend>Originality <em>*</em></legend><select defaultValue="4"><option value="5">Exceptional — new and distinctive</option><option value="4">Strong — fresh angle</option><option value="3">Solid — useful treatment</option></select></fieldset><fieldset><legend>Program fit <em>*</em></legend><div className="choice-list">{["Excellent fit","Good fit","Not sure","Poor fit"].map((label, i) => <label key={label}><input type="radio" name="fit" defaultChecked={i===0}/>{label}</label>)}</div></fieldset><label>Reviewer comments<textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Notes for the program committee…"/></label><label className="remember"><input type="checkbox" defaultChecked/> Go to next submission after saving</label><Button type="submit" variant="primary" className="full" icon="check">{saved.includes(selected.id) ? "Review saved" : "Save review"}</Button></form></main></div></div>;
}

export default function ConferencerApp({ path }: { path: string }) {
  if (path === "/sign-in" || path === "/sign-up") return <SignInPage/>;
  if (path === "/portal" || path.startsWith("/portal/")) return <PortalPage/>;
  if (path === "/review" || path.startsWith("/review/")) return <ReviewPage/>;
  if (path === publicBase) return <PublicLanding/>;
  if (path === `${publicBase}/sessions`) return <SessionCards/>;
  if (path === `${publicBase}/speakers`) return <PublicSpeakers/>;
  if (path === `${publicBase}/agenda`) return <PublicAgenda/>;
  if (path === `${publicBase}/itinerary`) return <SessionCards mode="itinerary"/>;
  if (path === `${publicBase}/gallery`) return <PublicSpeakers gallery/>;
  if (path.startsWith(`${publicBase}/submit/`)) return <PublicSubmit/>;
  if (path === "/admin") return <AdminShell path={eventBase}><AdminDashboard/></AdminShell>;
  if (path === eventBase) return <AdminShell path={path}><AdminDashboard/></AdminShell>;
  if (path === `${eventBase}/submissions`) return <AdminShell path={path}><SubmissionsPage/></AdminShell>;
  if (path.startsWith(`${eventBase}/submissions/`)) return <AdminShell path={`${eventBase}/submissions`}><SubmissionDetail id={path.split("/").pop() ?? ""}/></AdminShell>;
  if (path === `${eventBase}/forms`) return <AdminShell path={path}><FormsPage/></AdminShell>;
  if (path.startsWith(`${eventBase}/forms/`)) return <AdminShell path={`${eventBase}/forms`}><FormBuilder/></AdminShell>;
  if (path === `${eventBase}/evaluations`) return <AdminShell path={path}><EvaluationsPage/></AdminShell>;
  if (path === `${eventBase}/agenda`) return <AdminShell path={path}><AgendaPage/></AdminShell>;
  if (path === `${eventBase}/speakers`) return <AdminShell path={path}><SpeakersPage/></AdminShell>;
  if (path === `${eventBase}/tasks`) return <AdminShell path={path}><TasksPage/></AdminShell>;
  if (path === `${eventBase}/emails`) return <AdminShell path={path}><EmailsPage/></AdminShell>;
  if (path === `${eventBase}/settings`) return <AdminShell path={path}><SettingsPage/></AdminShell>;
  if (path.startsWith(`${eventBase}/`)) return <AdminShell path={path}><GenericAdminPage section={path.split("/").pop() ?? "Overview"}/></AdminShell>;
  return <PublicLanding/>;
}

