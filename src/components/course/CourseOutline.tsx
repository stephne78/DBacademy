import { CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { getCompletedLessonCount, isChapterComplete, isChapterUnlocked } from "@/lib/course-progress";
import type { Chapter } from "@/types/course";

interface CourseOutlineProps {
  chapters: Chapter[];
  completedLessons: Set<string>;
  courseId: string;
  isAdmin: boolean;
  activeChapterId?: string;
  locked?: boolean;
}

const CourseOutline = ({
  chapters,
  completedLessons,
  courseId,
  isAdmin,
  activeChapterId,
  locked = false,
}: CourseOutlineProps) => {
  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden sticky top-20">
      <div className="px-4 py-3 border-b border-border bg-secondary/40">
        <h2 className="font-display font-semibold text-sm uppercase tracking-[0.16em] text-primary">Sommaire</h2>
      </div>

      <nav className="divide-y divide-border">
        {chapters.map((chapter, chapterIndex) => {
          const unlocked = !locked && isChapterUnlocked(chapters, chapterIndex, completedLessons, isAdmin);
          const completedCount = getCompletedLessonCount(chapter, completedLessons);
          const chapterComplete = isChapterComplete(chapter, completedLessons);
          const active = activeChapterId === chapter.id;
          const baseClass = `w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
            active ? "bg-accent/10 border-l-2 border-accent" : ""
          }`;

          const content = (
            <>
              <span className="pt-0.5 shrink-0">
                {unlocked ? (
                  chapterComplete ? (
                    <CheckCircle2 size={16} className="text-accent" />
                  ) : (
                    <ChevronRight size={16} className="text-muted-foreground" />
                  )
                ) : (
                  <Lock size={16} className="text-muted-foreground" />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  CH.{chapterIndex + 1}
                </span>
                <span className="block font-body text-sm font-medium text-foreground truncate">{chapter.title}</span>
                <span className="block font-body text-xs text-muted-foreground mt-1">
                  {completedCount}/{chapter.lessons.length} leçon{chapter.lessons.length > 1 ? "s" : ""}
                </span>
              </span>
            </>
          );

          if (!unlocked) {
            return (
              <div key={chapter.id} className={`${baseClass} opacity-60 cursor-not-allowed`}>
                {content}
              </div>
            );
          }

          return (
            <Link
              key={chapter.id}
              to={`/cours/${courseId}/chapitre/${chapter.id}`}
              className={`${baseClass} hover:bg-secondary/40`}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default CourseOutline;
