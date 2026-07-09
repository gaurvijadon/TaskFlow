import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Layout, Trash2, Edit2, X, MoreHorizontal, Loader2
} from 'lucide-react';
import type { Board } from '../types';
import { boardsService } from '../services/boards.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';

const BOARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

function BoardCardSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-2 w-full rounded-full mb-4" style={{ background: '#e2e8f0' }} />
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full mb-1" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
    </div>
  );
}

interface BoardModalProps {
  mode: 'create' | 'edit';
  board?: Board;
  onClose: () => void;
  onSave: (data: { title: string; description: string; color: string }) => Promise<void>;
}

function BoardModal({ mode, board, onClose, onSave }: BoardModalProps) {
  const [title, setTitle] = useState(board?.title || '');
  const [description, setDescription] = useState(board?.description || '');
  const [color, setColor] = useState(board?.color || BOARD_COLORS[0]);
  const [titleError, setTitleError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { setTitleError('Board title is required'); return; }
    setIsSaving(true);
    try {
      await onSave({ title: title.trim(), description: description.trim(), color });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {mode === 'create' ? 'Create board' : 'Edit board'}
          </h2>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Color Preview Strip */}
        <div className="h-24 rounded-xl mb-5 flex items-center justify-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
          <Layout className="w-8 h-8 text-white/80" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Board title *</label>
            <input
              autoFocus
              className={`input ${titleError ? 'input-error' : ''}`}
              placeholder="e.g. Product Roadmap"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
            />
            {titleError && <p className="mt-1 text-xs text-red-500">{titleError}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="What's this board about? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {BOARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    background: c,
                    borderColor: color === c ? '#fff' : 'transparent',
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary flex-1">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'create' ? 'Create board' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editBoard, setEditBoard] = useState<Board | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      const data = await boardsService.getBoards();
      setBoards(data);
    } catch {
      toast.error('Failed to load boards');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleCreate = async (data: { title: string; description: string; color: string }) => {
    const board = await boardsService.createBoard(data);
    setBoards((prev) => [board, ...prev]);
    toast.success('Board created!');
  };

  const handleEdit = async (data: { title: string; description: string; color: string }) => {
    if (!editBoard) return;
    const updated = await boardsService.updateBoard(editBoard._id, data);
    setBoards((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    toast.success('Board updated!');
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await boardsService.deleteBoard(id);
      setBoards((prev) => prev.filter((b) => b._id !== id));
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = boards.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase())
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              {boards.length} board{boards.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary gap-2">
            <Plus className="w-4 h-4" /> New board
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search boards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Boards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <BoardCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-950 rounded-2xl flex items-center justify-center mb-5">
              <Layout className="w-9 h-9 text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {search ? 'No boards found' : 'No boards yet'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs">
              {search ? `No boards match "${search}"` : 'Create your first board to start organizing your work'}
            </p>
            {!search && (
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Create your first board
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((board) => (
              <div
                key={board._id}
                className="card group cursor-pointer hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden animate-fade-in"
                onClick={() => navigate(`/board/${board._id}`)}
              >
                {/* Color bar */}
                <div className="h-1.5 w-full rounded-t-xl" style={{ background: board.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                      {board.title}
                    </h3>
                    <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-icon btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === board._id ? null : board._id); }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === board._id && (
                        <div className="absolute right-0 top-9 z-10 w-36 bg-white dark:bg-surface-dark-100 rounded-xl shadow-modal border border-slate-100 dark:border-slate-800 py-1 animate-scale-in">
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-dark-200"
                            onClick={() => { setEditBoard(board); setOpenMenuId(null); }}
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit board
                          </button>
                          <button
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => { handleDelete(board._id); setOpenMenuId(null); }}
                            disabled={deletingId === board._id}
                          >
                            {deletingId === board._id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {board.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{board.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: board.color }}>
                      {board.title[0].toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(board.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <BoardModal mode="create" onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editBoard && (
        <BoardModal mode="edit" board={editBoard} onClose={() => setEditBoard(null)} onSave={handleEdit} />
      )}
    </DashboardLayout>
  );
}
