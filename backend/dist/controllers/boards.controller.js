"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBoard = exports.updateBoard = exports.createBoard = exports.getBoards = void 0;
const Board_1 = __importDefault(require("../models/Board"));
const List_1 = __importDefault(require("../models/List"));
const Card_1 = __importDefault(require("../models/Card"));
// GET /api/boards
const getBoards = async (req, res) => {
    try {
        const boards = await Board_1.default.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, boards });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getBoards = getBoards;
// POST /api/boards
const createBoard = async (req, res) => {
    try {
        const { title, description, color } = req.body;
        if (!title?.trim()) {
            res.status(400).json({ success: false, message: 'Board title is required' });
            return;
        }
        const board = await Board_1.default.create({
            title: title.trim(),
            description: description?.trim() || '',
            color: color || '#6366f1',
            owner: req.user._id,
        });
        res.status(201).json({ success: true, board });
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
exports.createBoard = createBoard;
// PUT /api/boards/:id
const updateBoard = async (req, res) => {
    try {
        const { title, description, color } = req.body;
        const board = await Board_1.default.findOne({ _id: req.params.id, owner: req.user._id });
        if (!board) {
            res.status(404).json({ success: false, message: 'Board not found' });
            return;
        }
        if (title !== undefined)
            board.title = title.trim();
        if (description !== undefined)
            board.description = description.trim();
        if (color !== undefined)
            board.color = color;
        await board.save();
        res.json({ success: true, board });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateBoard = updateBoard;
// DELETE /api/boards/:id
const deleteBoard = async (req, res) => {
    try {
        const board = await Board_1.default.findOne({ _id: req.params.id, owner: req.user._id });
        if (!board) {
            res.status(404).json({ success: false, message: 'Board not found' });
            return;
        }
        // Cascade delete lists and cards
        const lists = await List_1.default.find({ boardId: board._id });
        const listIds = lists.map((l) => l._id);
        await Card_1.default.deleteMany({ listId: { $in: listIds } });
        await List_1.default.deleteMany({ boardId: board._id });
        await board.deleteOne();
        res.json({ success: true, message: 'Board deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteBoard = deleteBoard;
//# sourceMappingURL=boards.controller.js.map