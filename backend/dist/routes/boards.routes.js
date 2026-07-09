"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const boards_controller_1 = require("../controllers/boards.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/', boards_controller_1.getBoards);
router.post('/', boards_controller_1.createBoard);
router.put('/:id', boards_controller_1.updateBoard);
router.delete('/:id', boards_controller_1.deleteBoard);
exports.default = router;
//# sourceMappingURL=boards.routes.js.map