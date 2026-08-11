import { Card, CardHeader, cx } from "@/components/ui";

function Bone({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-md bg-paper-3", className)} />;
}

/** Generic admin page body skeleton (sidebar/header live in the layout). */
export function AdminPageSkeleton() {
  return (
    <div aria-hidden className="max-w-5xl">
      <div className="mb-6 space-y-2">
        <Bone className="h-7 w-48" />
        <Bone className="h-4 w-80 max-w-full" />
      </div>
      <div className="space-y-3 rounded-card border border-rule bg-paper p-4">
        <Bone className="h-9 w-full" />
        <Bone className="h-9 w-full" />
        <Bone className="h-9 w-5/6" />
        <Bone className="h-9 w-full" />
        <Bone className="h-9 w-4/5" />
        <Bone className="h-9 w-full" />
      </div>
    </div>
  );
}

export function SubmissionsSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Bone className="h-7 w-40" />
          <Bone className="h-4 w-96 max-w-full" />
        </div>
        <Bone className="h-9 w-28" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Bone className="h-8 w-20" />
        <Bone className="h-8 w-24" />
        <Bone className="h-8 w-20" />
        <Bone className="h-8 w-28" />
      </div>
      <div className="overflow-hidden rounded-card border border-rule">
        <Bone className="h-10 w-full rounded-none bg-paper-2" />
        {Array.from({ length: 8 }, (_, i) => (
          <Bone key={i} className="h-12 w-full rounded-none border-t border-rule" />
        ))}
      </div>
    </div>
  );
}

export function AgendaSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Bone className="h-7 w-32" />
          <Bone className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-9 w-24" />
          <Bone className="h-9 w-24" />
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Bone key={i} className="h-8 w-16" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-h-80 rounded-card border border-rule bg-paper p-3">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => (
              <Bone key={i} className="h-16" />
            ))}
          </div>
        </div>
        <div className="space-y-2 rounded-card border border-rule bg-paper p-3">
          <Bone className="h-4 w-24" />
          <Bone className="h-14 w-full" />
          <Bone className="h-14 w-full" />
          <Bone className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div aria-hidden className="max-w-4xl">
      <div className="mb-6 space-y-2">
        <Bone className="h-7 w-28" />
        <Bone className="h-4 w-72 max-w-full" />
      </div>
      <Card className="mb-5">
        <CardHeader title="Exports" />
        <div className="grid gap-2 p-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Bone key={i} className="h-9 w-full" />
          ))}
        </div>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader title="By track" />
          <div className="space-y-2 p-4">
            <Bone className="h-8 w-full" />
            <Bone className="h-8 w-full" />
            <Bone className="h-8 w-4/5" />
          </div>
        </Card>
        <Card>
          <CardHeader title="By format" />
          <div className="space-y-2 p-4">
            <Bone className="h-8 w-full" />
            <Bone className="h-8 w-full" />
            <Bone className="h-8 w-3/5" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export function DashboardPanelsSkeleton() {
  return (
    <section className="mt-6" aria-hidden>
      <Bone className="mb-3 h-3 w-36" />
      <Card>
        <div className="space-y-3 px-4 py-4">
          <div className="flex gap-2 border-b border-rule pb-3">
            <Bone className="h-8 w-28" />
            <Bone className="h-8 w-28" />
            <Bone className="h-8 w-28" />
            <Bone className="h-8 w-20" />
          </div>
          <Bone className="h-24 w-full" />
          <Bone className="h-24 w-full" />
        </div>
      </Card>
    </section>
  );
}

export function SpeakerReadinessSkeleton() {
  return (
    <Card className="lg:col-span-2" aria-hidden>
      <CardHeader title="Speaker readiness" description="Onboarding completion, least complete first" />
      <div className="space-y-0 px-4 pb-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Bone key={i} className="my-2 h-10 w-full" />
        ))}
      </div>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card aria-hidden>
      <CardHeader title="Recent activity" />
      <div className="space-y-0 px-4 pb-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="border-b border-rule py-3 last:border-0">
            <Bone className="h-4 w-full" />
            <Bone className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
    </Card>
  );
}
