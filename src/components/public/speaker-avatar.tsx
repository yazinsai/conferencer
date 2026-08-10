export function SpeakerAvatar({
  firstName,
  lastName,
  headshotUrl,
  size = "md",
}: {
  firstName: string;
  lastName: string;
  headshotUrl: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-base",
    xl: "h-24 w-24 text-xl",
  };
  const cls = sizes[size];

  if (headshotUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={headshotUrl}
        alt=""
        className={`${cls} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-medium text-slate-600`}
      aria-hidden
    >
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}
