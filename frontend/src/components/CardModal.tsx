import { useState } from 'react';
import { X, Flag, Calendar, AlignLeft, Loader2 } from 'lucide-react';
import type { Card, List } from '../types';
import type { Priority } from '../types';

interface CardModalProps {
  mode: 'create' | 'edit';
  card?: Card;
  listId?: string;
  lists: List[];
  onClose: () => void;
  onCreate: (data: {
    title: string; description: string; priority: string; dueDate: string; listId: string;
  }) => Promise<void>;
  onUpdate: (
    cardId: string,
    data: { title: string; description: string; priority: string; dueDate: string }
  ) => Promise<void>;
}

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-400' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:border-orange-800 dark:text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400' },
];

export default function CardModal({ mode, card, listId, lists, onClose, onCreate, onUpdate }: CardModalProps) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [priority, setPriority] = useState<Priority>(card?.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    card?.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );
  const [selectedListId, setSelectedListId] = useState(listId || card?.listId || '');
  const [titleError, setTitleError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { setTitleError('Title is required'); return; }
    setIsSaving(true);
    try {
      if (mode === 'create') {
        await onCreate({ title: title.trim(), description: description.trim(), priority, dueDate, listId: selectedListId });
      } else if (card) {
        await onUpdate(card._id, { title: title.trim(), description: description.trim(), priority, dueDate });
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content w-full max-w-lg p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {mode === 'create' ? 'Create card' : 'Edit card'}
          </h2>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              autoFocus
              className={`input ${titleError ? 'input-error' : ''}`}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            {titleError && <p className="mt-1 text-xs text-red-500">{titleError}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5" /> Description
              </span>
            </label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Add a more detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="label">
                <span className="flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> Priority
                </span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value as Priority)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      priority === p.value
                        ? p.color + ' border-current'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="label">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Due date
                </span>
              </label>
              <input
                type="date"
                className="input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="mt-1 text-xs text-red-500 hover:underline"
                >
                  Clear date
                </button>
              )}
            </div>
          </div>

          {/* List selector (only for create) */}
          {mode === 'create' && lists.length > 1 && (
            <div>
              <label className="label">List</label>
              <select
                className="input"
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
              >
                {lists.map((l) => (
                  <option key={l._id} value={l._id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary flex-1">
            {isSaving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : mode === 'create' ? 'Create card' : 'Save changes'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
