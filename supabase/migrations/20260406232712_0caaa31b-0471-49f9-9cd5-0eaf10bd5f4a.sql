
-- Course chapters (modules)
CREATE TABLE public.course_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course lessons within chapters
CREATE TABLE public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.course_chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  content_text TEXT DEFAULT '',
  file_url TEXT,
  video_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for course_chapters
ALTER TABLE public.course_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chapters"
  ON public.course_chapters FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view chapters of published courses"
  ON public.course_chapters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.is_published = true
    )
  );

-- RLS for course_lessons
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage lessons"
  ON public.course_lessons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view lessons of published courses"
  ON public.course_lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_chapters ch
      JOIN public.courses c ON c.id = ch.course_id
      WHERE ch.id = chapter_id AND c.is_published = true
    )
  );

-- Storage bucket for course files
INSERT INTO storage.buckets (id, name, public) VALUES ('course-files', 'course-files', true);

-- Storage policies
CREATE POLICY "Admins can upload course files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update course files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'course-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete course files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view course files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'course-files');
