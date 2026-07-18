import { distinctions } from "../../data/content";

export function ProductDistinction() {
  return (
    <section className="distinction section" aria-labelledby="distinction-title">
      <div className="container">
        <p className="eyebrow">A different operating model</p>
        <h2 id="distinction-title">
          Not a taxi. Not a public lift group. <span>A verified commute network.</span>
        </h2>
        <div className="distinction-list">
          {distinctions.map((item) => (
            <article key={item.title}>
              <span className="mono">{item.number}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
