import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Conferencer",
    template: "%s · Conferencer",
  },
  description:
    "Open-source conference program management: call for speakers, review, speaker portal, agenda and public widgets.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Every face is local (see src/app/fonts.ts and src/fonts/NOTICE.md): `next
  // build` has to succeed inside a Docker build with no network, so nothing is
  // fetched from a font CDN. The token stack lives in src/app/tokens.css.
  return (
    <html lang="en" className={`h-full font-sans antialiased ${fontVariables}`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
