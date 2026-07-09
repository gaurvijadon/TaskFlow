import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react';
import type { List, Card } from '../types';
import CardItem from './CardItem';

interface ListColumnProps {
  list: List;
  cards: Card[];
  onAddCard: () => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
  onDeleteList: (listId: string) => void;
  onRenameList: (listId: string, title: string) => void;
}

export default function ListColumn({
  list, cards, onAddCard, onEditCard, onDeleteCard, onDeleteList, onRenameList,
}: ListColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(list.title);

  const { setNodeRef, isOver } = useDroppable({ id: list._id });

  const handleRename = () => {
    if (renameValue.trim() && renameValue.trim() !== list.title) {
      onRenameList(list._id, renameValue.trim());
    }
    setRenaming(false);
  };

  return (
    <div className="flex-shrink-0 w-72 flex flex-col max-h-[calc(100vh-10rem)]">
      <div
        className={`flex flex-col rounded-xl transition-colors ${
          isOver
            ? 'bg-primary-50 dark:bg-primary-950/50 border-2 border-primary-200 dark:border-primary-800'
            : 'bg-slate-100/80 dark:bg-surface-dark-100/80'
        }`}
      >
        {/* List Header */}
        <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0">
          {renaming ? (
            <div className="flex items-center gap-1.5 flex-1">
              <input
                autoFocus
                className="input py-1 px-2 text-sm flex-1 h-7"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') { setRenaming(false); setRenameValue(list.title); }
                }}
              />
              <button onClick={handleRename} className="p-1 text-primary-600 hover:text-primary-700">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setRenaming(false); setRenameValue(list.title); }} className="p-1 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {list.title}
                </h3>
                <span className="flex-shrink-0 text-xs bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full px-1.5 py-0.5 font-medium">
                  {cards.length}
                </span>
              </div>
              <div className="relative flex items-center gap-0.5">
                <button onClick={onAddCard} className="btn-icon btn-ghost p-1">
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                  className="btn-icon btn-ghost p-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-7 z-20 w-36 bg-white dark:bg-surface-dark-100 rounded-xl shadow-modal border border-slate-100 dark:border-slate-800 py-1 animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-dark-200"
                      onClick={() => { setRenaming(true); setMenuOpen(false); }}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Rename
                    </button>
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => { onDeleteList(list._id); setMenuOpen(false); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete list
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Cards */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[60px]"
        >
          <SortableContext items={cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <CardItem
                key={card._id}
                card={card}
                onEdit={() => onEditCard(card)}
                onDelete={() => onDeleteCard(card._id)}
              />
            ))}
          </SortableContext>
          {cards.length === 0 && !isOver && (
            <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-600">
              Drop cards here
            </div>
          )}
        </div>

        {/* Add Card */}
        <div className="px-2 pb-2 flex-shrink-0">
          <button
            onClick={onAddCard}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-surface-dark-200/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add a card
          </button>
        </div>
      </div>
    </div>
  );
}
