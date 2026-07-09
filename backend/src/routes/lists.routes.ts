import { Router } from 'express';
import { getLists, createList, updateList, deleteList } from '../controllers/lists.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getLists);
router.post('/', createList);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

export default router;
