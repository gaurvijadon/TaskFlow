import { Router } from 'express';
import {
  getCards,
  createCard,
  updateCard,
  deleteCard,
  reorderCards,
} from '../controllers/cards.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getCards);
router.post('/', createCard);
router.put('/reorder', reorderCards);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;
