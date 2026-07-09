import { Response } from 'express';
import List from '../models/List';
import Card from '../models/Card';
import Board from '../models/Board';
import { AuthRequest } from '../middleware/auth';

// GET /api/lists?boardId=xxx
export const getLists = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { boardId } = req.query;
    if (!boardId) {
      res.status(400).json({ success: false, message: 'boardId is required' });
      return;
    }

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, owner: req.user!._id });
    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    const lists = await List.find({ boardId }).sort({ order: 1 });
    res.json({ success: true, lists });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/lists
export const createList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, boardId } = req.body;
    if (!title?.trim()) {
      res.status(400).json({ success: false, message: 'List title is required' });
      return;
    }
    if (!boardId) {
      res.status(400).json({ success: false, message: 'boardId is required' });
      return;
    }

    // Verify board ownership
    const board = await Board.findOne({ _id: boardId, owner: req.user!._id });
    if (!board) {
      res.status(404).json({ success: false, message: 'Board not found' });
      return;
    }

    const maxOrderList = await List.findOne({ boardId }).sort({ order: -1 });
    const order = maxOrderList ? maxOrderList.order + 1 : 0;

    const list = await List.create({ title: title.trim(), boardId, order });
    res.status(201).json({ success: true, list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/lists/:id
export const updateList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, order } = req.body;
    const list = await List.findById(req.params.id);
    if (!list) {
      res.status(404).json({ success: false, message: 'List not found' });
      return;
    }

    // Verify board ownership
    const board = await Board.findOne({ _id: list.boardId, owner: req.user!._id });
    if (!board) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    if (title !== undefined) list.title = title.trim();
    if (order !== undefined) list.order = order;

    await list.save();
    res.json({ success: true, list });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/lists/:id
export const deleteList = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      res.status(404).json({ success: false, message: 'List not found' });
      return;
    }

    // Verify board ownership
    const board = await Board.findOne({ _id: list.boardId, owner: req.user!._id });
    if (!board) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    await Card.deleteMany({ listId: list._id });
    await list.deleteOne();

    res.json({ success: true, message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
