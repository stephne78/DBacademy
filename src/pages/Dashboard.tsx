import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import CourseContentEditor from "@/components/CourseContentEditor";

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
  is_published: boolean;
  created_at: string;
}

const emptyForm = {
  title: "",
  description: "",
  image_url: "",
  level: "Fondamental",
  duration: "40h",
  price_euros: 0,
  certification: "",
  target_role: "apprenant" as "admin" | "apprenant" | "exploitant",
  is_published: false,
};

const Dashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contentEditorId, setContentEditorId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const { profile, isAdmin } = useProfile();
  const { toast } = useToast();

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (data) setCourses(data as Course[]);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      ...form,
      price_euros: Number(form.price_euros),
      image_url: form.image_url || null,
      certification: form.certification || null,
    };

    if (editingId) {
      const { error } = await supabase.from("courses").update(payload).eq("id", editingId);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Formation mise à jour" });
      }
    } else {
      const { error } = await supabase.from("courses").insert(payload);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Formation créée" });
      }
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setLoading(false);
    fetchCourses();
  };

  const handleEdit = (course: Course) => {
    setForm({
      title: course.title,
      description: course.description,
      image_url: course.image_url || "",
      level: course.level,
      duration: course.duration,
      price_euros: course.price_euros,
      certification: course.certification || "",
      target_role: course.target_role as "admin" | "apprenant" | "exploitant",
      is_published: course.is_published,
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Formation supprimée" });
      fetchCourses();
    }
  };

  const togglePublish = async (course: Course) => {
    await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id);
    fetchCourses();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container text-center py-20">
          <p className="font-body text-destructive text-lg">Accès réservé aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-2">Administration</p>
              <h1 className="font-display font-bold text-3xl text-primary uppercase">Tableau de Bord</h1>
            </div>
            <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold">
              <Plus size={16} className="mr-2" />
              Nouvelle formation
            </Button>
          </div>

          {showForm && (
            <div className="bg-card border border-border rounded-sm p-6 mb-8 space-y-4">
              <h2 className="font-display font-semibold text-lg text-primary">
                {editingId ? "Modifier la formation" : "Créer une formation"}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-body text-sm">Titre</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contrôle Technique VL" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm">URL de l'image</Label>
                  <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-body text-sm">Description</Label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description de la formation..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm">Niveau</Label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>Fondamental</option>
                    <option>Avancé</option>
                    <option>Expert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm">Durée</Label>
                  <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="120h" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm">Prix (€)</Label>
                  <Input type="number" value={form.price_euros} onChange={(e) => setForm({ ...form, price_euros: Number(e.target.value) })} placeholder="500" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm">Certification</Label>
                  <Input value={form.certification} onChange={(e) => setForm({ ...form, certification: e.target.value })} placeholder="Agréé CT" />
                </div>
                <div className="space-y-2">
                  <Label className="font-body text-sm">Public cible</Label>
                  <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value as "admin" | "apprenant" | "exploitant" })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="apprenant">Apprenant</option>
                    <option value="exploitant">Exploitant</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} id="published" className="h-4 w-4" />
                  <Label htmlFor="published" className="font-body text-sm">Publier immédiatement</Label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={loading || !form.title} className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold">
                  {loading ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="font-body">
                  Annuler
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {courses.length === 0 ? (
              <p className="text-center py-12 font-body text-muted-foreground">Aucune formation créée. Cliquez sur "Nouvelle formation" pour commencer.</p>
            ) : (
              courses.map((course) => (
                <div key={course.id}>
                  <div className="bg-card border border-border rounded-sm p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-primary truncate">{course.title}</h3>
                        <span className="badge-level text-[10px]">{course.level}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium font-body rounded-sm ${course.is_published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                          {course.is_published ? "Publié" : "Brouillon"}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium font-body rounded-sm bg-secondary text-secondary-foreground">
                          {course.target_role}
                        </span>
                      </div>
                      <p className="font-body text-sm text-muted-foreground truncate">{course.description}</p>
                      <p className="font-body text-sm font-semibold text-accent mt-1">{course.price_euros}€ · {course.duration}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => setContentEditorId(contentEditorId === course.id ? null : course.id)} title="Gérer le contenu">
                        <BookOpen size={16} className={contentEditorId === course.id ? "text-accent" : ""} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => togglePublish(course)} title={course.is_published ? "Dépublier" : "Publier"}>
                        {course.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(course)}>
                        <Pencil size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(course.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  {contentEditorId === course.id && (
                    <div className="border border-border border-t-0 rounded-b-sm p-4 bg-secondary/20">
                      <CourseContentEditor courseId={course.id} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
