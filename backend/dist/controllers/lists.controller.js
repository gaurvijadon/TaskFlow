"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteList = exports.updateList = exports.createList = exports.getLists = void 0;
const List_1 = __importDefault(require("../models/List"));
const Card_1 = __importDefault(require("../models/Card"));
const Board_1 = __importDefault(require("../models/Board"));
// GET /api/lists?boardId=xxx
const getLists = async (req, res) => {
    try {
        const { boardId } = req.query;
        if (!boardId) {
            res.status(400).json({ success: false, message: 'boardId is required' });
            return;
        }
        // Verify board ownership
        const board = await Board_1.default.findOne({ _id: boardId, owner: req.user._id });
        if (!board) {
            res.status(404).json({ success: false, message: 'Board not found' });
            return;
        }
        const lists = await List_1.default.find({ boardId }).sort({ order: 1 });
        res.json({ success: true, lists });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getLists = getLists;
// POST /api/lists
const createList = async (req, res) => {
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
        const board = await Board_1.default.findOne({ _id: boardId, owner: req.user._id });
        if (!board) {
            res.status(404).json({ success: false, message: 'Board not found' });
            return;
        }
        const maxOrderList = await List_1.default.findOne({ boardId }).sort({ order: -1 });
        const order = maxOrderList ? maxOrderList.order + 1 : 0;
        const list = await List_1.default.create({ title: title.trim(), boardId, order });
        res.status(201).json({ success: true, list });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createList = createList;
// PUT /api/lists/:id
const updateList = async (req, res) => {
    try {
        const { title, order } = req.body;
        const list = await List_1.default.findById(req.params.id);
        if (!list) {
            res.status(404).json({ success: false, message: 'List not found' });
            return;
        }
        // Verify board ownership
        const board = await Board_1.default.findOne({ _id: list.boardId, owner: req.user._id });
        if (!board) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        if (title !== undefined)
            list.title = title.trim();
        if (order !== undefined)
            list.order = order;
        await list.save();
        res.json({ success: true, list });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateList = updateList;
// DELETE /api/lists/:id
const deleteList = async (req, res) => {
    try {
        const list = await List_1.default.findById(req.params.id);
        if (!list) {
            res.status(404).json({ success: false, message: 'List not found' });
            return;
        }
        // Verify board ownership
        const board = await Board_1.default.findOne({ _id: list.boardId, owner: req.user._id });
        if (!board) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        await Card_1.default.deleteMany({ listId: list._id });
        await list.deleteOne();
        res.json({ success: true, message: 'List deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteList = deleteList;
//# sourceMappingURL=lists.controller.js.map