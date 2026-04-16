import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Shield,
  BookOpen,
  Award,
  Calendar,
  Pencil,
  Check,
  X,
} from "lucide-react";

interface UserStats {
  totalCourses: number;
  completedCourses: number;
  certificates: number;
}

const roleBadge: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrateur", color: "bg-destructive/10 text-destructive" },
  apprenant: { label: "Apprenant", color: "bg-accent/10 text-accent" },
  exploitant: { label: "Exploitant", color: "bg-primary/10 text-primary" },
};

const MonCompte = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { toast } = useToast();

  const [stats, setStats] = useState<UserStats>({ totalCourses: 0, completedCourses: 0, certificates: 0 });
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data: purchases } = await supabase
        .from("user_courses")
        .select("id, payment_status")
        .eq("user_id", user.id);

      const total = purchases?.filter((p) => p.payment_status === "completed").length ?? 0;
      setStats({
        totalCourses: total,
        completedCourses: 0, // will be used when quiz system is added
        certificates: 0, // will be used when certificate system is added
      });
    };
    fetchStats();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profil mis à jour" });
      setEditing(false);
    }
    setSaving(false);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const badge = roleBadge[profile?.role ?? "apprenant"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-10">
            <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">
              Espace personnel
            </p>
            <h1
              className="font-display font-bold text-4xl text-primary uppercase"
              style={{ letterSpacing: "-0.03em" }}
            >
              Mon Compte
            </h1>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Stats Cards */}
            <StatCard icon={<BookOpen size={20} />} label="Formations acquises" value={stats.totalCourses} />
            <StatCard icon={<Award size={20} />} label="Formations terminées" value={stats.completedCourses} />
            <StatCard icon={<Award size={20} />} label="Certificats obtenus" value={stats.certificates} />
          </div>

          {/* Profile Card */}
          <div className="mt-8 bg-card border border-border rounded-sm overflow-hidden">
            <div className="bg-primary/5 px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-primary flex items-center gap-2">
                <User size={18} />
                Informations personnelles
              </h2>
              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="font-body text-sm"
                >
                  <Pencil size={14} className="mr-1" />
                  Modifier
                </Button>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* Full Name */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <Label className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                    Nom complet
                  </Label>
                  {editing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button size="icon" variant="ghost" onClick={handleSave} disabled={saving}>
                        <Check size={16} className="text-green-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(false);
                          setFullName(profile?.full_name ?? "");
                        }}
                      >
                        <X size={16} className="text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <p className="font-body text-foreground mt-1">
                      {profile?.full_name || "—"}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <Label className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                    Adresse email
                  </Label>
                  <p className="font-body text-foreground mt-1">{user?.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <Label className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                    Rôle
                  </Label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold font-body rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Calendar size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <Label className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                    Membre depuis
                  </Label>
                  <p className="font-body text-foreground mt-1">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href="/formations"
              className="bg-card border border-border rounded-sm p-5 flex items-center gap-4 hover:border-accent transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <BookOpen size={20} className="text-accent" />
              </div>
              <div>
                <p className="font-display font-semibold text-primary">Catalogue</p>
                <p className="font-body text-sm text-muted-foreground">
                  Découvrir les formations
                </p>
              </div>
            </a>
            <a
              href="/mes-formations"
              className="bg-card border border-border rounded-sm p-5 flex items-center gap-4 hover:border-accent transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Award size={20} className="text-accent" />
              </div>
              <div>
                <p className="font-display font-semibold text-primary">Mes formations</p>
                <p className="font-body text-sm text-muted-foreground">
                  Accéder à vos cours achetés
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="bg-card border border-border rounded-sm p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
      {icon}
    </div>
    <div>
      <p className="font-display font-bold text-2xl text-primary">{value}</p>
      <p className="font-body text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export default MonCompte;
