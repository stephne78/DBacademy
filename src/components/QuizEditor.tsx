import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Loader2, CheckCircle2, Circle } from "lucide-react";

interface QuizQuestion {
  id: string;
  course_id: string;
  question_text: string;
  options: string[];
  correct_indices: number[];
  sort_order: number;
}

const QuizEditor = ({ courseId, passPercentage, onPassPercentageChange }: {
  courseId: string;
  passPercentage: number;
  onPassPercentageChange: (val: number) => void;
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchQuestions = useCallback(async () => {
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order");
    if (data) {
      setQuestions(data.map((q: any) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
        correct_indices: Array.isArray(q.correct_indices) ? q.correct_indices : [],
      })));
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const addQuestion = async () => {
    const { data, error } = await supabase
      .from("quiz_questions")
      .insert({
        course_id: courseId,
        question_text: "Nouvelle question",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct_indices: [0],
        sort_order: questions.length,
      })
      .select()
      .single();
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setQuestions([...questions, { ...data, options: data.options as string[], correct_indices: data.correct_indices as number[] }]);
  };

  const deleteQuestion = async (id: string) => {
    await supabase.from("quiz_questions").delete().eq("id", id);
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const saveQuestion = async (q: QuizQuestion) => {
    setSaving(true);
    const { error } = await supabase
      .from("quiz_questions")
      .update({
        question_text: q.question_text,
        options: q.options as any,
        correct_indices: q.correct_indices as any,
        sort_order: q.sort_order,
      })
      .eq("id", q.id);
    if (error) toast({ title: "Erreur", description: error.message, variant: "destructive" });
    else toast({ title: "Question sauvegardée" });
    setSaving(false);
  };

  const toggleCorrect = (questionId: string, optIdx: number) => {
    const q = questions.find(x => x.id === questionId);
    if (!q) return;
    const current = q.correct_indices.includes(optIdx)
      ? q.correct_indices.filter(i => i !== optIdx)
      : [...q.correct_indices, optIdx];
    if (current.length === 0) return; // Must have at least one correct
    updateQuestion(questionId, "correct_indices", current);
  };

  const updateOption = (questionId: string, optIdx: number, value: string) => {
    const q = questions.find(x => x.id === questionId);
    if (!q) return;
    const opts = [...q.options];
    opts[optIdx] = value;
    updateQuestion(questionId, "options", opts);
  };

  const addOption = (questionId: string) => {
    const q = questions.find(x => x.id === questionId);
    if (!q) return;
    updateQuestion(questionId, "options", [...q.options, `Option ${q.options.length + 1}`]);
  };

  const removeOption = (questionId: string, optIdx: number) => {
    const q = questions.find(x => x.id === questionId);
    if (!q || q.options.length <= 2) return;
    const opts = q.options.filter((_, i) => i !== optIdx);
    const corrects = q.correct_indices
      .filter(i => i !== optIdx)
      .map(i => i > optIdx ? i - 1 : i);
    setQuestions(questions.map(x => x.id === questionId ? { ...x, options: opts, correct_indices: corrects.length ? corrects : [0] } : x));
  };

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="animate-spin text-accent" size={20} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-primary">Quiz de fin de formation</h3>
        <Button onClick={addQuestion} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-body text-xs">
          <Plus size={14} className="mr-1" />
          Ajouter une question
        </Button>
      </div>

      {/* Pass percentage */}
      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-sm">
        <Label className="font-body text-sm font-medium">Pourcentage de réussite :</Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={passPercentage}
          onChange={(e) => onPassPercentageChange(Number(e.target.value))}
          className="w-20 h-8 text-sm"
        />
        <span className="font-body text-sm text-muted-foreground">%</span>
      </div>

      {questions.length === 0 && (
        <p className="text-center py-6 font-body text-sm text-muted-foreground">
          Aucune question. Ajoutez des questions QCM pour créer le quiz final.
        </p>
      )}

      {questions.map((q, qIdx) => (
        <div key={q.id} className="border border-border rounded-sm p-4 space-y-3 bg-background">
          <div className="flex items-start gap-2">
            <span className="font-body text-xs font-semibold text-muted-foreground mt-2 shrink-0">Q{qIdx + 1}.</span>
            <textarea
              value={q.question_text}
              onChange={(e) => updateQuestion(q.id, "question_text", e.target.value)}
              onBlur={() => saveQuestion(q)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px]"
              placeholder="Tapez votre question..."
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0" onClick={() => deleteQuestion(q.id)}>
              <Trash2 size={14} />
            </Button>
          </div>

          <div className="space-y-2 pl-6">
            <Label className="font-body text-xs text-muted-foreground">
              Options (cliquez sur le cercle pour marquer la/les bonne(s) réponse(s))
            </Label>
            {q.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { toggleCorrect(q.id, optIdx); setTimeout(() => saveQuestion({ ...q, correct_indices: q.correct_indices.includes(optIdx) ? q.correct_indices.filter(i => i !== optIdx) : [...q.correct_indices, optIdx] }), 50); }}
                  className="shrink-0"
                  title={q.correct_indices.includes(optIdx) ? "Bonne réponse" : "Marquer comme correcte"}
                >
                  {q.correct_indices.includes(optIdx) ? (
                    <CheckCircle2 size={18} className="text-green-600" />
                  ) : (
                    <Circle size={18} className="text-muted-foreground" />
                  )}
                </button>
                <Input
                  value={opt}
                  onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                  onBlur={() => saveQuestion(q)}
                  className="flex-1 h-8 text-sm"
                />
                {q.options.length > 2 && (
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => { removeOption(q.id, optIdx); setTimeout(() => saveQuestion(q), 100); }}>
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addOption(q.id)} className="text-xs font-body">
              <Plus size={12} className="mr-1" /> Ajouter une option
            </Button>
          </div>

          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => saveQuestion(q)} disabled={saving} className="font-body text-xs">
              <Save size={12} className="mr-1" />
              {saving ? "..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizEditor;
