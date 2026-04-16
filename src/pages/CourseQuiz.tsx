import { useEffect } from "react";
import { Award, ClipboardList, Lock } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuizPlayer from "@/components/QuizPlayer";
import CertificateDownload from "@/components/CertificateDownload";
import CourseOutline from "@/components/course/CourseOutline";
import { Progress } from "@/components/ui/progress";
import { useCourseLearning } from "@/hooks/useCourseLearning";

const CourseQuiz = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const {
    user,
    profile,
    course,
    chapters,
    canAccessContent,
    completedLessons,
    isAdmin,
    loading,
    quizQuestions,
    quizAttempts,
    refresh,
    allLessonsCompleted,
    hasPassed,
    bestAttempt,
    progressPercent,
  } = useCourseLearning(courseId);

  useEffect(() => {
    if (!loading && !course) {
      navigate("/formations");
    }
  }, [course, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!course || !user) {
    return null;
  }

  const quizUnlocked = allLessonsCompleted || isAdmin;
  const certificateUnlocked = allLessonsCompleted && hasPassed;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container space-y-6">
          <section className="bg-card border border-border rounded-sm p-6 space-y-4">
            <Link
              to={`/cours/${course.id}`}
              className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Retour au cours
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Évaluation finale</p>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-primary">Quiz de {course.title}</h1>
                <p className="font-body text-sm text-muted-foreground mt-2 max-w-2xl">
                  Le quiz se passe sur une page dédiée et le certificat restera verrouillé tant que tous les chapitres ne sont pas validés.
                </p>
              </div>

              <div className="lg:w-80">
                <div className="flex items-center justify-between mb-2 font-body text-xs text-muted-foreground">
                  <span>Progression globale</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>
          </section>

          {!canAccessContent ? (
            <div className="bg-card border border-border rounded-sm p-12 text-center">
              <Lock size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="font-display font-semibold text-xl text-primary mb-2">Quiz verrouillé</h2>
              <p className="font-body text-muted-foreground mb-6">
                Vous devez d'abord débloquer cette formation pour accéder au quiz final.
              </p>
              <Link
                to="/formations"
                className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm hover:bg-accent/90 transition-colors"
              >
                Voir le catalogue
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-80 shrink-0 space-y-6">
                <CourseOutline
                  chapters={chapters}
                  completedLessons={completedLessons}
                  courseId={course.id}
                  isAdmin={isAdmin}
                />

                <div className="bg-card border border-border rounded-sm p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <ClipboardList size={20} className="text-accent" />
                    <div>
                      <h2 className="font-display font-semibold text-base text-primary">Accès au quiz</h2>
                      <p className="font-body text-xs text-muted-foreground">Seuil de réussite : {course.pass_percentage}%</p>
                    </div>
                  </div>

                  <p className="font-body text-sm text-muted-foreground">
                    {quizUnlocked
                      ? "Le quiz est débloqué. Vous pouvez maintenant valider la formation."
                      : "Terminez tous les chapitres pour débloquer cette étape finale."}
                  </p>
                </div>
              </aside>

              <main className="flex-1 min-w-0 space-y-6">
                {quizQuestions.length === 0 ? (
                  <div className="bg-card border border-border rounded-sm p-12 text-center">
                    <ClipboardList size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <h2 className="font-display font-semibold text-xl text-primary mb-2">Quiz non configuré</h2>
                    <p className="font-body text-muted-foreground">
                      L'administrateur doit encore ajouter les questions de cette formation.
                    </p>
                  </div>
                ) : !quizUnlocked ? (
                  <div className="bg-card border border-border rounded-sm p-12 text-center">
                    <Lock size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <h2 className="font-display font-semibold text-xl text-primary mb-2">Quiz verrouillé</h2>
                    <p className="font-body text-muted-foreground mb-6">
                      Finissez toutes les leçons puis revenez ici pour lancer l'évaluation finale.
                    </p>
                    <Link
                      to={`/cours/${course.id}`}
                      className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm hover:bg-accent/90 transition-colors"
                    >
                      Retour au cours
                    </Link>
                  </div>
                ) : (
                  <>
                    <QuizPlayer
                      courseId={course.id}
                      userId={user.id}
                      questions={quizQuestions}
                      passPercentage={course.pass_percentage}
                      previousAttempts={quizAttempts}
                      onAttemptComplete={refresh}
                      certificateUnlocked={allLessonsCompleted}
                    />

                    <div className="bg-card border border-border rounded-sm p-6">
                      <div className="flex items-start gap-4">
                        <Award size={24} className="text-accent shrink-0 mt-1" />
                        <div className="space-y-2 w-full">
                          <h2 className="font-display font-semibold text-lg text-primary">Certificat</h2>
                          {certificateUnlocked && bestAttempt ? (
                            <CertificateDownload
                              userName={profile?.full_name || user.email || "Apprenant"}
                              courseName={course.title}
                              date={bestAttempt.attempted_at}
                              score={bestAttempt.score}
                              total={bestAttempt.total_questions}
                            />
                          ) : (
                            <p className="font-body text-sm text-muted-foreground">
                              Le certificat apparaîtra ici uniquement après validation de tous les chapitres et réussite au quiz.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </main>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseQuiz;
