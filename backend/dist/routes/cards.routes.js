"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cards_controller_1 = require("../controllers/cards.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/', cards_controller_1.getCards);
router.post('/', cards_controller_1.createCard);
router.put('/reorder', cards_controller_1.reorderCards);
router.put('/:id', cards_controller_1.updateCard);
router.delete('/:id', cards_controller_1.deleteCard);
exports.default = router;
//# sourceMappingURL=cards.routes.js.map