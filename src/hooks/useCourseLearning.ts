import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { Chapter, Course, QuizAttempt, QuizQuestion } from "@/types/course";

export const useCourseLearning = (courseId?: string) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, isAdmin, loading: profileLoading } = useProfile();
  const userId = user?.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (authLoading || profileLoading) {
      return;
    }
    if (!courseId || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const [{ data: courseData }, { data: purchaseData }, { data: chaptersData }, { data: questionsData }] = await Promise.all([
      supabase
        .from("courses")
        .select("id, title, description, image_url, level, duration, certification, pass_percentage")
        .eq("id", courseId)
        .maybeSingle(),
      supabase
        .from("user_courses")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .eq("payment_status", "completed")
        .maybeSingle(),
      supabase
        .from("course_chapters")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order"),
      supabase
        .from("quiz_questions")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order"),
    ]);

    if (!courseData) {
      setCourse(null);
      setChapters([]);
      setHasPurchased(false);
      setCompletedLessons(new Set());
      setQuizQuestions([]);
      setQuizAttempts([]);
      setLoading(false);
      return;
    }

    let fullChapters: Chapter[] = [];

    if (chaptersData && chaptersData.length > 0) {
      const chapterIds = chaptersData.map((chapter: { id: string }) => chapter.id);
      const { data: lessonsData } = await supabase
        .from("course_lessons")
        .select("*")
        .in("chapter_id", chapterIds)
        .order("sort_order");

      fullChapters = chaptersData.map((chapter: any) => ({
        ...chapter,
        lessons: (lessonsData ?? []).filter((lesson: any) => lesson.chapter_id === chapter.id),
      }));
    }

    const lessonIds = fullChapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id));

    const progressPromise = lessonIds.length > 0
      ? supabase
          .from("user_lesson_progress")
          .select("lesson_id")
          .eq("user_id", userId)
          .in("lesson_id", lessonIds)
      : Promise.resolve({ data: [] as Array<{ lesson_id: string }> });

    const attemptsPromise = supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .order("attempted_at", { ascending: false });

    const [{ data: progressData }, { data: attemptsData }] = await Promise.all([progressPromise, attemptsPromise]);

    setCourse(courseData as Course);
    setChapters(fullChapters);
    setHasPurchased(Boolean(purchaseData) || profile?.role === "admin");
    setCompletedLessons(new Set((progressData ?? []).map((progress) => progress.lesson_id)));
    setQuizAttempts((attemptsData ?? []) as QuizAttempt[]);
    setQuizQuestions(
      (questionsData ?? []).map((question: any) => ({
        ...question,
        options: Array.isArray(question.options) ? question.options : [],
        correct_indices: Array.isArray(question.correct_indices) ? question.correct_indices : [],
      })),
    );
    setLoading(false);
  }, [courseId, profile?.role, userId, authLoading, profileLoading]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      if (!userId || completedLessons.has(lessonId)) {
        return;
      }

      const { error } = await supabase
        .from("user_lesson_progress")
        .insert({ user_id: userId, lesson_id: lessonId });

      if (!error) {
        setCompletedLessons((previous) => new Set(previous).add(lessonId));
      }
    },
    [completedLessons, userId],
  );

  const totalLessons = useMemo(
    () => chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0),
    [chapters],
  );

  const progressPercent = useMemo(
    () => (totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0),
    [completedLessons, totalLessons],
  );

  const allLessonsCompleted = totalLessons > 0 && completedLessons.size >= totalLessons;

  const bestAttempt = useMemo(() => {
    const passedAttempts = quizAttempts.filter((attempt) => attempt.passed);
    if (passedAttempts.length === 0) {
      return null;
    }

    return passedAttempts.reduce((best, attempt) => (attempt.score > best.score ? attempt : best));
  }, [quizAttempts]);

  const hasPassed = Boolean(bestAttempt);
  const canAccessContent = hasPurchased || isAdmin;

  return {
    user,
    profile,
    isAdmin,
    course,
    chapters,
    hasPurchased,
    canAccessContent,
    completedLessons,
    quizQuestions,
    quizAttempts,
    loading,
    totalLessons,
    progressPercent,
    allLessonsCompleted,
    hasPassed,
    bestAttempt,
    refresh,
    markLessonComplete,
  };
};
