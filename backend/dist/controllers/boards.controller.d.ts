import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getBoards: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createBoard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateBoard: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteBoard: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=boards.controller.d.ts.map