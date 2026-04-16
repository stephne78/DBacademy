import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseOutline from "@/components/course/CourseOutline";
import LessonContent from "@/components/course/LessonContent";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCompletedLessonCount, isChapterComplete, isChapterUnlocked } from "@/lib/course-progress";
import { useCourseLearning } from "@/hooks/useCourseLearning";

const CourseChapter = () => {
  const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();
  const navigate = useNavigate();
  const {
    course,
    chapters,
    canAccessContent,
    completedLessons,
    isAdmin,
    loading,
    markLessonComplete,
    quizQuestions,
  } = useCourseLearning(courseId);

  const chapterIndex = useMemo(
    () => chapters.findIndex((chapter) => chapter.id === chapterId),
    [chapters, chapterId],
  );
  const chapter = chapterIndex >= 0 ? chapters[chapterIndex] : null;
  const unlocked = chapterIndex >= 0 && isChapterUnlocked(chapters, chapterIndex, completedLessons, isAdmin);
  const chapterCompletedLessons = chapter ? getCompletedLessonCount(chapter, completedLessons) : 0;
  const chapterComplete = chapter ? isChapterComplete(chapter, completedLessons) : false;
  const chapterProgress = chapter && chapter.lessons.length > 0
    ? Math.round((chapterCompletedLessons / chapter.lessons.length) * 100)
    : 0;

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !course) {
      navigate("/formations");
    }
  }, [course, loading, navigate]);

  useEffect(() => {
    if (!loading && course && chapterId && chapterIndex === -1) {
      navigate(`/cours/${courseId}`);
    }
  }, [chapterId, chapterIndex, course, courseId, loading, navigate]);

  useEffect(() => {
    if (!chapter) {
      return;
    }

    setActiveLessonId((currentLessonId) => {
      if (currentLessonId && chapter.lessons.some((lesson) => lesson.id === currentLessonId)) {
        return currentLessonId;
      }

      const firstIncompleteLesson = chapter.lessons.find((lesson) => !completedLessons.has(lesson.id));
      return firstIncompleteLesson?.id ?? chapter.lessons[0]?.id ?? null;
    });
  }, [chapter, completedLessons]);

  const activeLesson = chapter?.lessons.find((lesson) => lesson.id === activeLessonId) ?? null;
  const activeLessonIndex = chapter?.lessons.findIndex((lesson) => lesson.id === activeLessonId) ?? -1;
  const nextLesson = chapter && activeLessonIndex >= 0 ? chapter.lessons[activeLessonIndex + 1] : null;
  const nextChapter = chapterIndex >= 0 ? chapters[chapterIndex + 1] : null;

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

  if (!course || !chapter) {
    return null;
  }

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
                <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">
                  Chapitre {chapterIndex + 1}
                </p>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-primary">{chapter.title}</h1>
                <p className="font-body text-sm text-muted-foreground mt-2 max-w-2xl">
                  {chapter.description || "Travaille chaque leçon dans l'ordre puis valide le chapitre pour passer au suivant."}
                </p>
              </div>

              <div className="lg:w-80">
                <div className="flex items-center justify-between mb-2 font-body text-xs text-muted-foreground">
                  <span>{chapterCompletedLessons}/{chapter.lessons.length} leçon{chapter.lessons.length > 1 ? "s" : ""}</span>
                  <span>{chapterProgress}%</span>
                </div>
                <Progress value={chapterProgress} className="h-2" />
              </div>
            </div>
          </section>

          {!canAccessContent ? (
            <div className="bg-card border border-border rounded-sm p-12 text-center">
              <Lock size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="font-display font-semibold text-xl text-primary mb-2">Contenu verrouillé</h2>
              <p className="font-body text-muted-foreground mb-6">
                Vous devez débloquer cette formation pour accéder aux chapitres.
              </p>
              <Link
                to="/formations"
                className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm hover:bg-accent/90 transition-colors"
              >
                Voir le catalogue
              </Link>
            </div>
          ) : !unlocked ? (
            <div className="bg-card border border-border rounded-sm p-12 text-center">
              <Lock size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="font-display font-semibold text-xl text-primary mb-2">Chapitre verrouillé</h2>
              <p className="font-body text-muted-foreground mb-6">
                Terminez complètement le chapitre précédent pour débloquer celui-ci.
              </p>
              <Link
                to={`/cours/${course.id}`}
                className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm hover:bg-accent/90 transition-colors"
              >
                Retour au cours
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
                  activeChapterId={chapter.id}
                />

                <div className="bg-card border border-border rounded-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-secondary/40">
                    <h2 className="font-display font-semibold text-sm uppercase tracking-[0.16em] text-primary">
                      Leçons du chapitre
                    </h2>
                  </div>

                  {chapter.lessons.length === 0 ? (
                    <div className="px-4 py-6 font-body text-sm text-muted-foreground">
                      Aucune leçon dans ce chapitre pour le moment.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {chapter.lessons.map((lesson, lessonIndex) => {
                        const completed = completedLessons.has(lesson.id);
                        const active = lesson.id === activeLessonId;

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={`w-full px-4 py-3 text-left transition-colors ${
                              active ? "bg-accent/10 border-l-2 border-accent" : "hover:bg-secondary/40"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="pt-0.5 shrink-0">
                                {completed ? (
                                  <CheckCircle2 size={16} className="text-accent" />
                                ) : (
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border font-body text-[10px] text-muted-foreground">
                                    {lessonIndex + 1}
                                  </span>
                                )}
                              </span>
                              <span className="min-w-0">
                                <span className="block font-body text-sm font-medium text-foreground truncate">
                                  {lesson.title}
                                </span>
                                <span className="block font-body text-xs text-muted-foreground mt-1">
                                  {completed ? "Leçon terminée" : "À faire"}
                                </span>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>

              <main className="flex-1 min-w-0 space-y-4">
                {!activeLesson ? (
                  <div className="bg-card border border-border rounded-sm p-12 text-center">
                    <p className="font-body text-muted-foreground">Ce chapitre ne contient encore aucune leçon.</p>
                  </div>
                ) : (
                  <>
                    <LessonContent lesson={activeLesson} />

                    {!completedLessons.has(activeLesson.id) ? (
                      <div className="flex justify-center">
                        <Button
                          onClick={() => markLessonComplete(activeLesson.id)}
                          className="bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold"
                        >
                          <CheckCircle2 size={16} className="mr-2" />
                          Marquer cette leçon comme terminée
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 py-3 font-body text-sm font-semibold text-accent">
                          <CheckCircle2 size={16} />
                          Leçon terminée
                        </div>

                        {nextLesson && (
                          <div className="flex justify-center">
                            <Button variant="outline" className="font-body" onClick={() => setActiveLessonId(nextLesson.id)}>
                              Ouvrir la leçon suivante
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {chapterComplete && (
                      <div className="bg-card border border-border rounded-sm p-6 text-center space-y-4">
                        <h2 className="font-display font-semibold text-xl text-primary">Chapitre terminé</h2>
                        <p className="font-body text-sm text-muted-foreground">
                          Ce chapitre est validé. Retournez au cours pour ouvrir la suite ou continuez directement.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link
                            to={`/cours/${course.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-sm border border-border font-body text-sm font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                          >
                            Retour au cours
                          </Link>

                          {nextChapter ? (
                            <Link
                              to={`/cours/${course.id}/chapitre/${nextChapter.id}`}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-sm bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
                            >
                              Chapitre suivant
                            </Link>
                          ) : quizQuestions.length > 0 ? (
                            <Link
                              to={`/cours/${course.id}/quiz`}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-sm bg-accent text-accent-foreground font-body text-sm font-semibold hover:bg-accent/90 transition-colors"
                            >
                              Aller au quiz final
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    )}
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

export default CourseChapter;
