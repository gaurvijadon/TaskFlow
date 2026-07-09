import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Flag, Edit2, Trash2 } from 'lucide-react';
import type { Card } from '../types';
import { format, isPast, isToday } from 'date-fns';

interface CardItemProps {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const PRIORITY_CLASS: Record<string, string> = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  urgent: 'badge-urgent',
};

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export default function CardItem({ card, onEdit, onDelete, isDragging }: CardItemProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  const dueDateObj = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDateObj && isPast(dueDateObj) && !isToday(dueDateObj);
  const isDueToday = dueDateObj && isToday(dueDateObj);

  const dueDateClass = isOverdue
    ? 'text-red-500 bg-red-50 dark:bg-red-950/50'
    : isDueToday
    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
    : 'text-slate-400 bg-slate-50 dark:bg-surface-dark-200';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-white dark:bg-surface-dark rounded-lg border border-slate-100 dark:border-slate-800 p-3 shadow-card cursor-grab active:cursor-grabbing hover:shadow-card-hover transition-all duration-150 ${
        isDragging ? 'shadow-modal rotate-2' : ''
      }`}
    >
      {/* Priority indicator */}
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_DOT[card.priority]}`} />
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug flex-1">
          {card.title}
        </p>
        {/* Action buttons - appear on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onEdit}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-surface-dark-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-500"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {card.description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-2 ml-3.5">
          {card.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 flex-wrap ml-3.5">
        <span className={PRIORITY_CLASS[card.priority]}>
          <Flag className="w-2.5 h-2.5" />
          {PRIORITY_LABELS[card.priority]}
        </span>
        {dueDateObj && (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-medium ${dueDateClass}`}>
            <Calendar className="w-2.5 h-2.5" />
            {format(dueDateObj, 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}
