import { Response } from 'express';
import Board from '../models/Board';
import List from '../models/List';
import Card from '../models/Card';
import { AuthRequest } from '../middleware/auth';

// GET /api/boards
export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const boards = await Board.find({ owner: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, boards });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/boards
export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, color } = req.body;
    if (!title?.trim()) {
      res.status(400).json({ success: false, message: 'Board title is required' });
      return;
    }

    const board = await Board.create({
      title: title.trim(),
      description: description?.trim() || '',
      color: color || '#6366f1',
      owner: req.user!._id,
    });

    res.status(201).json({ success: true, board });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages[0] });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/boards/:id
export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, color } = req.body;
    const board = await Board.findOne({ _id: req.params.id, owner: req.user!._id });

    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    if (title !== undefined) board.title = title.trim();
    if (description !== undefined) board.description = description.trim();
    if (color !== undefined) board.color = color;

    await board.save();
    res.json({ success: true, board });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/boards/:id
export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user!._id });
    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    // Cascade delete lists and cards
    const lists = await List.find({ boardId: board._id });
    const listIds = lists.map((l) => l._id);
    await Card.deleteMany({ listId: { $in: listIds } });
    await List.deleteMany({ boardId: board._id });
    await board.deleteOne();

    res.json({ success: true, message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
