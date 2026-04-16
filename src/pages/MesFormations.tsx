import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProfile } from "@/hooks/useProfile";
import { Clock, Award, BookOpen } from "lucide-react";

interface PurchasedCourse {
  id: string;
  purchased_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    level: string;
    duration: string;
    certification: string | null;
  };
}

const MesFormations = () => {
  const [purchases, setPurchases] = useState<PurchasedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("user_courses")
        .select("id, purchased_at, course:courses(id, title, description, image_url, level, duration, certification)")
        .eq("user_id", profile.id)
        .eq("payment_status", "completed");

      if (data) setPurchases(data as any);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container">
          <div className="mb-12">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Mon espace</p>
            <h1 className="font-display font-bold text-4xl text-primary uppercase" style={{ letterSpacing: "-0.03em" }}>
              Mes Formations
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-body text-muted-foreground text-lg">Vous n'avez pas encore de formations.</p>
              <a href="/formations" className="inline-flex items-center mt-4 px-6 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm hover:bg-accent/90 transition-colors">
                Voir le catalogue
              </a>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((p) => (
                <article key={p.id} className="bg-card border border-border rounded-sm overflow-hidden">
                  <div className="relative h-40 overflow-hidden bg-secondary">
                    {p.course.image_url ? (
                      <img src={p.course.image_url} alt={p.course.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Award size={48} className="text-muted-foreground/30" />
                      </div>
                    )}
                    <span className="badge-level absolute top-4 left-4">{p.course.level}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-semibold text-lg text-primary mb-2">{p.course.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mb-4" style={{ lineHeight: "1.6" }}>{p.course.description}</p>
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <span className="font-body text-muted-foreground flex items-center gap-1">
                        <Clock size={12} className="text-accent" /> {p.course.duration}
                      </span>
                      {p.course.certification && (
                        <span className="font-body text-muted-foreground flex items-center gap-1">
                          <Award size={12} className="text-accent" /> {p.course.certification}
                        </span>
                      )}
                    </div>
                    <a
                      href={`/cours/${p.course.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-body text-sm font-semibold rounded-sm hover:bg-accent/90 transition-colors"
                    >
                      <BookOpen size={14} />
                      Accéder au cours
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MesFormations;
