import { Clock, Award, CheckCircle, PlayCircle, Star } from "lucide-react";
import type { Lesson } from "../../types/lessons";

interface LessonCardProps {
  lesson: Lesson;
  isCompleted?: boolean;
  isInProgress?: boolean;
  onStart: () => void;
  onView: () => void;
}

const levelColors = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/40",
  intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  advanced: "bg-red-500/20 text-red-400 border-red-500/40"
};

const levelLabels = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم"
};

function LessonCard({ lesson, isCompleted, isInProgress, onStart, onView }: LessonCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all hover:shadow-lg cursor-pointer ${
        isCompleted
          ? "bg-green-900/20 border-green-500/40"
          : isInProgress
          ? "bg-accent/10 border-accent/40"
          : "bg-primary-dark/60 border-primary-light/40"
      }`}
      onClick={onView}
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`badge badge-sm ${levelColors[lesson.level]}`}>
          {levelLabels[lesson.level]}
        </span>
        {isCompleted && (
          <div className="flex items-center gap-1 text-green-400 text-xs">
            <CheckCircle className="h-4 w-4" />
            <span>مكتمل</span>
          </div>
        )}
        {isInProgress && !isCompleted && (
          <div className="flex items-center gap-1 text-accent text-xs">
            <PlayCircle className="h-4 w-4" />
            <span>جاري</span>
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {lesson.thumbnail && (
        <div className="relative mb-4 rounded-xl overflow-hidden h-40 bg-primary-dark/80">
          <img
            src={lesson.thumbnail}
            alt={lesson.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-accent mb-2 line-clamp-2">{lesson.title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{lesson.description}</p>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{lesson.duration} دقيقة</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="h-3 w-3" />
          <span>{lesson.points} نقطة</span>
        </div>
        {lesson.quiz && lesson.quiz.length > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{lesson.quiz.length} سؤال</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {lesson.tags && lesson.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {lesson.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge badge-xs badge-outline">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
        className={`btn btn-sm w-full ${
          isCompleted ? "btn-success" : isInProgress ? "btn-accent" : "btn-primary"
        }`}
      >
        {isCompleted ? "مراجعة الدرس" : isInProgress ? "متابعة" : "بدء الدرس"}
      </button>
    </div>
  );
}

export default LessonCard;
