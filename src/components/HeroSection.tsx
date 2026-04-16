import heroImage from "@/assets/hero-industrial.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Contrôleur technique inspectant un véhicule"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      <div className="container relative z-10 py-[12vh]">
        <div className="max-w-3xl">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-6 animate-fade-up">
            DB Consulting présente
          </p>

          <h1
            className="font-display font-bold uppercase text-primary-foreground leading-[0.95] mb-8 animate-fade-up"
            style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", letterSpacing: "-0.04em", animationDelay: "0.1s" }}
          >
            DB<br />Academy
          </h1>

          <p
            className="font-body text-lg text-primary-foreground/80 max-w-xl mb-10 animate-fade-up"
            style={{ lineHeight: "1.6", animationDelay: "0.2s" }}
          >
            Devenez contrôleur technique certifié. Des formations professionnelles
            rigoureuses pour maîtriser l'inspection automobile selon les normes internationales.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <a
              href="#programmes"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-accent-foreground font-body text-sm font-semibold uppercase tracking-wider rounded-sm hover:-translate-y-0.5 transition-transform duration-200"
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              Découvrir nos formations
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center px-8 py-4 border border-primary-foreground/30 text-primary-foreground font-body text-sm font-semibold uppercase tracking-wider rounded-sm hover:border-primary-foreground/60 transition-colors duration-200"
            >
              En savoir plus
            </a>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-primary-foreground/20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "5K+", label: "Contrôleurs formés" },
            { value: "98%", label: "Taux de réussite" },
            { value: "15+", label: "Centres partenaires" },
            { value: "30+", label: "Modules techniques" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display font-bold text-3xl text-accent tabular-nums">{stat.value}</p>
              <p className="font-body text-sm text-primary-foreground/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
