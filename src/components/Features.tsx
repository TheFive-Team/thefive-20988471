export function Features() {
  const features = [
    {
      title: "Unmatched Quality",
      desc: "We source only the finest materials from around the world to ensure your jacket lasts a lifetime.",
      img: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80"
    },
    {
      title: "Designed to Stand Out",
      desc: "A minimalist approach to luxury. The clean lines and tailored fit guarantee a sharp look anywhere you go.",
      img: "https://images.unsplash.com/photo-1550614000-4b95d415d183?w=800&q=80"
    }
  ];

  return (
    <section className="bg-zinc-50 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Why Choose Vetement Lux?</h2>
          <p className="text-zinc-600 text-lg">
            We didn't just design a jacket. We engineered an experience of absolute comfort and undeniable style.
          </p>
        </div>

        <div className="space-y-16">
          {features.map((feat, i) => (
            <div key={i} className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1 w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img src={feat.img} alt={feat.title} className="w-full h-full object-cover" width={800} height={800} loading="lazy" decoding="async" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-zinc-900">{feat.title}</h3>
                <p className="text-zinc-600 text-lg leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
