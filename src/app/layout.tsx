import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Conferencer",
    template: "%s · Conferencer",
  },
  description:
    "Open-source conference program management: call for speakers, review, speaker portal, agenda and public widgets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // No web-font fetch on purpose: `next build` has to succeed inside a Docker
  // build with no network. The system stack is defined in globals.css.
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
