"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderCards = exports.deleteCard = exports.updateCard = exports.createCard = exports.getCards = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Card_1 = __importDefault(require("../models/Card"));
const List_1 = __importDefault(require("../models/List"));
const Board_1 = __importDefault(require("../models/Board"));
const verifyListOwnership = async (listId, userId) => {
    const list = await List_1.default.findById(listId);
    if (!list)
        return null;
    const board = await Board_1.default.findOne({ _id: list.boardId, owner: userId });
    if (!board)
        return null;
    return list;
};
// GET /api/cards?listId=xxx
const getCards = async (req, res) => {
    try {
        const { listId, boardId } = req.query;
        if (boardId) {
            // Get all cards for a board
            const board = await Board_1.default.findOne({ _id: boardId, owner: req.user._id });
            if (!board) {
                res.status(404).json({ success: false, message: 'Board not found' });
                return;
            }
            const cards = await Card_1.default.find({ boardId }).sort({ order: 1 });
            res.json({ success: true, cards });
            return;
        }
        if (!listId) {
            res.status(400).json({ success: false, message: 'listId or boardId is required' });
            return;
        }
        const list = await verifyListOwnership(listId, req.user._id.toString());
        if (!list) {
            res.status(404).json({ success: false, message: 'List not found' });
            return;
        }
        const cards = await Card_1.default.find({ listId }).sort({ order: 1 });
        res.json({ success: true, cards });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getCards = getCards;
// POST /api/cards
const createCard = async (req, res) => {
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
        const list = await verifyListOwnership(listId, req.user._id.toString());
        if (!list) {
            res.status(404).json({ success: false, message: 'List not found or not authorized' });
            return;
        }
        const maxOrderCard = await Card_1.default.findOne({ listId }).sort({ order: -1 });
        const order = maxOrderCard ? maxOrderCard.order + 1 : 0;
        const card = await Card_1.default.create({
            title: title.trim(),
            description: description?.trim() || '',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            listId,
            boardId: list.boardId,
            order,
        });
        res.status(201).json({ success: true, card });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: messages[0] });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createCard = createCard;
// PUT /api/cards/:id
const updateCard = async (req, res) => {
    try {
        const card = await Card_1.default.findById(req.params.id);
        if (!card) {
            res.status(404).json({ success: false, message: 'Card not found' });
            return;
        }
        const list = await verifyListOwnership(card.listId.toString(), req.user._id.toString());
        if (!list) {
            // Check if the new listId is provided (card move)
            if (req.body.listId) {
                const newList = await verifyListOwnership(req.body.listId, req.user._id.toString());
                if (!newList) {
                    res.status(403).json({ success: false, message: 'Not authorized' });
                    return;
                }
            }
            else {
                res.status(403).json({ success: false, message: 'Not authorized' });
                return;
            }
        }
        const { title, description, priority, dueDate, listId, order } = req.body;
        if (title !== undefined)
            card.title = title.trim();
        if (description !== undefined)
            card.description = description.trim();
        if (priority !== undefined)
            card.priority = priority;
        if (dueDate !== undefined)
            card.dueDate = dueDate ? new Date(dueDate) : undefined;
        if (listId !== undefined)
            card.listId = listId;
        if (order !== undefined)
            card.order = order;
        await card.save();
        res.json({ success: true, card });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateCard = updateCard;
// DELETE /api/cards/:id
const deleteCard = async (req, res) => {
    try {
        const card = await Card_1.default.findById(req.params.id);
        if (!card) {
            res.status(404).json({ success: false, message: 'Card not found' });
            return;
        }
        const list = await verifyListOwnership(card.listId.toString(), req.user._id.toString());
        if (!list) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        await card.deleteOne();
        res.json({ success: true, message: 'Card deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteCard = deleteCard;
// PUT /api/cards/reorder  — batch update for drag-and-drop
const reorderCards = async (req, res) => {
    try {
        const { updates } = req.body;
        if (!Array.isArray(updates) || updates.length === 0) {
            res.status(400).json({ success: false, message: 'updates array is required' });
            return;
        }
        const bulkOps = updates.map((u) => ({
            updateOne: {
                filter: { _id: new mongoose_1.default.Types.ObjectId(u._id) },
                update: { $set: { listId: new mongoose_1.default.Types.ObjectId(u.listId), order: u.order } },
            },
        }));
        await Card_1.default.bulkWrite(bulkOps);
        res.json({ success: true, message: 'Cards reordered' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.reorderCards = reorderCards;
//# sourceMappingURL=cards.controller.js.map