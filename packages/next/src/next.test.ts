import { describe, expect, it } from "vitest";
import { createActionsJsonRoute } from "./createActionsJsonRoute";
import { createAgentJsonRoute } from "./createAgentJsonRoute";
import { createLlmsTxtRoute } from "./createLlmsTxtRoute";
import { defineAgentNavConfig } from "./defineAgentNavConfig";

describe("@agentnav/next", () => {
  const config = defineAgentNavConfig({
    siteName: "Site",
    domain: "https://example.com",
    purpose: "testing",
    actions: []
  });

  it("creates a text route for llms.txt", async () => {
    const response = createLlmsTxtRoute(config)();
    expect(response.headers.get("content-type")).toContain("text/plain");
    expect(await response.text()).toContain("# Site");
  });

  it("creates JSON routes", async () => {
    const agent = await createAgentJsonRoute(config)().json();
    const actions = await createActionsJsonRoute(config)().json();
    expect(agent.site.name).toBe("Site");
    expect(actions.version).toBe("0.1");
  });
});
