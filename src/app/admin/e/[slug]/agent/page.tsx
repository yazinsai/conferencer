import { requireEventRole } from "@/lib/auth/guards";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AgentChat } from "./agent-chat";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event } = await requireEventRole(slug, ["organizer"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Event assistant</h1>
        <p className="text-slate-600">
          Simple keyword chat over {event.name} data — maps phrases to the same
          queries as the REST API (submissions, tasks, sessions, contacts).
        </p>
      </div>

      <Card>
        <CardHeader
          title="Chat"
          subtitle="No LLM — pattern-matched intents only. Use the MCP server for Claude/Cursor integration."
        />
        <CardBody>
          <AgentChat slug={slug} />
        </CardBody>
      </Card>
    </div>
  );
}
