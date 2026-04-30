type PageHeroProps = {
  title: string;
  text: string;
};

export function PageHero({ title, text }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="section-container">
        <span>Ethio Unity</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}
