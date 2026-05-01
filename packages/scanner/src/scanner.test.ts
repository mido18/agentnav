import { beforeEach, describe, expect, it } from "vitest";
import { scanActions } from "./scanActions";
import { scanCurrentPage } from "./scanCurrentPage";
import { scanEntities } from "./scanEntities";
import { resolveFieldLabel, scanForms } from "./scanForms";
import { scanJsonLd } from "./scanJsonLd";
import { scanCanonicalUrl, scanMetaDescription } from "./scanMeta";

function loadHtml(html: string, url = "https://example.com/units") {
  document.open();
  document.write(html);
  document.close();
  window.history.replaceState({}, "", url);
}

describe("@agentnav/scanner", () => {
  beforeEach(() => {
    loadHtml(`
      <!doctype html>
      <html lang="en">
        <head>
          <title>Available Units</title>
          <meta name="description" content="Search units">
          <link rel="canonical" href="https://example.com/units">
          <script type="application/ld+json">{"@type":"Product","name":"Villa A"}</script>
        </head>
        <body>
          <header><nav><a href="/units">Units</a></nav></header>
          <section data-agent-entity="real_estate_unit" data-agent-id="villa-a" data-agent-name="Villa Type A">
            <h2>Villa Type A</h2>
            <span data-agent-field="price" data-agent-value="12500000" data-agent-currency="EGP">12,500,000 EGP</span>
            <button data-agent-action="book_viewing" data-agent-action-type="book" data-agent-risk="booking" data-agent-requires-confirmation="true">Book Viewing</button>
          </section>
          <form id="lead" method="post" data-agent-risk="shares_personal_data" data-agent-requires-confirmation="true">
            <label for="phone">Phone</label>
            <input id="phone" name="phone" required>
            <button type="submit">Request Viewing</button>
          </form>
        </body>
      </html>
    `);
  });

  it("detects document metadata", () => {
    expect(document.title).toBe("Available Units");
    expect(scanMetaDescription()).toBe("Search units");
    expect(scanCanonicalUrl()).toBe("https://example.com/units");
  });

  it("detects valid JSON-LD and warns on invalid JSON-LD", () => {
    expect(scanJsonLd()).toHaveLength(1);
    loadHtml(`<script type="application/ld+json">{bad json</script>`);
    const warnings = [];
    expect(scanJsonLd(warnings)).toEqual([]);
    expect(warnings).toHaveLength(1);
  });

  it("detects data-agent entities", () => {
    const entities = scanEntities();
    expect(entities.some((entity) => entity.id === "villa-a" && entity.type === "real_estate_unit")).toBe(true);
  });

  it("detects buttons as confirmation-required actions", () => {
    const action = scanActions().find((item) => item.id === "book_viewing");
    expect(action?.type).toBe("book");
    expect(action?.requiresUserConfirmation).toBe(true);
    expect(action?.safe).toBe(false);
  });

  it("detects forms, fields, and labels", () => {
    const input = document.querySelector<HTMLInputElement>("#phone");
    expect(input).toBeTruthy();
    expect(resolveFieldLabel(input!).label).toBe("Phone");
    const form = scanForms()[0];
    expect(form?.fields[0]?.label).toBe("Phone");
    expect(form?.requiresUserConfirmation).toBe(true);
  });

  it("returns a full AgentPage object", () => {
    const page = scanCurrentPage();
    expect(page.url).toBe("https://example.com/units");
    expect(page.entities.length).toBeGreaterThan(0);
    expect(page.score.score).toBeGreaterThan(0);
  });
});
