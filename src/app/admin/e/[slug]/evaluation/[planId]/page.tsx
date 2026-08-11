import Link from "next/link";
import { notFound } from "next/navigation";

import { requireOrganizer } from "@/lib/guards";
import { all } from "@/lib/db";
import { listLookup } from "@/lib/repo/events";
import {
  getPlan,
  listAssignmentsForRound,
  listRoundReviewers,
  listRounds,
  listScorecard,
  planProgress,
  results,
  reviewerProgress,
  reviewsForSubmission,
} from "@/lib/repo/evaluations";
import { listSubmissions } from "@/lib/repo/submissions";
import {
  assignAction,
  autoAssignAction,
  createRoundAction,
  deletePlanAction,
  demoteAction,
  inviteReviewerAction,
  promoteAction,
  remindReviewersAction,
  removeReviewerAction,
  updatePlanAction,
} from "@/server/evaluation-actions";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Field,
  Input,
  LinkButton,
  Notice,
  PageHeader,
  Progress,
  Select,
  SubNav,
  Table,
  Td,
  Textarea,
  Th,
} from "@/components/ui";
import { ConfirmSubmit, CopyButton } from "@/components/client/basics";
import { formatDate } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function PlanPage({
  params,
  searchParams,
}: PageProps<"/admin/e/[slug]/evaluation/[planId]">) {
  const { slug, planId } = await params;
  const sp = await searchParams;
  const { event } = await requireOrganizer(slug);
  const plan = getPlan(planId);
  if (!plan || plan.event_id !== event.id) notFound();

  const tab = typeof sp.tab === "string" ? sp.tab : "rounds";
  const base = `/admin/e/${slug}/evaluation/${plan.id}`;
  const rounds = listRounds(plan.id);
  const activeRoundId =
    typeof sp.round === "string" && rounds.some((r) => r.id === sp.round)
      ? sp.round
      : (rounds[0]?.id ?? "");
  const activeRound = rounds.find((r) => r.id === activeRoundId);
  const progress = planProgress(plan.id);
  const reviewerRows = reviewerProgress(plan.id);
  const resultRows = results(event.id, plan.id).filter((row) => row.assigned_count > 0);
  const sortDir = sp.dir === "asc" ? "asc" : "desc";
  const sortedResults = [...resultRows].sort((a, b) => {
    const av = a.avg_score ?? -1;
    const bv = b.avg_score ?? -1;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const submissions = listSubmissions(event.id, { limit: 500 });
  const tracks = listLookup("tracks", event.id);
  const eventUsers = all<{ id: string; first_name: string; last_name: string; email: string }>(
    `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email
       FROM users u JOIN event_memberships m ON m.user_id = u.id
      WHERE m.event_id = ? ORDER BY u.last_name`,
    event.id,
  );

  return (
    <div>
      <PageHeader
        breadcrumb={
          <Link href={`/admin/e/${slug}/evaluation`} className="hover:underline">
            Evaluation
          </Link>
        }
        title={plan.name}
        description={`${rounds.length} rounds · ${progress.complete}/${progress.assigned} reviews complete`}
        actions={
          <>
            <Chip tone={plan.is_open ? "green" : "slate"}>{plan.is_open ? "Open" : "Closed"}</Chip>
            <LinkButton href={`${base}/export.csv?shape=cumulative`} size="sm">
              Export scores
            </LinkButton>
          </>
        }
      />

      {sp.saved ? <Notice tone="success" className="mb-4">Saved.</Notice> : null}
      {sp.assigned ? <Notice tone="success" className="mb-4">Assignments updated.</Notice> : null}
      {sp.created ? (
        <Notice tone="success" className="mb-4">
          {String(sp.created)} assignments created by auto-distribute.
        </Notice>
      ) : null}
      {sp.reminded ? (
        <Notice tone="success" className="mb-4">
          Reminder sent to {String(sp.reminded)} reviewer(s). Every message is in the outbox.
        </Notice>
      ) : null}
      {sp.promoted ? (
        <Notice tone="success" className="mb-4">
          Promoted {String(sp.promoted)} submission(s) to the next round.
        </Notice>
      ) : null}
      {sp.invite ? (
        <Notice tone="info" className="mb-4">
          <p className="font-medium">Reviewer invited: {String(sp.email ?? "")}</p>
          <p className="mt-1 text-xs">
            Share this link so they can set a password and sign in — no inbox needed.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded bg-white px-2 py-1 font-mono text-xs">
              /set-password/{String(sp.invite)}
            </code>
            <CopyButton value={`/set-password/${String(sp.invite)}`} label="Copy invite link" />
          </div>
        </Notice>
      ) : null}

      <SubNav
        current={`${base}?tab=${tab}`}
        items={[
          { href: `${base}?tab=rounds`, label: "Rounds", count: rounds.length },
          { href: `${base}?tab=reviewers`, label: "Reviewers", count: progress.reviewers },
          { href: `${base}?tab=assignments`, label: "Assignments", count: progress.assigned },
          { href: `${base}?tab=progress`, label: "Progress" },
          { href: `${base}?tab=results`, label: "Results", count: resultRows.length },
          { href: `${base}?tab=settings`, label: "Settings" },
        ]}
      />

      {tab === "rounds" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {rounds.map((round) => {
              const card = listScorecard(round.id);
              const assignments = listAssignmentsForRound(round.id);
              return (
                <Card key={round.id}>
                  <CardHeader
                    title={round.name}
                    description={`${round.opens_at ? formatDate(round.opens_at) : "—"} → ${
                      round.closes_at ? formatDate(round.closes_at) : "—"
                    } · ${assignments.length} assignments`}
                    actions={
                      <>
                        {round.anonymize ? <Chip tone="violet">Anonymized</Chip> : null}
                        <LinkButton href={`${base}/rounds/${round.id}`} size="sm">
                          Edit round
                        </LinkButton>
                      </>
                    }
                  />
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Scorecard
                    </p>
                    <ul className="mt-1 space-y-1 text-sm">
                      {card.map((question) => (
                        <li key={question.id} className="flex items-center gap-2">
                          <span className="text-slate-800">{question.label}</span>
                          <Chip tone="slate">{question.type}</Chip>
                          {question.weight !== 1 ? (
                            <Chip tone="amber">weight {question.weight}</Chip>
                          ) : null}
                          {question.is_required ? <Chip tone="red">required</Chip> : null}
                        </li>
                      ))}
                      {!card.length ? (
                        <li className="text-sm text-slate-500">No criteria yet.</li>
                      ) : null}
                    </ul>
                    <p className="mt-2 text-xs text-slate-500">
                      Reviewers in this round:{" "}
                      {listRoundReviewers(round.id)
                        .map((r) => `${r.first_name} ${r.last_name}`)
                        .join(", ") || "none yet"}
                    </p>
                  </div>
                </Card>
              );
            })}

            {plan.mode === "funnel" && rounds.length > 1 ? (
              <Card>
                <CardHeader
                  title="Promote / demote"
                  description="Funnel mode: move submissions between rounds in bulk."
                />
                <form action={promoteAction} className="space-y-3 p-4">
                  <input type="hidden" name="slug" value={slug} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="From round" name="from_round_id">
                      <Select id="from_round_id" name="from_round_id" defaultValue={rounds[0]?.id}>
                        {rounds.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="To round" name="to_round_id">
                      <Select id="to_round_id" name="to_round_id" defaultValue={rounds[1]?.id}>
                        {rounds.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <fieldset className="max-h-64 overflow-y-auto rounded-md border border-slate-200 p-2">
                    <legend className="px-1 text-xs font-medium text-slate-600">
                      Submissions to promote
                    </legend>
                    {submissions.slice(0, 100).map((s) => (
                      <label key={s.id} className="flex items-center gap-2 py-0.5 text-sm">
                        <input type="checkbox" name="submission_ids" value={s.id} />
                        {s.title}
                      </label>
                    ))}
                  </fieldset>
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary">
                      Promote to round
                    </Button>
                    <Button type="submit" formAction={demoteAction} variant="secondary">
                      Demote (remove from round)
                    </Button>
                  </div>
                  <input type="hidden" name="round_id" value={rounds[1]?.id ?? rounds[0]?.id} />
                </form>
              </Card>
            ) : null}
          </div>

          <Card className="h-fit">
            <CardHeader title="Add a round" />
            <form action={createRoundAction} className="space-y-3 p-4">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="plan_id" value={plan.id} />
              <Field label="Name" name="name" required>
                <Input id="name" name="name" placeholder="Final Review" required />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Opens" name="opens_at">
                  <Input id="opens_at" name="opens_at" type="datetime-local" />
                </Field>
                <Field label="Closes" name="closes_at">
                  <Input id="closes_at" name="closes_at" type="datetime-local" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="anonymize" /> Anonymize this round
              </label>
              <Field label="Instructions" name="instructions">
                <Textarea id="instructions" name="instructions" rows={3} />
              </Field>
              <Button type="submit" variant="primary" className="w-full">
                Create round
              </Button>
            </form>
          </Card>
        </div>
      ) : null}

      {tab === "reviewers" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {rounds.map((round) => {
              const reviewers = listRoundReviewers(round.id);
              return (
                <Card key={round.id}>
                  <CardHeader
                    title={`${round.name} reviewer pool`}
                    description={`${reviewers.length} reviewer(s) scoped to this round only`}
                  />
                  <Table className="rounded-none border-0">
                    <thead>
                      <tr>
                        <Th>Reviewer</Th>
                        <Th>Email</Th>
                        <Th>Cap</Th>
                        <Th>Assigned</Th>
                        <Th>Complete</Th>
                        <Th />
                      </tr>
                    </thead>
                    <tbody>
                      {reviewers.map((reviewer) => (
                        <tr key={reviewer.id}>
                          <Td className="font-medium">
                            {reviewer.first_name} {reviewer.last_name}
                          </Td>
                          <Td className="text-xs">{reviewer.email}</Td>
                          <Td className="text-xs">{reviewer.max_assignments ?? "—"}</Td>
                          <Td>{reviewer.assigned}</Td>
                          <Td>{reviewer.completed}</Td>
                          <Td>
                            <form action={removeReviewerAction}>
                              <input type="hidden" name="slug" value={slug} />
                              <input type="hidden" name="round_id" value={round.id} />
                              <input type="hidden" name="user_id" value={reviewer.user_id} />
                              <ConfirmSubmit
                                message={`Remove ${reviewer.first_name} from ${round.name}?`}
                                variant="ghost"
                              >
                                Remove
                              </ConfirmSubmit>
                            </form>
                          </Td>
                        </tr>
                      ))}
                      {!reviewers.length ? (
                        <tr>
                          <Td colSpan={6} className="py-4 text-center text-sm text-slate-500">
                            No reviewers in this round yet.
                          </Td>
                        </tr>
                      ) : null}
                    </tbody>
                  </Table>
                </Card>
              );
            })}
          </div>

          <Card className="h-fit">
            <CardHeader
              title="Add a reviewer"
              description="Invite by email with a password you can share, or add an existing member."
            />
            <form action={inviteReviewerAction} className="space-y-3 p-4">
              <input type="hidden" name="slug" value={slug} />
              <Field label="Round" name="round_id" required>
                <Select id="round_id" name="round_id" defaultValue={activeRoundId} required>
                  {rounds.map((round) => (
                    <option key={round.id} value={round.id}>
                      {round.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Existing member" name="user_id">
                <Select id="user_id" name="user_id" defaultValue="">
                  <option value="">— invite someone new —</option>
                  {eventUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
                </Select>
              </Field>
              <hr className="border-slate-200" />
              <Field label="Name" name="name">
                <Input id="name" name="name" placeholder="Sam Whitfield" />
              </Field>
              <Field label="Email" name="email">
                <Input id="email" name="email" type="email" placeholder="sam@example.com" />
              </Field>
              <Field
                label="Set a password"
                name="password"
                hint="Optional. Leave blank to use the invite link instead."
              >
                <Input id="password" name="password" type="text" autoComplete="off" />
              </Field>
              <Field label="Max assignments" name="max_assignments">
                <Input id="max_assignments" name="max_assignments" type="number" min={1} />
              </Field>
              <Button type="submit" variant="primary" className="w-full">
                Add reviewer
              </Button>
            </form>
          </Card>
        </div>
      ) : null}

      {tab === "assignments" ? (
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Assign submissions to a reviewer"
              description="The reviewer's queue will contain exactly what you tick here — nothing else."
            />
            <form action={assignAction} className="space-y-3 p-4">
              <input type="hidden" name="slug" value={slug} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Round" name="round_id" required>
                  <Select id="round_id" name="round_id" defaultValue={activeRoundId} required>
                    {rounds.map((round) => (
                      <option key={round.id} value={round.id}>
                        {round.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Reviewer" name="reviewer_user_id" required>
                  <Select id="reviewer_user_id" name="reviewer_user_id" required>
                    {(activeRound ? listRoundReviewers(activeRound.id) : []).map((reviewer) => (
                      <option key={reviewer.user_id} value={reviewer.user_id}>
                        {reviewer.first_name} {reviewer.last_name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Mode" name="mode">
                  <Select id="mode" name="mode" defaultValue="replace">
                    <option value="replace">Replace their queue</option>
                    <option value="add">Add to their queue</option>
                  </Select>
                </Field>
              </div>
              <fieldset className="max-h-96 overflow-y-auto rounded-md border border-slate-200 p-3">
                <legend className="px-1 text-xs font-medium text-slate-600">Submissions</legend>
                {submissions.map((submission) => {
                  const assigned = activeRound
                    ? listAssignmentsForRound(activeRound.id).some(
                        (a) => a.submission_id === submission.id,
                      )
                    : false;
                  return (
                    <label key={submission.id} className="flex items-start gap-2 py-1 text-sm">
                      <input
                        type="checkbox"
                        name="submission_ids"
                        value={submission.id}
                        className="mt-1"
                      />
                      <span>
                        {submission.title}
                        <span className="ml-2 text-xs text-slate-400">
                          {submission.track_name ?? "no track"} · {submission.status}
                          {assigned ? " · already assigned in this round" : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
              <Button type="submit" variant="primary">
                Save assignments
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader
              title="Assignment at scale"
              description="Auto-distribute reviewers across submissions, with a per-reviewer cap and an optional track filter."
            />
            <form action={autoAssignAction} className="grid gap-3 p-4 sm:grid-cols-5">
              <input type="hidden" name="slug" value={slug} />
              <Field label="Round" name="round_id">
                <Select id="auto_round" name="round_id" defaultValue={activeRoundId}>
                  {rounds.map((round) => (
                    <option key={round.id} value={round.id}>
                      {round.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Reviewers per submission" name="per_submission">
                <Input
                  id="per_submission"
                  name="per_submission"
                  type="number"
                  min={1}
                  defaultValue={2}
                />
              </Field>
              <Field label="Max per reviewer" name="cap">
                <Input id="cap" name="cap" type="number" min={1} placeholder="no cap" />
              </Field>
              <Field label="Only this track" name="track_id">
                <Select id="track_id" name="track_id" defaultValue="">
                  <option value="">All tracks</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status" name="status">
                <Select id="status" name="status" defaultValue="pending">
                  <option value="pending">Pending only</option>
                  <option value="all">Every submission</option>
                </Select>
              </Field>
              <div className="sm:col-span-5">
                <p className="mb-2 text-xs text-slate-500">
                  Impact preview: {submissions.length} submissions ×{" "}
                  {activeRound ? listRoundReviewers(activeRound.id).length : 0} reviewers in this
                  round. Auto-distribute tops every submission up to the requested number of
                  reviewers, choosing whoever has the lightest load.
                </p>
                <Button type="submit" variant="primary">
                  Auto-distribute
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader title="Current assignments" />
            <Table className="rounded-none border-0">
              <thead>
                <tr>
                  <Th>Round</Th>
                  <Th>Submission</Th>
                  <Th>Reviewer</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {rounds.flatMap((round) =>
                  all<{
                    id: string;
                    title: string;
                    first_name: string;
                    last_name: string;
                    status: string;
                  }>(
                    `SELECT a.id, s.title, u.first_name, u.last_name, a.status
                       FROM evaluation_assignments a
                       JOIN submissions s ON s.id = a.submission_id
                       JOIN users u ON u.id = a.reviewer_user_id
                      WHERE a.round_id = ? ORDER BY u.last_name, s.title`,
                    round.id,
                  ).map((row) => (
                    <tr key={row.id}>
                      <Td className="text-xs">{round.name}</Td>
                      <Td>{row.title}</Td>
                      <Td>
                        {row.first_name} {row.last_name}
                      </Td>
                      <Td>
                        <Chip tone={row.status === "complete" ? "green" : "slate"}>
                          {row.status}
                        </Chip>
                      </Td>
                    </tr>
                  )),
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      ) : null}

      {tab === "progress" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Total evaluations", value: progress.assigned },
              { label: "Completed", value: progress.complete },
              { label: "Submissions evaluated", value: progress.submissions },
              { label: "Reviewers", value: progress.reviewers },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader
              title="Per-reviewer progress"
              description="Tick the reviewers who are behind and send them a reminder."
            />
            <form action={remindReviewersAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="plan_id" value={plan.id} />
              <Table className="rounded-none border-0">
                <thead>
                  <tr>
                    <Th className="w-8" />
                    <Th>Reviewer</Th>
                    <Th>Round</Th>
                    <Th>Assigned</Th>
                    <Th>Complete</Th>
                    <Th>Progress</Th>
                  </tr>
                </thead>
                <tbody>
                  {reviewerRows.map((row) => (
                    <tr key={`${row.round_id}-${row.user_id}`}>
                      <Td>
                        <input
                          type="checkbox"
                          name="reviewer_user_ids"
                          value={row.user_id}
                          defaultChecked={row.complete < row.assigned}
                          aria-label={`Remind ${row.first_name} ${row.last_name}`}
                        />
                      </Td>
                      <Td className="font-medium">
                        {row.first_name} {row.last_name}
                        <span className="block text-xs font-normal text-slate-500">{row.email}</span>
                      </Td>
                      <Td className="text-xs">{row.round_name}</Td>
                      <Td>{row.assigned}</Td>
                      <Td>{row.complete}</Td>
                      <Td className="w-48">
                        <Progress value={row.complete} max={Math.max(row.assigned, 1)} />
                        <span className="text-xs text-slate-500">
                          {row.assigned
                            ? `${Math.round((row.complete / row.assigned) * 100)}%`
                            : "—"}
                        </span>
                      </Td>
                    </tr>
                  ))}
                  {!reviewerRows.length ? (
                    <tr>
                      <Td colSpan={6} className="py-6 text-center text-slate-500">
                        No reviewers yet.
                      </Td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
              <div className="border-t border-slate-200 p-4">
                <Button type="submit" variant="primary">
                  Send reminder to selected reviewers
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      {tab === "results" ? (
        <Card>
          <CardHeader
            title="Results"
            description="Weighted average score per submission. Criteria with weight 0 are collected but excluded from the score."
            actions={
              <>
                <LinkButton href={`${base}/export.csv?shape=cumulative`} size="sm">
                  Cumulative CSV
                </LinkButton>
                <LinkButton href={`${base}/export.csv?shape=individual`} size="sm">
                  Individual grades CSV
                </LinkButton>
              </>
            }
          />
          <Table className="rounded-none border-0">
            <thead>
              <tr>
                <Th>Submission</Th>
                <Th>Track</Th>
                <Th>
                  <Link
                    href={`${base}?tab=results&dir=${sortDir === "desc" ? "asc" : "desc"}`}
                    className="inline-flex items-center gap-1 hover:text-brand-700"
                  >
                    Weighted average {sortDir === "desc" ? "▼" : "▲"}
                  </Link>
                </Th>
                <Th>Unweighted</Th>
                <Th>Reviews</Th>
                <Th>Reviewer scores</Th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((row) => {
                const reviews = reviewsForSubmission(row.submission_id);
                return (
                  <tr key={row.submission_id}>
                    <Td>
                      <Link
                        href={`/admin/e/${slug}/submissions/${row.submission_id}`}
                        className="font-medium text-slate-900 hover:text-brand-700"
                      >
                        {row.title}
                      </Link>
                    </Td>
                    <Td className="text-xs">{row.track_name ?? "—"}</Td>
                    <Td>
                      <strong className="text-base">
                        {row.avg_score !== null ? row.avg_score.toFixed(2) : "—"}
                      </strong>
                    </Td>
                    <Td className="text-xs text-slate-500">
                      {row.avg_raw !== null ? row.avg_raw.toFixed(2) : "—"}
                    </Td>
                    <Td>
                      {row.review_count}/{row.assigned_count}
                    </Td>
                    <Td className="text-xs">
                      {reviews.length
                        ? reviews
                            .map(
                              (review) =>
                                `${review.reviewer_name}: ${
                                  review.score !== null ? review.score.toFixed(2) : "—"
                                }`,
                            )
                            .join(" · ")
                        : "—"}
                    </Td>
                  </tr>
                );
              })}
              {!sortedResults.length ? (
                <tr>
                  <Td colSpan={6} className="py-6 text-center text-slate-500">
                    No reviews yet.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
          {sortedResults.length ? (
            <div className="grid gap-4 border-t border-slate-200 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Top 10 by score
                </p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">
                  {[...resultRows]
                    .filter((r) => r.avg_score !== null)
                    .sort((a, b) => (b.avg_score ?? 0) - (a.avg_score ?? 0))
                    .slice(0, 10)
                    .map((row) => (
                      <li key={row.submission_id}>
                        {row.title}{" "}
                        <span className="text-slate-500">{row.avg_score?.toFixed(2)}</span>
                      </li>
                    ))}
                </ol>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Lowest scoring
                </p>
                <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">
                  {[...resultRows]
                    .filter((r) => r.avg_score !== null)
                    .sort((a, b) => (a.avg_score ?? 0) - (b.avg_score ?? 0))
                    .slice(0, 5)
                    .map((row) => (
                      <li key={row.submission_id}>
                        {row.title}{" "}
                        <span className="text-slate-500">{row.avg_score?.toFixed(2)}</span>
                      </li>
                    ))}
                </ol>
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {tab === "settings" ? (
        <Card className="max-w-2xl">
          <CardHeader title="Plan settings" />
          <form action={updatePlanAction} className="space-y-4 p-4">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="plan_id" value={plan.id} />
            <Field label="Name" name="name" required>
              <Input id="name" name="name" defaultValue={plan.name} required />
            </Field>
            <Field label="Instructions" name="instructions">
              <Textarea
                id="instructions"
                name="instructions"
                rows={4}
                defaultValue={plan.instructions ?? ""}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opens" name="opens_at">
                <Input
                  id="opens_at"
                  name="opens_at"
                  type="datetime-local"
                  defaultValue={plan.opens_at ?? ""}
                />
              </Field>
              <Field label="Closes" name="closes_at">
                <Input
                  id="closes_at"
                  name="closes_at"
                  type="datetime-local"
                  defaultValue={plan.closes_at ?? ""}
                />
              </Field>
            </div>
            <Field label="Mode" name="mode">
              <Select id="mode" name="mode" defaultValue={plan.mode}>
                <option value="parallel">Parallel — every round reviews everything</option>
                <option value="funnel">Funnel — promote between rounds</option>
              </Select>
            </Field>
            {[
              { name: "is_open", label: "Plan is open", checked: plan.is_open },
              { name: "anonymize", label: "Anonymize by default", checked: plan.anonymize },
              {
                name: "show_other_scores",
                label: "Reviewers can see each other's scores",
                checked: plan.show_other_scores,
              },
              { name: "allow_abstain", label: "Allow abstain / conflict of interest", checked: plan.allow_abstain },
              {
                name: "require_abstain_reason",
                label: "Require a reason when abstaining",
                checked: plan.require_abstain_reason,
              },
            ].map((toggle) => (
              <label key={toggle.name} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={toggle.name} defaultChecked={Boolean(toggle.checked)} />
                {toggle.label}
              </label>
            ))}
            <Button type="submit" variant="primary">
              Save plan
            </Button>
          </form>
          <form action={deletePlanAction} className="border-t border-slate-200 p-4">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="plan_id" value={plan.id} />
            <ConfirmSubmit message={`Delete "${plan.name}" and all of its reviews?`}>
              Delete plan
            </ConfirmSubmit>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
