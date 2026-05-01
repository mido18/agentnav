import { defineAgentNavConfig } from "@agentnav/next";

export default defineAgentNavConfig({
  siteName: "Hyde Park",
  domain: "https://example.com",
  purpose: "a real estate project website for browsing units and booking viewings",
  language: "en",
  importantPages: [
    {
      title: "Available Units",
      url: "/units",
      intent: "search_inventory",
      description: "Search and compare apartments, villas, and townhouses."
    },
    {
      title: "Book Viewing",
      url: "/book-viewing",
      intent: "schedule_visit",
      description: "Request a viewing appointment."
    }
  ],
  policies: {
    agentAllowed: ["read_content", "compare_options", "prepare_forms"],
    requiresConfirmation: ["submit_lead", "book_viewing", "make_payment"],
    disallowed: ["submit_payment_without_user_confirmation", "ignore_user_budget"]
  },
  business: {
    name: "Hyde Park",
    phone: "+20 100 000 0000",
    email: "sales@example.com",
    address: "New Cairo, Cairo, Egypt",
    sameAs: ["https://example.com"]
  },
  actions: [
    {
      id: "search_units",
      name: "Search units",
      type: "search",
      method: "GET",
      endpoint: "/api/agent/search-units",
      safe: true,
      requiresUserConfirmation: false,
      risk: "none",
      confidence: 1,
      source: "config",
      inputSchema: {
        type: "object",
        properties: {
          location: { type: "string" },
          min_price: { type: "number" },
          max_price: { type: "number" },
          bedrooms: { type: "integer" }
        }
      }
    },
    {
      id: "book_viewing",
      name: "Book viewing",
      description: "Book a viewing appointment.",
      type: "book",
      method: "POST",
      endpoint: "/api/agent/book-viewing",
      safe: false,
      requiresUserConfirmation: true,
      risk: "booking",
      confidence: 1,
      source: "config",
      inputSchema: {
        type: "object",
        required: ["unit_id", "name", "phone", "preferred_date"],
        properties: {
          unit_id: { type: "string" },
          name: { type: "string" },
          phone: { type: "string" },
          preferred_date: { type: "string", format: "date" }
        }
      }
    }
  ]
});
