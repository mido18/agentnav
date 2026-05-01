import { AgentForm } from "@agentnav/react";

export const metadata = {
  title: "Book Viewing",
  description: "Request a property viewing appointment.",
  alternates: {
    canonical: "https://example.com/book-viewing"
  }
};

export default function BookViewingPage() {
  return (
    <section className="page-shell">
      <h1>Book Viewing</h1>
      <p className="page-intro">Request a viewing appointment with the sales team.</p>

      <AgentForm id="lead_capture" name="Viewing request" risk="shares_personal_data" requiresUserConfirmation>
        <form className="booking-form" method="post" action="/api/agent/book-viewing">
          <label htmlFor="unit_id">
            Preferred unit
            <select id="unit_id" name="unit_id" required data-agent-purpose="unit to view">
              <option value="">Select a unit</option>
              <option value="villa-a">Villa Type A</option>
              <option value="townhouse-b">Townhouse Type B</option>
              <option value="apartment-c">Apartment Type C</option>
            </select>
          </label>
          <label htmlFor="name">
            Full name
            <input id="name" name="name" required autoComplete="name" />
          </label>
          <label htmlFor="phone">
            Phone number
            <input id="phone" name="phone" type="tel" required autoComplete="tel" />
          </label>
          <label htmlFor="preferred_date">
            Preferred date
            <input id="preferred_date" name="preferred_date" type="date" required />
          </label>
          <label htmlFor="notes">
            Notes
            <textarea id="notes" name="notes" rows={4} placeholder="Budget, timing, or unit preferences" />
          </label>
          <button
            type="submit"
            data-agent-action="submit_lead"
            data-agent-action-type="submit_form"
            data-agent-risk="shares_personal_data"
            data-agent-requires-confirmation="true"
          >
            Request Viewing
          </button>
        </form>
      </AgentForm>
    </section>
  );
}
