import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentAction } from "./AgentAction";
import { AgentEntity } from "./AgentEntity";
import { AgentField } from "./AgentField";
import { AgentForm } from "./AgentForm";
import { AgentNavProvider } from "./AgentNavProvider";

describe("@agentnav/react", () => {
  it("renders data-agent entity and field attributes", () => {
    const html = renderToStaticMarkup(
      <AgentNavProvider siteName="Site" sitePurpose="Testing" domain="https://example.com">
        <AgentEntity id="villa-a" type="real_estate_unit" name="Villa Type A">
          <AgentField name="price" value={12500000} currency="EGP">
            12,500,000 EGP
          </AgentField>
        </AgentEntity>
      </AgentNavProvider>
    );

    expect(html).toContain('data-agent-entity="real_estate_unit"');
    expect(html).toContain('data-agent-field="price"');
    expect(html).toContain('data-agent-currency="EGP"');
  });

  it("clones action and form children with safety attributes", () => {
    const html = renderToStaticMarkup(
      <AgentNavProvider siteName="Site" sitePurpose="Testing" domain="https://example.com">
        <AgentAction id="book_viewing" type="book" risk="booking" requiresUserConfirmation>
          <button>Book Viewing</button>
        </AgentAction>
        <AgentForm id="lead_capture" risk="shares_personal_data" requiresUserConfirmation>
          <form>
            <button>Submit</button>
          </form>
        </AgentForm>
      </AgentNavProvider>
    );

    expect(html).toContain('data-agent-action="book_viewing"');
    expect(html).toContain('data-agent-requires-confirmation="true"');
    expect(html).toContain('data-agent-form="lead_capture"');
  });
});
