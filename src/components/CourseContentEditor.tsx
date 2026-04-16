import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Video,
  FileSpreadsheet,
  Type,
  ChevronDown,
  ChevronRight,
  Upload,
  Save,
  Loader2,
} from "lucide-react";
import QuizEditor from "./QuizEditor";

interface Chapter {
  id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  content_type: string;
  content_text: string;
  file_url: string | null;
  video_url: string | null;
  sort_order: number;
}

const CONTENT_TYPES = [
  { value: "text", label: "Texte riche", icon: Type },
  { value: "pdf", label: "PDF", icon: FileText },
  { value: "pptx", label: "PowerPoint", icon: FileSpreadsheet },
  { value: "video", label: "Vidéo", icon: Video },
];

const CourseContentEditor = ({ courseId }: { courseId: string }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [passPercentage, setPassPercentage] = useState(70);
  const { toast } = useToast();

  // Fetch pass percentage
  useEffect(() => {
    supabase.from("courses").select("pass_percentage").eq("id", courseId).single().then(({ data }) => {
      if (data && (data as any).pass_percentage) setPassPercentage((data as any).pass_percentage);
    });
  }, [courseId]);

  const savePassPercentage = async (val: number) => {
    setPassPercentage(val);
    await supabase.from("courses").update({ pass_percentage: val } as any).eq("id", courseId);
  };

  const fetchContent = useCallback(async () => {
    const { data: chaptersData } = await supabase
      .from("course_chapters")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order");

    if (!chaptersData) {
      setLoading(false);
      return;
    }

    const chapterIds = chaptersData.map((c: any) => c.id);
    let lessonsData: any[] = [];
    if (chapterIds.length > 0) {
      const { data } = await supabase
        .from("course_lessons")
        .select("*")
        .in("chapter_id", chapterIds)
        .order("sort_order");
      if (data) lessonsData = data;
    }

    const chaptersWithLessons: Chapter[] = chaptersData.map((ch: any) => ({
      ...ch,
      lessons: lessonsData.filter((l: any) => l.chapter_id === ch.id),
    }));

    setChapters(chaptersWithLessons);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const getChapterFromState = useCallback(
    (chapterId: string) => chapters.find((chapter) => chapter.id === chapterId) ?? null,
    [chapters]
  );

  const getLessonFromState = useCallback(
    (chapterId: string, lessonId: string) =>
      getChapterFromState(chapterId)?.lessons.find((lesson) => lesson.id === lessonId) ?? null,
    [getChapterFromState]
  );

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addChapter = async () => {
    const { data, error } = await supabase
      .from("course_chapters")
      .insert({
        course_id: courseId,
        title: "Nouveau chapitre",
        sort_order: chapters.length,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    const newChapter: Chapter = { ...data, lessons: [] };
    setChapters([...chapters, newChapter]);
    setExpandedChapters((prev) => new Set(prev).add(newChapter.id));
  };

  const deleteChapter = async (id: string) => {
    const { error } = await supabase.from("course_chapters").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setChapters(chapters.filter((c) => c.id !== id));
  };

  const updateChapter = (id: string, field: string, value: string) => {
    setChapters(
      chapters.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const saveChapter = async (chapterId: string) => {
    const chapter = getChapterFromState(chapterId);
    if (!chapter) return;

    setSaving(true);
    const { error } = await supabase
      .from("course_chapters")
      .update({ title: chapter.title, description: chapter.description, sort_order: chapter.sort_order })
      .eq("id", chapter.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const addLesson = async (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    const { data, error } = await supabase
      .from("course_lessons")
      .insert({
        chapter_id: chapterId,
        title: "Nouvelle leçon",
        content_type: "text",
        sort_order: chapter?.lessons.length ?? 0,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    setChapters(
      chapters.map((c) =>
        c.id === chapterId ? { ...c, lessons: [...c.lessons, data as Lesson] } : c
      )
    );
  };

  const deleteLesson = async (chapterId: string, lessonId: string) => {
    const { error } = await supabase.from("course_lessons").delete().eq("id", lessonId);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setChapters(
      chapters.map((c) =>
        c.id === chapterId
          ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) }
          : c
      )
    );
  };

  const updateLesson = (chapterId: string, lessonId: string, field: string, value: string) => {
    setChapters(
      chapters.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              lessons: c.lessons.map((l) =>
                l.id === lessonId ? { ...l, [field]: value } : l
              ),
            }
          : c
      )
    );
  };

  const saveLesson = async (chapterId: string, lessonId: string) => {
    const lesson = getLessonFromState(chapterId, lessonId);
    if (!lesson) return;

    setSaving(true);
    const { error } = await supabase
      .from("course_lessons")
      .update({
        title: lesson.title,
        content_type: lesson.content_type,
        content_text: lesson.content_text,
        file_url: lesson.file_url,
        video_url: lesson.video_url,
        sort_order: lesson.sort_order,
      })
      .eq("id", lesson.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Leçon sauvegardée" });
    }
    setSaving(false);
  };

  const handleFileUpload = async (
    chapterId: string,
    lessonId: string,
    file: File
  ) => {
    setUploading(lessonId);
    const ext = file.name.split(".").pop();
    const path = `${courseId}/${chapterId}/${lessonId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("course-files")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Erreur upload", description: uploadError.message, variant: "destructive" });
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("course-files").getPublicUrl(path);
    updateLesson(chapterId, lessonId, "file_url", urlData.publicUrl);

    // Auto-save
    const lesson = chapters
      .find((c) => c.id === chapterId)
      ?.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      await supabase
        .from("course_lessons")
        .update({ file_url: urlData.publicUrl })
        .eq("id", lessonId);
    }

    toast({ title: "Fichier uploadé" });
    setUploading(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-primary">
          Contenu du cours
        </h3>
        <Button
          onClick={addChapter}
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-body text-xs"
        >
          <Plus size={14} className="mr-1" />
          Ajouter un chapitre
        </Button>
      </div>

      {chapters.length === 0 && (
        <p className="text-center py-8 font-body text-sm text-muted-foreground">
          Aucun chapitre. Cliquez sur "Ajouter un chapitre" pour structurer votre cours.
        </p>
      )}

      {chapters.map((chapter, chIdx) => (
        <div key={chapter.id} className="border border-border rounded-sm overflow-hidden">
          {/* Chapter Header */}
          <div
            className="bg-secondary/50 px-4 py-3 flex items-center gap-3 cursor-pointer"
            onClick={() => toggleChapter(chapter.id)}
          >
            <GripVertical size={14} className="text-muted-foreground" />
            {expandedChapters.has(chapter.id) ? (
              <ChevronDown size={16} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={16} className="text-muted-foreground" />
            )}
            <span className="font-body text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Chapitre {chIdx + 1}
            </span>
            <Input
              value={chapter.title}
              onChange={(e) => updateChapter(chapter.id, "title", e.target.value)}
              onBlur={() => saveChapter(chapter.id)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-8 text-sm font-semibold bg-transparent border-none focus-visible:ring-1"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteChapter(chapter.id);
              }}
            >
              <Trash2 size={14} />
            </Button>
          </div>

          {/* Chapter Content (expanded) */}
          {expandedChapters.has(chapter.id) && (
            <div className="p-4 space-y-4 bg-card">
              {/* Chapter description */}
              <div className="space-y-1">
                <Label className="font-body text-xs text-muted-foreground">Description du chapitre</Label>
                <textarea
                  value={chapter.description}
                  onChange={(e) => updateChapter(chapter.id, "description", e.target.value)}
                  onBlur={() => saveChapter(chapter.id)}
                  placeholder="Description optionnelle..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px]"
                />
              </div>

              {/* Lessons */}
              <div className="space-y-3">
                {chapter.lessons.map((lesson, lIdx) => (
                  <LessonEditor
                    key={lesson.id}
                    lesson={lesson}
                    index={lIdx}
                    chapterId={chapter.id}
                    saving={saving}
                    uploading={uploading === lesson.id}
                    onUpdate={(field, value) => updateLesson(chapter.id, lesson.id, field, value)}
                    onSave={() => saveLesson(chapter.id, lesson.id)}
                    onDelete={() => deleteLesson(chapter.id, lesson.id)}
                    onFileUpload={(file) => handleFileUpload(chapter.id, lesson.id, file)}
                  />
                ))}
              </div>

              <Button
                onClick={() => addLesson(chapter.id)}
                variant="outline"
                size="sm"
                className="w-full border-dashed font-body text-xs"
              >
                <Plus size={14} className="mr-1" />
                Ajouter une leçon
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Quiz Editor */}
      <div className="mt-6 pt-6 border-t border-border">
        <QuizEditor courseId={courseId} passPercentage={passPercentage} onPassPercentageChange={savePassPercentage} />
      </div>
    </div>
  );
};

interface LessonEditorProps {
  lesson: Lesson;
  index: number;
  chapterId: string;
  saving: boolean;
  uploading: boolean;
  onUpdate: (field: string, value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onFileUpload: (file: File) => void;
}

const LessonEditor = ({
  lesson,
  index,
  saving,
  uploading,
  onUpdate,
  onSave,
  onDelete,
  onFileUpload,
}: LessonEditorProps) => {
  const typeInfo = CONTENT_TYPES.find((t) => t.value === lesson.content_type) || CONTENT_TYPES[0];
  const TypeIcon = typeInfo.icon;

  return (
    <div className="border border-border rounded-sm p-4 space-y-3 bg-background">
      <div className="flex items-center gap-2">
        <GripVertical size={12} className="text-muted-foreground" />
        <span className="font-body text-[10px] text-muted-foreground font-semibold uppercase tracking-wider w-16">
          Leçon {index + 1}
        </span>
        <Input
          value={lesson.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          onBlur={onSave}
          className="flex-1 h-8 text-sm"
          placeholder="Titre de la leçon"
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 size={12} />
        </Button>
      </div>

      {/* Content Type Selector */}
      <div className="flex gap-2">
        {CONTENT_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                onUpdate("content_type", type.value);
                // Auto-save type change
                setTimeout(onSave, 100);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-body font-medium transition-colors ${
                lesson.content_type === type.value
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 border border-transparent"
              }`}
            >
              <Icon size={12} />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Content based on type */}
      {lesson.content_type === "text" && (
        <div className="space-y-1">
          <Label className="font-body text-xs text-muted-foreground">
            Contenu (supporte le formatage basique)
          </Label>
          <textarea
            value={lesson.content_text || ""}
            onChange={(e) => onUpdate("content_text", e.target.value)}
            onBlur={onSave}
            placeholder="Rédigez le contenu de la leçon ici...&#10;&#10;Utilisez des titres avec ## Titre&#10;Des listes avec - élément&#10;Du texte **gras** ou *italique*"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[200px] font-mono"
          />
        </div>
      )}

      {(lesson.content_type === "pdf" || lesson.content_type === "pptx") && (
        <div className="space-y-2">
          {lesson.file_url ? (
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-sm">
              <TypeIcon size={20} className="text-accent" />
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-foreground truncate">
                  Fichier uploadé
                </p>
                <a
                  href={lesson.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs text-accent hover:underline truncate block"
                >
                  {lesson.file_url.split("/").pop()}
                </a>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={lesson.content_type === "pdf" ? ".pdf" : ".pptx,.ppt"}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileUpload(file);
                  }}
                />
                <span className="text-xs font-body text-accent hover:underline">
                  Remplacer
                </span>
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-accent transition-colors">
              {uploading ? (
                <Loader2 className="animate-spin text-accent mb-2" size={24} />
              ) : (
                <Upload size={24} className="text-muted-foreground mb-2" />
              )}
              <span className="font-body text-sm text-muted-foreground">
                {uploading
                  ? "Upload en cours..."
                  : `Cliquez pour uploader un fichier ${lesson.content_type.toUpperCase()}`}
              </span>
              <input
                type="file"
                accept={lesson.content_type === "pdf" ? ".pdf" : ".pptx,.ppt"}
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(file);
                }}
              />
            </label>
          )}
        </div>
      )}

      {lesson.content_type === "video" && (
        <div className="space-y-2">
          <Label className="font-body text-xs text-muted-foreground">
            URL de la vidéo (YouTube, Vimeo, ou lien direct)
          </Label>
          <Input
            value={lesson.video_url || ""}
            onChange={(e) => onUpdate("video_url", e.target.value)}
            onBlur={onSave}
            placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
          />
          {lesson.video_url && (
            <div className="mt-2 aspect-video bg-secondary rounded-sm overflow-hidden">
              {lesson.video_url.includes("youtube.com") || lesson.video_url.includes("youtu.be") ? (
                <iframe
                  src={getYoutubeEmbedUrl(lesson.video_url)}
                  className="w-full h-full"
                  allowFullScreen
                  title="Vidéo de la leçon"
                />
              ) : lesson.video_url.includes("vimeo.com") ? (
                <iframe
                  src={getVimeoEmbedUrl(lesson.video_url)}
                  className="w-full h-full"
                  allowFullScreen
                  title="Vidéo de la leçon"
                />
              ) : (
                <video src={lesson.video_url} controls className="w-full h-full" />
              )}
            </div>
          )}

          {/* Also allow file upload for video */}
          <div className="pt-2">
            <Label className="font-body text-xs text-muted-foreground mb-1 block">
              Ou uploader un fichier vidéo
            </Label>
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-sm cursor-pointer hover:border-accent transition-colors">
              {uploading ? (
                <Loader2 className="animate-spin text-accent" size={14} />
              ) : (
                <Upload size={14} className="text-muted-foreground" />
              )}
              <span className="font-body text-xs text-muted-foreground">
                {uploading ? "Upload..." : "Uploader une vidéo"}
              </span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(file);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={onSave}
          disabled={saving}
          className="font-body text-xs"
        >
          <Save size={12} className="mr-1" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
};

function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

export default CourseContentEditor;
