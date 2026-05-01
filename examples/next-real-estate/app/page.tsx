import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>Hyde Park</h1>
        <p>
          Browse available villas, apartments, and townhouses with clear pricing, bedroom counts, and booking actions
          exposed for AI agents.
        </p>
        <div className="button-row">
          <Link className="button" href="/units" data-agent-action="browse_units" data-agent-action-type="navigate">
            Browse Units
          </Link>
          <Link
            className="button secondary"
            href="/book-viewing"
            data-agent-action="book_viewing_home"
            data-agent-action-type="book"
            data-agent-risk="booking"
            data-agent-requires-confirmation="true"
          >
            Book Viewing
          </Link>
        </div>
      </div>
      <div className="hero-panel" role="img" aria-label="Modern real estate villas" />
    </section>
  );
}
