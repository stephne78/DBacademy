import type { Chapter } from "@/types/course";

export const getCompletedLessonCount = (
  chapter: Chapter,
  completedLessons: Set<string>,
) => chapter.lessons.reduce((count, lesson) => count + Number(completedLessons.has(lesson.id)), 0);

export const isChapterComplete = (
  chapter: Chapter,
  completedLessons: Set<string>,
) => chapter.lessons.every((lesson) => completedLessons.has(lesson.id));

export const isChapterUnlocked = (
  chapters: Chapter[],
  chapterIndex: number,
  completedLessons: Set<string>,
  isAdmin = false,
) => {
  if (isAdmin || chapterIndex === 0) {
    return true;
  }

  const previousChapter = chapters[chapterIndex - 1];
  return previousChapter ? isChapterComplete(previousChapter, completedLessons) : false;
};
