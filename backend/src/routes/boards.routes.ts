import { Router } from 'express';
import { getBoards, createBoard, updateBoard, deleteBoard } from '../controllers/boards.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getBoards);
router.post('/', createBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

export default router;
