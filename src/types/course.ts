export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  level: string;
  duration: string;
  certification: string | null;
  pass_percentage: number;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  content_type: string;
  content_text: string | null;
  file_url: string | null;
  video_url: string | null;
  sort_order: number;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: Lesson[];
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_indices: number[];
  sort_order: number;
}

export interface QuizAttempt {
  id?: string;
  score: number;
  total_questions: number;
  passed: boolean;
  attempted_at: string;
}
