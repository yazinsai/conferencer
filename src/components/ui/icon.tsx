import { cn } from "@/lib/utils";
import { ICONS, type IconName } from "./icons.generated";

export type { IconName };

/**
 * The product's only icon. Solar, one style family, drawn from the generated
 * module so nothing fetches an icon at runtime and the bundle carries just the
 * paths in use.
 *
 * No hooks, so it renders in server and client components alike.
 *
 * Decorative by default: an icon beside a label repeats the label, and a screen
 * reader should not hear it twice. Pass `label` when the icon is the only thing
 * naming a control — that swaps `aria-hidden` for a real accessible name.
 */
export function Icon({
  name,
  size = 20,
  className,
  label,
}: {
  name: IconName;
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={cn("shrink-0", className)}
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
