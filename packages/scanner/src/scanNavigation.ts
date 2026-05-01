import type { AgentNavLink } from "@agentnav/core";
import { cleanText } from "./inference";

function purposeFromAnchor(anchor: HTMLAnchorElement): string | undefined {
  return (
    anchor.getAttribute("data-agent-purpose") ||
    anchor.getAttribute("aria-label") ||
    anchor.closest("[aria-label]")?.getAttribute("aria-label") ||
    undefined
  );
}

export function scanNavigation(): AgentNavLink[] {
  const selectors = [
    "nav a[href]",
    "header a[href]",
    "footer a[href]",
    '[aria-label*="breadcrumb" i] a[href]',
    "a[href]"
  ];
  const anchors = selectors.flatMap((selector) => [...document.querySelectorAll<HTMLAnchorElement>(selector)]);
  const seen = new Set<string>();
  const links: AgentNavLink[] = [];

  for (const anchor of anchors) {
    const text = cleanText(anchor.textContent || anchor.getAttribute("aria-label") || anchor.title);
    if (!text || !anchor.href) continue;
    const key = `${text.toLowerCase()} ${anchor.href}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const inLandmark = Boolean(anchor.closest("nav, header, footer, [aria-label*='breadcrumb' i]"));
    const purpose = purposeFromAnchor(anchor);
    links.push({
      text,
      href: anchor.href,
      ...(purpose ? { purpose } : {}),
      confidence: inLandmark ? 0.9 : 0.55
    });
  }

  return links;
}
