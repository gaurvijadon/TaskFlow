import { Response } from 'express';
import mongoose from 'mongoose';
import Card from '../models/Card';
import List from '../models/List';
import Board from '../models/Board';
import { AuthRequest } from '../middleware/auth';

const verifyListOwnership = async (listId: string, userId: string) => {
  const list = await List.findById(listId);
  if (!list) return null;
  const board = await Board.findOne({ _id: list.boardId, owner: userId });
  if (!board) return null;
  return list;
};

// GET /api/cards?listId=xxx
export const getCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listId, boardId } = req.query;
    
    if (boardId) {
      // Get all cards for a board
      const board = await Board.findOne({ _id: boardId, owner: req.user!._id });
      if (!board) {
        res.status(404).json({ success: false, message: 'Board not found' });
        return;
      }
      const cards = await Card.find({ boardId }).sort({ order: 1 });
      res.json({ success: true, cards });
      return;
    }

    if (!listId) {
      res.status(400).json({ success: false, message: 'listId or boardId is required' });
      return;
    }

    const list = await verifyListOwnership(listId as string, req.user!._id.toString());
    if (!list) {
      res.status(404).json({ success: false, message: 'List not found' });
      return;
    }

    const cards = await Card.find({ listId }).sort({ order: 1 });
    res.json({ success: true, cards });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/cards
export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, dueDate, listId } = req.body;

    if (!title?.trim()) {
      res.status(400).json({ success: false, message: 'Card title is required' });
      return;
    }
    if (!listId) {
      res.status(400).json({ success: false, message: 'listId is required' });
      return;
    }

    const list = await verifyListOwnership(listId, req.user!._id.toString());
    if (!list) {
      res.status(404).json({ success: false, message: 'List not found or not authorized' });
      return;
    }

    const maxOrderCard = await Card.findOne({ listId }).sort({ order: -1 });
    const order = maxOrderCard ? maxOrderCard.order + 1 : 0;

    const card = await Card.create({
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      listId,
      boardId: list.boardId,
      order,
    });

    res.status(201).json({ success: true, card });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ success: false, message: messages[0] });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/cards/:id
export const updateCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      res.status(404).json({ success: false, message: 'Card not found' });
      return;
    }

    const list = await verifyListOwnership(card.listId.toString(), req.user!._id.toString());
    if (!list) {
      // Check if the new listId is provided (card move)
      if (req.body.listId) {
        const newList = await verifyListOwnership(req.body.listId, req.user!._id.toString());
        if (!newList) {
          res.status(403).json({ success: false, message: 'Not authorized' });
          return;
        }
      } else {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
    }

    const { title, description, priority, dueDate, listId, order } = req.body;

    if (title !== undefined) card.title = title.trim();
    if (description !== undefined) card.description = description.trim();
    if (priority !== undefined) card.priority = priority;
    if (dueDate !== undefined) card.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (listId !== undefined) card.listId = listId;
    if (order !== undefined) card.order = order;

    await card.save();
    res.json({ success: true, card });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/cards/:id
export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      res.status(404).json({ success: false, message: 'Card not found' });
      return;
    }

    const list = await verifyListOwnership(card.listId.toString(), req.user!._id.toString());
    if (!list) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    await card.deleteOne();
    res.json({ success: true, message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/cards/reorder  — batch update for drag-and-drop
export const reorderCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { updates } = req.body as {
      updates: Array<{ _id: string; listId: string; order: number }>;
    };

    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ success: false, message: 'updates array is required' });
      return;
    }

    const bulkOps = updates.map((u) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(u._id) },
        update: { $set: { listId: new mongoose.Types.ObjectId(u.listId), order: u.order } },
      },
    }));

    await Card.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Cards reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
