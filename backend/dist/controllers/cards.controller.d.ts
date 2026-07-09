import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getCards: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createCard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateCard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteCard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reorderCards: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=cards.controller.d.ts.map