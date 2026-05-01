import { describe, expect, it } from "vitest";
import { formatScoreOutput } from "./commands/score";
import type { AgentPage } from "@agentnav/core";

describe("@agentnav/cli", () => {
  it("formats score output", () => {
    const page = {
      score: {
        score: 78,
        grade: "B",
        breakdown: {
          pageIdentity: 8,
          navigation: 13,
          entities: 11,
          actions: 12,
          forms: 10,
          structuredData: 8,
          safety: 9,
          freshness: 5
        },
        warnings: [
          {
            severity: "high",
            code: "booking",
            message: "Booking action requires confirmation metadata."
          }
        ]
      }
    } as AgentPage;

    const output = formatScoreOutput(page);
    expect(output).toContain("Agent Readiness Score: 78/100");
    expect(output).toContain("Booking action requires confirmation metadata.");
  });
});
