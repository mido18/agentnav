import { AgentAction, AgentEntity, AgentField } from "@agentnav/react";

const units = [
  {
    id: "villa-a",
    name: "Villa Type A",
    price: 12500000,
    bedrooms: 4,
    area: "320 sqm",
    description: "Standalone villa with garden and family living area."
  },
  {
    id: "townhouse-b",
    name: "Townhouse Type B",
    price: 8400000,
    bedrooms: 3,
    area: "240 sqm",
    description: "Corner townhouse near the clubhouse and park trail."
  },
  {
    id: "apartment-c",
    name: "Apartment Type C",
    price: 4100000,
    bedrooms: 2,
    area: "135 sqm",
    description: "Efficient apartment with balcony and open kitchen."
  }
];

export const metadata = {
  title: "Available Units",
  description: "Search and compare apartments, villas, and townhouses.",
  alternates: {
    canonical: "https://example.com/units"
  }
};

export default function UnitsPage() {
  return (
    <section className="page-shell">
      <h1>Available Units</h1>
      <p className="page-intro">Compare available homes by price, bedrooms, and unit type.</p>

      <form className="toolbar" role="search" data-agent-form="search_units" data-agent-risk="none">
        <label>
          Unit type
          <select name="unit_type" aria-label="Unit type">
            <option value="">Any</option>
            <option value="villa">Villa</option>
            <option value="townhouse">Townhouse</option>
            <option value="apartment">Apartment</option>
          </select>
        </label>
        <label>
          Bedrooms
          <select name="bedrooms" aria-label="Bedrooms">
            <option value="">Any</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </label>
        <label>
          Max price
          <input name="max_price" type="number" min="0" placeholder="EGP" aria-label="Maximum price" />
        </label>
        <button type="submit" data-agent-action="search_units" data-agent-action-type="search">
          Search
        </button>
      </form>

      <div className="unit-grid">
        {units.map((unit) => (
          <AgentEntity
            key={unit.id}
            type="real_estate_unit"
            id={unit.id}
            name={unit.name}
            description={unit.description}
            className="unit-card"
            fields={{
              price: unit.price,
              currency: "EGP",
              bedrooms: unit.bedrooms,
              area: unit.area
            }}
          >
            <h2>{unit.name}</h2>
            <p>{unit.description}</p>
            <div className="unit-meta">
              <AgentField name="price" value={unit.price} currency="EGP" className="price">
                {unit.price.toLocaleString("en-EG")} EGP
              </AgentField>
              <AgentField name="bedrooms" value={unit.bedrooms}>
                {unit.bedrooms} bedrooms
              </AgentField>
              <AgentField name="area" value={unit.area}>
                {unit.area}
              </AgentField>
            </div>
            <AgentAction
              id={`book_viewing_${unit.id}`}
              type="book"
              risk="booking"
              requiresUserConfirmation
              description={`Book a viewing for ${unit.name}`}
            >
              <button type="button">Book Viewing</button>
            </AgentAction>
          </AgentEntity>
        ))}
      </div>
    </section>
  );
}
