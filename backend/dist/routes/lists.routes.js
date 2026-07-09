"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lists_controller_1 = require("../controllers/lists.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/', lists_controller_1.getLists);
router.post('/', lists_controller_1.createList);
router.put('/:id', lists_controller_1.updateList);
router.delete('/:id', lists_controller_1.deleteList);
exports.default = router;
//# sourceMappingURL=lists.routes.js.map