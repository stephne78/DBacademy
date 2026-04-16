import { useEffect } from "react";
import { Award, BookOpen, ClipboardList, Lock } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseOutline from "@/components/course/CourseOutline";
import CertificateDownload from "@/components/CertificateDownload";
import { Progress } from "@/components/ui/progress";
import { getCompletedLessonCount, isChapterComplete, isChapterUnlocked } from "@/lib/course-progress";
import { useCourseLearning } from "@/hooks/useCourseLearning";

const CourseView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const {
    user,
    profile,
    course,
    chapters,
    hasPurchased,
    canAccessContent,
    completedLessons,
    loading,
    quizQuestions,
    totalLessons,
    progressPercent,
    allLessonsCompleted,
    hasPassed,
    bestAttempt,
    isAdmin,
  } = useCourseLearning(courseId);

  const certificateUnlocked = allLessonsCompleted && hasPassed;

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

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="bg-primary text-primary-foreground py-8">
          <div className="container">
            <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">{course.level}</p>
            <h1 className="font-display font-bold text-2xl md:text-3xl uppercase">{course.title}</h1>
            <p className="font-body text-sm text-primary-foreground/70 mt-2 max-w-2xl">{course.description}</p>
            <div className="flex gap-4 mt-4 text-xs font-body text-primary-foreground/60 flex-wrap">
              <span>⏱ {course.duration}</span>
              {course.certification && <span>🏆 {course.certification}</span>}
              <span>{chapters.length} chapitre{chapters.length > 1 ? "s" : ""}</span>
              <span>{totalLessons} leçon{totalLessons > 1 ? "s" : ""}</span>
            </div>
            {canAccessContent && totalLessons > 0 && (
              <div className="mt-4 max-w-md">
                <div className="flex justify-between text-xs font-body text-primary-foreground/70 mb-1">
                  <span>Progression</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2 bg-primary-foreground/20" />
              </div>
            )}
          </div>
        </div>

        <div className="container mt-6">
          {!canAccessContent ? (
            <div className="bg-card border border-border rounded-sm p-12 text-center">
              <Lock size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="font-display font-semibold text-xl text-primary mb-2">Contenu verrouillé</h2>
              <p className="font-body text-muted-foreground mb-6">
                Vous devez acheter cette formation pour accéder au parcours détaillé.
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
              <aside className="lg:w-80 shrink-0">
                <CourseOutline
                  chapters={chapters}
                  completedLessons={completedLessons}
                  courseId={course.id}
                  isAdmin={isAdmin}
                />
              </aside>

              <main className="flex-1 min-w-0 space-y-6">
                <section className="bg-card border border-border rounded-sm p-6">
                  <div className="flex items-start gap-4">
                    <BookOpen size={24} className="text-accent shrink-0 mt-1" />
                    <div>
                      <h2 className="font-display font-semibold text-xl text-primary">Parcours de la formation</h2>
                      <p className="font-body text-sm text-muted-foreground mt-2 max-w-2xl">
                        Chaque chapitre s'ouvre sur une page dédiée avec son propre lecteur, le suivi de progression et un accès séquentiel au chapitre suivant.
                      </p>
                    </div>
                  </div>
                </section>

                {chapters.length === 0 ? (
                  <section className="bg-card border border-border rounded-sm p-12 text-center">
                    <BookOpen size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                    <h2 className="font-display font-semibold text-lg text-primary mb-2">Aucun chapitre pour le moment</h2>
                    <p className="font-body text-sm text-muted-foreground">
                      Le contenu de cette formation n'a pas encore été structuré côté administration.
                    </p>
                  </section>
                ) : (
                  <section className="grid gap-4 md:grid-cols-2">
                    {chapters.map((chapter, chapterIndex) => {
                      const unlocked = isChapterUnlocked(chapters, chapterIndex, completedLessons, isAdmin);
                      const completedCount = getCompletedLessonCount(chapter, completedLessons);
                      const chapterComplete = isChapterComplete(chapter, completedLessons);
                      const buttonLabel = chapterComplete
                        ? "Revoir le chapitre"
                        : completedCount > 0
                          ? "Reprendre le chapitre"
                          : "Commencer le chapitre";

                      return (
                        <article key={chapter.id} className="bg-card border border-border rounded-sm p-5 space-y-4">
                          <div>
                            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-accent mb-2">
                              Chapitre {chapterIndex + 1}
                            </p>
                            <h2 className="font-display font-semibold text-lg text-primary">{chapter.title}</h2>
                            <p className="font-body text-sm text-muted-foreground mt-2">
                              {chapter.description || "Ouvrez ce chapitre pour suivre ses leçons dans un espace dédié."}
                            </p>
                          </div>

                          <div className="flex items-center justify-between font-body text-xs text-muted-foreground">
                            <span>{completedCount}/{chapter.lessons.length} leçon{chapter.lessons.length > 1 ? "s" : ""}</span>
                            <span>{chapterComplete ? "Terminé" : unlocked ? "Débloqué" : "Verrouillé"}</span>
                          </div>

                          {unlocked ? (
                            <Link
                              to={`/cours/${course.id}/chapitre/${chapter.id}`}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-sm bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
                            >
                              {buttonLabel}
                            </Link>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border font-body text-sm text-muted-foreground">
                              <Lock size={14} />
                              Terminez le chapitre précédent
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </section>
                )}

                <section className="bg-card border border-border rounded-sm p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <ClipboardList size={24} className="text-accent shrink-0 mt-1" />
                    <div>
                      <h2 className="font-display font-semibold text-xl text-primary">Quiz final</h2>
                      <p className="font-body text-sm text-muted-foreground mt-2">
                        Le quiz s'ouvre sur sa propre page et ne sera accessible qu'une fois tous les chapitres terminés.
                      </p>
                    </div>
                  </div>

                  {quizQuestions.length === 0 ? (
                    <p className="font-body text-sm text-muted-foreground">
                      Le quiz n'a pas encore été configuré pour cette formation.
                    </p>
                  ) : allLessonsCompleted || isAdmin ? (
                    <Link
                      to={`/cours/${course.id}/quiz`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-sm bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
                    >
                      Accéder au quiz
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border font-body text-sm text-muted-foreground">
                      <Lock size={14} />
                      Terminez tous les chapitres pour débloquer le quiz
                    </div>
                  )}
                </section>

                <section className="bg-card border border-border rounded-sm p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <Award size={24} className="text-accent shrink-0 mt-1" />
                    <div>
                      <h2 className="font-display font-semibold text-xl text-primary">Certificat</h2>
                      <p className="font-body text-sm text-muted-foreground mt-2">
                        Le certificat reste verrouillé ici tant que la formation complète et le quiz ne sont pas validés.
                      </p>
                    </div>
                  </div>

                  {certificateUnlocked && bestAttempt && user ? (
                    <CertificateDownload
                      userName={profile?.full_name || user.email || "Apprenant"}
                      courseName={course.title}
                      date={bestAttempt.attempted_at}
                      score={bestAttempt.score}
                      total={bestAttempt.total_questions}
                    />
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border font-body text-sm text-muted-foreground">
                      <Lock size={14} />
                      Certificat disponible après tous les chapitres + quiz réussi
                    </div>
                  )}
                </section>
              </main>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseView;
