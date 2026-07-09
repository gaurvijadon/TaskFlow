import mongoose, { Document } from 'mongoose';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export interface ICard extends Document {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: Date;
    listId: mongoose.Types.ObjectId;
    boardId: mongoose.Types.ObjectId;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICard, {}, {}, {}, mongoose.Document<unknown, {}, ICard, {}, {}> & ICard & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Card.d.ts.map