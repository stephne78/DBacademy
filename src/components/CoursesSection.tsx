import { Clock, Award, ArrowRight } from "lucide-react";
import courseQuality from "@/assets/course-quality.jpg";
import courseLab from "@/assets/course-lab.jpg";
import courseSupply from "@/assets/course-supply.jpg";

const courses = [
  {
    image: courseQuality,
    level: "Fondamental",
    title: "Contrôle Technique Véhicules Légers",
    description: "Maîtrisez les points de contrôle réglementaires, les défaillances mineures et critiques sur les VL.",
    duration: "120h",
    credits: "Niveau 1",
    certification: "Agréé CT",
  },
  {
    image: courseLab,
    level: "Avancé",
    title: "Diagnostic Électronique & OBD",
    description: "Techniques de diagnostic embarqué, lecture des codes défaut et contrôle des systèmes antipollution.",
    duration: "80h",
    credits: "Niveau 2",
    certification: "Spécialiste OBD",
  },
  {
    image: courseSupply,
    level: "Expert",
    title: "Gestion de Centre de Contrôle Technique",
    description: "Management d'équipe, réglementation, conformité et gestion opérationnelle d'un centre agréé.",
    duration: "60h",
    credits: "Niveau 3",
    certification: "Manager CT",
  },
];

const CoursesSection = () => {
  return (
    <section id="programmes" className="py-[12vh] bg-secondary">
      <div className="container">
        <div className="mb-12">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            Formations
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-primary uppercase" style={{ letterSpacing: "-0.03em" }}>
            Technical Mastery
          </h2>
          <p className="font-body text-muted-foreground mt-4 max-w-xl" style={{ lineHeight: "1.6" }}>
            Des parcours certifiants conçus par des experts du contrôle technique automobile.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <article
              key={course.title}
              className="group bg-card border border-border rounded-sm overflow-hidden hover:-translate-y-1 hover:border-primary transition-all duration-300"
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="badge-level absolute top-4 left-4">{course.level}</span>
              </div>

              <div className="p-6">
                <h3 className="font-display font-semibold text-lg text-primary mb-2" style={{ lineHeight: "1.2" }}>
                  {course.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-6" style={{ lineHeight: "1.6" }}>
                  {course.description}
                </p>

                <div className="border-t border-border pt-4 grid grid-cols-3 gap-2">
                  <div>
                    <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Durée</p>
                    <p className="font-body text-sm font-semibold text-foreground tabular-nums flex items-center gap-1 mt-0.5">
                      <Clock size={12} className="text-accent" />
                      {course.duration}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Niveau</p>
                    <p className="font-body text-sm font-semibold text-foreground tabular-nums mt-0.5">{course.credits}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Certif.</p>
                    <p className="font-body text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <Award size={12} className="text-accent" />
                      Oui
                    </p>
                  </div>
                </div>

                <a
                  href="#"
                  className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-primary hover:text-accent transition-colors"
                >
                  Détails du programme
                  <ArrowRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
