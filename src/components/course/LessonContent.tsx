import { Fragment, type ReactNode } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import type { Lesson } from "@/types/course";

const getDetectedFileType = (fileUrl: string | null) => {
  if (!fileUrl) {
    return null;
  }

  const normalizedUrl = fileUrl.split("?")[0].toLowerCase();

  if (normalizedUrl.endsWith(".pdf")) {
    return "pdf";
  }

  if (normalizedUrl.endsWith(".ppt") || normalizedUrl.endsWith(".pptx")) {
    return "pptx";
  }

  if (/(\.mp4|\.webm|\.ogg|\.mov|\.m4v)$/i.test(normalizedUrl)) {
    return "video";
  }

  return null;
};

const getLessonLabel = (lesson: Lesson, detectedFileType: string | null) => {
  if (lesson.content_type === "pdf" || detectedFileType === "pdf") {
    return "Document PDF";
  }

  if (lesson.content_type === "pptx" || detectedFileType === "pptx") {
    return "Présentation PowerPoint";
  }

  if (lesson.content_type === "video" || lesson.video_url || detectedFileType === "video") {
    return "Vidéo";
  }

  if (lesson.content_text?.trim() && detectedFileType) {
    return "Contenu + support";
  }

  return "Contenu texte";
};

const LessonContent = ({ lesson }: { lesson: Lesson }) => {
  const detectedFileType = getDetectedFileType(lesson.file_url);
  const videoSource = lesson.video_url || (detectedFileType === "video" ? lesson.file_url : null);
  const hasTextContent = Boolean(lesson.content_text?.trim());
  const showPdf = lesson.content_type === "pdf" || detectedFileType === "pdf";
  const showPptx = lesson.content_type === "pptx" || detectedFileType === "pptx";
  const showVideo = lesson.content_type === "video" || Boolean(videoSource);
  const hasAnyContent = hasTextContent || Boolean(lesson.file_url) || Boolean(videoSource);

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <h2 className="font-display font-semibold text-lg text-primary">{lesson.title}</h2>
        <span className="font-body text-xs text-muted-foreground uppercase tracking-[0.16em]">
          {getLessonLabel(lesson, detectedFileType)}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {hasTextContent && (
          <div className="prose prose-sm max-w-none font-body">
            <MarkdownRenderer content={lesson.content_text ?? ""} />
          </div>
        )}

        {showPdf && lesson.file_url && (
          <div className="space-y-4">
            <iframe
              src={lesson.file_url}
              className="w-full rounded-sm border border-border"
              style={{ height: "70vh" }}
              title={lesson.title}
            />
            <a
              href={lesson.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground font-body text-sm rounded-sm hover:bg-secondary/80 transition-colors"
            >
              <FileText size={14} />
              Télécharger le PDF
            </a>
          </div>
        )}

        {showPptx && lesson.file_url && (
          <div className="space-y-4">
            <div className="p-8 bg-secondary rounded-sm text-center">
              <FileSpreadsheet size={48} className="mx-auto text-accent mb-4" />
              <a
                href={lesson.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-body font-semibold rounded-sm hover:bg-accent/90 transition-colors"
              >
                <FileSpreadsheet size={16} />
                Télécharger la présentation
              </a>
            </div>
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(lesson.file_url)}`}
              className="w-full rounded-sm border border-border"
              style={{ height: "60vh" }}
              title={lesson.title}
            />
          </div>
        )}

        {showVideo && (
          <div>
            {videoSource && (videoSource.includes("youtube.com") || videoSource.includes("youtu.be")) ? (
              <iframe
                src={getYoutubeEmbedUrl(videoSource)}
                className="w-full aspect-video rounded-sm"
                allowFullScreen
                title={lesson.title}
              />
            ) : videoSource && videoSource.includes("vimeo.com") ? (
              <iframe
                src={getVimeoEmbedUrl(videoSource)}
                className="w-full aspect-video rounded-sm"
                allowFullScreen
                title={lesson.title}
              />
            ) : videoSource ? (
              <video src={videoSource} controls className="w-full rounded-sm" />
            ) : (
              <p className="text-center py-8 font-body text-muted-foreground">Aucune vidéo disponible.</p>
            )}
          </div>
        )}

        {!hasAnyContent && (
          <p className="text-center py-8 font-body text-muted-foreground">
            Aucun contenu disponible pour cette leçon.
          </p>
        )}
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let currentListItems: ReactNode[] = [];

  const flushList = () => {
    if (currentListItems.length === 0) {
      return;
    }

    elements.push(
      <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1 mb-4">
        {currentListItems}
      </ul>,
    );
    currentListItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      currentListItems.push(
        <li key={`item-${index}`} className="font-body text-sm text-foreground">
          {renderInline(trimmed.slice(2))}
        </li>,
      );
      return;
    }

    flushList();

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${index}`} className="font-display font-semibold text-lg text-primary mt-6 mb-2">
          {trimmed.slice(3)}
        </h2>,
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${index}`} className="font-display font-semibold text-base text-primary mt-4 mb-2">
          {trimmed.slice(4)}
        </h3>,
      );
      return;
    }

    if (trimmed === "") {
      elements.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    elements.push(
      <p key={`p-${index}`} className="font-body text-sm text-foreground mb-2" style={{ lineHeight: "1.7" }}>
        {renderInline(trimmed)}
      </p>,
    );
  });

  flushList();

  return <>{elements}</>;
};

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`bold-${index}`}>{part.slice(2, -2)}</strong>;
    }

    const italicParts = part.split(/(\*[^*]+\*)/g);
    return (
      <Fragment key={`fragment-${index}`}>
        {italicParts.map((italicPart, italicIndex) => {
          if (italicPart.startsWith("*") && italicPart.endsWith("*")) {
            return <em key={`italic-${index}-${italicIndex}`}>{italicPart.slice(1, -1)}</em>;
          }

          return italicPart;
        })}
      </Fragment>
    );
  });
}

function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

export default LessonContent;
