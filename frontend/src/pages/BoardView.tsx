import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  ArrowLeft, Plus, Search, X, Loader2
} from 'lucide-react';
import type { Board, List, Card } from '../types';
import { boardsService } from '../services/boards.service';
import { listsService } from '../services/lists.service';
import { cardsService } from '../services/cards.service';
import DashboardLayout from '../layouts/DashboardLayout';
import ListColumn from '../components/ListColumn';
import CardItem from '../components/CardItem';
import CardModal from '../components/CardModal';
import toast from 'react-hot-toast';

export default function BoardView() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [addingListLoading, setAddingListLoading] = useState(false);

  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const [cardModal, setCardModal] = useState<{
    mode: 'create' | 'edit';
    card?: Card;
    listId?: string;
  } | null>(null);

  const newListRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchData = useCallback(async () => {
    if (!boardId) return;
    try {
      const [boardData, listsData, cardsData] = await Promise.all([
        boardsService.getBoards().then((bs) => bs.find((b) => b._id === boardId) || null),
        listsService.getLists(boardId),
        cardsService.getCards(boardId),
      ]);
      if (!boardData) { navigate('/dashboard'); return; }
      setBoard(boardData);
      setLists(listsData);
      setCards(cardsData);
    } catch {
      toast.error('Failed to load board');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [boardId, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (addingList && newListRef.current) newListRef.current.focus();
  }, [addingList]);

  const getCardsForList = (listId: string) => {
    const filtered = cards.filter((c) => c.listId === listId);
    if (search.trim()) return filtered.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
    return filtered.sort((a, b) => a.order - b.order);
  };

  // Drag & drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveCard(cards.find((c) => c._id === id) || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCard = cards.find((c) => c._id === activeId);
    if (!activeCard) return;

    // Check if over a list (not a card)
    const overList = lists.find((l) => l._id === overId);
    if (overList && activeCard.listId !== overId) {
      setCards((prev) =>
        prev.map((c) => (c._id === activeId ? { ...c, listId: overId } : c))
      );
      return;
    }

    // Check if over another card
    const overCard = cards.find((c) => c._id === overId);
    if (overCard && activeCard.listId !== overCard.listId) {
      setCards((prev) =>
        prev.map((c) => (c._id === activeId ? { ...c, listId: overCard.listId } : c))
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    setCards((prevCards) => {
      const activeIdx = prevCards.findIndex((c) => c._id === activeId);
      const overCard = prevCards.find((c) => c._id === overId);
      const overList = lists.find((l) => l._id === overId);

      if (activeIdx === -1) return prevCards;

      let newCards = [...prevCards];
      const dragged = newCards[activeIdx];

      if (overList) {
        // Move to empty list
        newCards[activeIdx] = { ...dragged, listId: overId, order: 0 };
      } else if (overCard) {
        // Move within/between lists
        const overIdx = newCards.findIndex((c) => c._id === overId);
        if (dragged.listId === overCard.listId) {
          newCards = arrayMove(newCards, activeIdx, overIdx);
        } else {
          newCards[activeIdx] = { ...dragged, listId: overCard.listId };
          newCards = arrayMove(newCards, activeIdx, overIdx);
        }
      }

      // Recompute orders per list
      const byList: Record<string, Card[]> = {};
      newCards.forEach((c) => {
        if (!byList[c.listId]) byList[c.listId] = [];
        byList[c.listId].push(c);
      });
      const reordered = newCards.map((c) => ({
        ...c,
        order: byList[c.listId].indexOf(c),
      }));

      // Persist
      const updates = reordered.map((c) => ({ _id: c._id, listId: c.listId, order: c.order }));
      cardsService.reorderCards(updates).catch(() => toast.error('Failed to save order'));

      return reordered;
    });
  };

  const handleAddList = async () => {
    if (!newListTitle.trim() || !boardId) return;
    setAddingListLoading(true);
    try {
      const list = await listsService.createList({ title: newListTitle.trim(), boardId });
      setLists((prev) => [...prev, list]);
      setNewListTitle('');
      setAddingList(false);
      toast.success('List added');
    } catch {
      toast.error('Failed to add list');
    } finally {
      setAddingListLoading(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await listsService.deleteList(listId);
      setLists((prev) => prev.filter((l) => l._id !== listId));
      setCards((prev) => prev.filter((c) => c.listId !== listId));
      toast.success('List deleted');
    } catch {
      toast.error('Failed to delete list');
    }
  };

  const handleRenameList = async (listId: string, title: string) => {
    try {
      const updated = await listsService.updateList(listId, { title });
      setLists((prev) => prev.map((l) => (l._id === listId ? updated : l)));
    } catch {
      toast.error('Failed to rename list');
    }
  };

  const handleCreateCard = async (data: {
    title: string; description: string; priority: string; dueDate: string; listId: string;
  }) => {
    try {
      const card = await cardsService.createCard({
        title: data.title,
        description: data.description,
        priority: data.priority as any,
        dueDate: data.dueDate || undefined,
        listId: data.listId,
      });
      setCards((prev) => [...prev, card]);
      toast.success('Card created!');
    } catch {
      toast.error('Failed to create card');
    }
  };

  const handleUpdateCard = async (
    cardId: string,
    data: { title: string; description: string; priority: string; dueDate: string }
  ) => {
    try {
      const updated = await cardsService.updateCard(cardId, {
        title: data.title,
        description: data.description,
        priority: data.priority as any,
        dueDate: data.dueDate || null,
      });
      setCards((prev) => prev.map((c) => (c._id === cardId ? updated : c)));
      toast.success('Card updated!');
    } catch {
      toast.error('Failed to update card');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await cardsService.deleteCard(cardId);
      setCards((prev) => prev.filter((c) => c._id !== cardId));
      toast.success('Card deleted');
    } catch {
      toast.error('Failed to delete card');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  const sortedLists = [...lists].sort((a, b) => a.order - b.order);

  return (
    <DashboardLayout noPadding>
      {/* Board Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="btn-icon btn-ghost">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: board?.color }} />
          <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">
            {board?.title}
          </h1>
          {board?.description && (
            <span className="hidden md:block text-sm text-slate-500 dark:text-slate-400 truncate">
              — {board.description}
            </span>
          )}
        </div>
        {/* Search */}
        <div className="relative hidden sm:block w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            className="input pl-8 py-1.5 text-xs h-8"
            placeholder="Filter cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 h-full items-start min-w-max">
            <SortableContext
              items={sortedLists.map((l) => l._id)}
              strategy={horizontalListSortingStrategy}
            >
              {sortedLists.map((list) => (
                <ListColumn
                  key={list._id}
                  list={list}
                  cards={getCardsForList(list._id)}
                  onAddCard={() => setCardModal({ mode: 'create', listId: list._id })}
                  onEditCard={(card) => setCardModal({ mode: 'edit', card })}
                  onDeleteCard={handleDeleteCard}
                  onDeleteList={handleDeleteList}
                  onRenameList={handleRenameList}
                />
              ))}
            </SortableContext>

            {/* Add List */}
            <div className="flex-shrink-0 w-72">
              {addingList ? (
                <div className="bg-white dark:bg-surface-dark-100 rounded-xl p-3 shadow-card border border-slate-100 dark:border-slate-800">
                  <input
                    ref={newListRef}
                    className="input mb-2"
                    placeholder="List title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddList();
                      if (e.key === 'Escape') { setAddingList(false); setNewListTitle(''); }
                    }}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddList} disabled={addingListLoading} className="btn-primary btn-sm flex-1">
                      {addingListLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add list'}
                    </button>
                    <button onClick={() => { setAddingList(false); setNewListTitle(''); }} className="btn-ghost btn-sm btn-icon">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingList(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-white/60 dark:bg-surface-dark-100/60 hover:bg-white dark:hover:bg-surface-dark-100 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Add a list
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="rotate-2 opacity-90">
                <CardItem
                  card={activeCard}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isDragging
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Modal */}
      {cardModal && (
        <CardModal
          mode={cardModal.mode}
          card={cardModal.card}
          listId={cardModal.listId}
          lists={lists}
          onClose={() => setCardModal(null)}
          onCreate={handleCreateCard}
          onUpdate={handleUpdateCard}
        />
      )}
    </DashboardLayout>
  );
}
