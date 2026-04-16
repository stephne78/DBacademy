import { CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  { step: "01", title: "Inscription", desc: "Choisissez votre parcours et accédez à la plateforme DB Academy." },
  { step: "02", title: "Formation", desc: "Cours théoriques et pratiques avec évaluations continues." },
  { step: "03", title: "Examen", desc: "Épreuve finale conforme aux exigences réglementaires du contrôle technique." },
  { step: "04", title: "Agrément", desc: "Obtention de votre certification et agrément pour exercer." },
];

const CertificationSection = () => {
  return (
    <section id="certifications" className="py-[12vh] bg-primary">
      <div className="container">
        <div className="mb-12">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Parcours
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-primary-foreground uppercase" style={{ letterSpacing: "-0.03em" }}>
            Parcours de Certification
          </h2>
          <p className="font-body text-primary-foreground/70 mt-4 max-w-xl" style={{ lineHeight: "1.6" }}>
            De la formation initiale à l'agrément professionnel, un parcours structuré par DB Consulting.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((item, i) => (
            <div key={item.step} className="relative">
              <div className="border border-primary-foreground/20 rounded-sm p-6 h-full">
                <p className="font-display font-bold text-3xl text-accent mb-4 tabular-nums">{item.step}</p>
                <h3 className="font-display font-semibold text-lg text-primary-foreground mb-2">{item.title}</h3>
                <p className="font-body text-sm text-primary-foreground/60" style={{ lineHeight: "1.6" }}>
                  {item.desc}
                </p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight size={20} className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-accent z-10" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-accent" />
            <span className="font-body text-sm text-primary-foreground/80">Agrément reconnu par l'État</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-accent" />
            <span className="font-body text-sm text-primary-foreground/80">Conforme aux normes réglementaires</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-accent" />
            <span className="font-body text-sm text-primary-foreground/80">Certificat sécurisé vérifiable</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertificationSection;
