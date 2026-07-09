import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getLists: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createList: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateList: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteList: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=lists.controller.d.ts.map