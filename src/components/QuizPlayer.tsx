import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_indices: number[];
  sort_order: number;
}

interface QuizAttempt {
  score: number;
  total_questions: number;
  passed: boolean;
  attempted_at: string;
}

const QuizPlayer = ({
  courseId,
  userId,
  questions,
  passPercentage,
  previousAttempts,
  onAttemptComplete,
  certificateUnlocked = true,
}: {
  courseId: string;
  userId: string;
  questions: QuizQuestion[];
  passPercentage: number;
  previousAttempts: QuizAttempt[];
  onAttemptComplete: () => void;
  certificateUnlocked?: boolean;
}) => {
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean; percentage: number } | null>(null);

  const bestAttempt = previousAttempts.length > 0
    ? previousAttempts.reduce((best, attempt) => (attempt.score > best.score ? attempt : best), previousAttempts[0])
    : null;
  const hasPassed = previousAttempts.some((attempt) => attempt.passed);

  const toggleAnswer = (questionId: string, optionIndex: number) => {
    const currentAnswers = answers[questionId] || [];
    const updatedAnswers = currentAnswers.includes(optionIndex)
      ? currentAnswers.filter((index) => index !== optionIndex)
      : [...currentAnswers, optionIndex];

    setAnswers({ ...answers, [questionId]: updatedAnswers });
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    let correctAnswers = 0;
    questions.forEach((question) => {
      const selectedAnswers = answers[question.id] || [];
      const isCorrect =
        selectedAnswers.length === question.correct_indices.length &&
        selectedAnswers.every((selectedIndex) => question.correct_indices.includes(selectedIndex));

      if (isCorrect) {
        correctAnswers += 1;
      }
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= passPercentage;

    setResult({
      score: correctAnswers,
      total: totalQuestions,
      passed,
      percentage,
    });

    await supabase.from("quiz_attempts").insert({
      user_id: userId,
      course_id: courseId,
      score: correctAnswers,
      total_questions: totalQuestions,
      passed,
      answers: answers as never,
    });

    onAttemptComplete();
    setSubmitting(false);
  };

  const resetQuiz = () => {
    setAnswers({});
    setResult(null);
  };

  if (result) {
    return (
      <div className="bg-card border border-border rounded-sm p-8 text-center space-y-4">
        {result.passed ? (
          <Award size={64} className="mx-auto text-accent" />
        ) : (
          <XCircle size={64} className="mx-auto text-destructive" />
        )}
        <h2 className="font-display font-bold text-2xl text-primary">
          {result.passed ? "Félicitations !" : "Quiz non réussi"}
        </h2>
        <p className="font-body text-lg">
          Score : <span className="font-bold">{result.score}/{result.total}</span> ({result.percentage}%)
        </p>
        <p className="font-body text-sm text-muted-foreground">
          Seuil de réussite : {passPercentage}%
        </p>
        {result.passed ? (
          <p className="font-body text-sm font-semibold text-accent">
            {certificateUnlocked
              ? "Quiz réussi : le certificat est maintenant disponible."
              : "Quiz réussi : terminez encore tous les chapitres pour débloquer le certificat."}
          </p>
        ) : (
          <div className="space-y-2">
            <p className="font-body text-muted-foreground">Vous pouvez retenter le quiz.</p>
            <Button onClick={resetQuiz} className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
              <RotateCcw size={16} className="mr-2" />
              Retenter le quiz
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (hasPassed) {
    return (
      <div className="bg-card border border-border rounded-sm p-8 text-center space-y-4">
        <Award size={64} className="mx-auto text-accent" />
        <h2 className="font-display font-bold text-xl text-primary">Quiz déjà réussi !</h2>
        <p className="font-body text-muted-foreground">
          Meilleur score : {bestAttempt?.score}/{bestAttempt?.total_questions}
        </p>
        <p className="font-body text-sm font-semibold text-accent">
          {certificateUnlocked
            ? "Votre certificat est disponible en téléchargement ci-dessous."
            : "Votre certificat restera verrouillé jusqu'à la validation complète des chapitres."}
        </p>
      </div>
    );
  }

  const allAnswered = questions.every((question) => (answers[question.id] || []).length > 0);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/50 rounded-sm p-4">
        <h3 className="font-display font-semibold text-primary mb-1">Quiz Final</h3>
        <p className="font-body text-sm text-muted-foreground">
          {questions.length} question{questions.length > 1 ? "s" : ""} · Seuil de réussite : {passPercentage}%
        </p>
        {previousAttempts.length > 0 && (
          <p className="font-body text-xs text-muted-foreground mt-1">
            {previousAttempts.length} tentative{previousAttempts.length > 1 ? "s" : ""} précédente{previousAttempts.length > 1 ? "s" : ""}
            {bestAttempt && ` · Meilleur score : ${bestAttempt.score}/${bestAttempt.total_questions}`}
          </p>
        )}
      </div>

      {questions.map((question, questionIndex) => (
        <div key={question.id} className="bg-card border border-border rounded-sm p-5 space-y-3">
          <p className="font-body font-medium text-foreground">
            <span className="text-accent font-semibold mr-2">Q{questionIndex + 1}.</span>
            {question.question_text}
          </p>
          <div className="space-y-2 pl-2">
            {question.options.map((option, optionIndex) => {
              const selected = (answers[question.id] || []).includes(optionIndex);
              return (
                <button
                  key={optionIndex}
                  type="button"
                  onClick={() => toggleAnswer(question.id, optionIndex)}
                  className={`w-full text-left px-4 py-3 rounded-sm font-body text-sm transition-colors flex items-center gap-3 ${
                    selected
                      ? "bg-accent/15 border border-accent text-foreground"
                      : "bg-secondary/50 border border-transparent hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                    selected ? "border-accent bg-accent" : "border-muted-foreground/30"
                  }`}>
                    {selected && <CheckCircle2 size={14} className="text-accent-foreground" />}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold px-8 py-3"
          size="lg"
        >
          {submitting ? "Correction en cours..." : "Soumettre le quiz"}
        </Button>
      </div>
    </div>
  );
};

export default QuizPlayer;
