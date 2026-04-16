import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProfile } from "@/hooks/useProfile";
import { Clock, Award, Euro, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  level: string;
  duration: string;
  price_euros: number;
  certification: string | null;
  target_role: string;
}

const Formations = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const { profile } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data) setCourses(data as Course[]);

      if (profile) {
        const { data: purchases } = await supabase
          .from("user_courses")
          .select("course_id")
          .eq("user_id", profile.id);
        if (purchases) {
          setPurchasedIds(new Set(purchases.map((p: any) => p.course_id)));
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  const filteredCourses = courses;

  const handlePurchase = async (courseId: string) => {
    if (!profile) return;
    const { error } = await supabase.from("user_courses").insert({
      user_id: profile.id,
      course_id: courseId,
      payment_status: "completed",
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setPurchasedIds((prev) => new Set(prev).add(courseId));
      toast({ title: "Formation acquise !", description: "Vous avez accès à cette formation." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container">
          <div className="mb-12">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">Catalogue</p>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-primary uppercase" style={{ letterSpacing: "-0.03em" }}>
              Nos Formations
            </h1>
            <p className="font-body text-muted-foreground mt-4 max-w-xl" style={{ lineHeight: "1.6" }}>
              {profile?.role === "exploitant"
                ? "Formations dédiées aux exploitants de centres de contrôle technique."
                : "Des parcours certifiants pour devenir contrôleur technique qualifié."}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-body text-muted-foreground text-lg">Aucune formation disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <article
                  key={course.id}
                  className="group bg-card border border-border rounded-sm overflow-hidden hover:-translate-y-1 hover:border-primary transition-all duration-300"
                  style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                  <div className="relative h-48 overflow-hidden bg-secondary">
                    {course.image_url ? (
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Award size={48} className="text-muted-foreground/30" />
                      </div>
                    )}
                    <span className="badge-level absolute top-4 left-4">{course.level}</span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display font-semibold text-lg text-primary mb-2" style={{ lineHeight: "1.2" }}>
                      {course.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mb-6" style={{ lineHeight: "1.6" }}>
                      {course.description}
                    </p>

                    <div className="border-t border-border pt-4 grid grid-cols-3 gap-2 mb-4">
                      <div>
                        <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Durée</p>
                        <p className="font-body text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
                          <Clock size={12} className="text-accent" />
                          {course.duration}
                        </p>
                      </div>
                      <div>
                        <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Prix</p>
                        <p className="font-body text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
                          <Euro size={12} className="text-accent" />
                          {course.price_euros}€
                        </p>
                      </div>
                      <div>
                        <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Certif.</p>
                        <p className="font-body text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
                          <Award size={12} className="text-accent" />
                          {course.certification || "Oui"}
                        </p>
                      </div>
                    </div>

                    {purchasedIds.has(course.id) ? (
                      <a href={`/cours/${course.id}`} className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground font-body font-semibold rounded-sm hover:bg-primary/90 transition-colors text-sm">
                        ✓ Accéder à la formation
                      </a>
                    ) : (
                      <Button onClick={() => handlePurchase(course.id)} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold">
                        <ShoppingCart size={16} className="mr-2" />
                        Acheter — {course.price_euros}€
                      </Button>
                    )}
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

export default Formations;
