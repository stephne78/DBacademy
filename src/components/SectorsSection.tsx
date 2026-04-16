import { Car, Gauge, ShieldCheck, Wrench, Eye, FileCheck } from "lucide-react";

const sectors = [
  { icon: Car, label: "Véhicules Légers", count: "12 modules" },
  { icon: Gauge, label: "Contrôle Antipollution", count: "8 modules" },
  { icon: ShieldCheck, label: "Sécurité Routière", count: "10 modules" },
  { icon: Wrench, label: "Mécanique Générale", count: "9 modules" },
  { icon: Eye, label: "Inspection Visuelle", count: "6 modules" },
  { icon: FileCheck, label: "Réglementation & Normes", count: "7 modules" },
];

const SectorsSection = () => {
  return (
    <section id="sectors" className="py-[12vh]">
      <div className="container">
        <div className="mb-12">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Spécialités
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-primary uppercase" style={{ letterSpacing: "-0.03em" }}>
            Nos Spécialités
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl" style={{ lineHeight: "1.6" }}>
            Une couverture complète de tous les domaines du contrôle technique automobile.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {sectors.map((sector) => (
            <a
              key={sector.label}
              href="#"
              className="group flex items-start gap-4 p-8 bg-background hover:bg-secondary transition-colors duration-200"
            >
              <sector.icon size={24} strokeWidth={1.5} className="text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-semibold text-primary group-hover:text-accent transition-colors duration-200">
                  {sector.label}
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1 tabular-nums">{sector.count}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectorsSection;
