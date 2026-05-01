import type { Metadata } from "next";
import Link from "next/link";
import { createJsonLd } from "@agentnav/next";
import config from "../agentnav.config";
import { AgentNavClient } from "./AgentNavClient";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hyde Park Real Estate",
    template: "%s | Hyde Park"
  },
  description: "Browse available real estate units and book a viewing appointment.",
  alternates: {
    canonical: "https://example.com"
  },
  openGraph: {
    title: "Hyde Park Real Estate",
    description: "Browse available real estate units and book a viewing appointment."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = createJsonLd(config);

  return (
    <html lang="en">
      <body>
        {jsonLd.map((item, index) => (
          <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
        ))}
        <AgentNavClient>
          <header className="site-header">
            <Link href="/" className="brand" data-agent-purpose="home">
              Hyde Park
            </Link>
            <nav aria-label="Primary navigation">
              <Link href="/units" data-agent-purpose="browse available units">
                Units
              </Link>
              <Link href="/book-viewing" data-agent-purpose="book a viewing">
                Book Viewing
              </Link>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <p>Hyde Park sales office, New Cairo</p>
            <a href="mailto:sales@example.com">sales@example.com</a>
          </footer>
        </AgentNavClient>
      </body>
    </html>
  );
}
