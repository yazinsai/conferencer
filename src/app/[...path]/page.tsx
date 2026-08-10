import ConferencerApp from "@/components/conferencer-app";

type CatchAllPageProps = {
  params: Promise<{ path: string[] }>;
};

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { path } = await params;

  return <ConferencerApp path={`/${path.join("/")}`} />;
}
