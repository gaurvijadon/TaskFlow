import mongoose, { Document } from 'mongoose';
export interface IBoard extends Document {
    title: string;
    description?: string;
    color: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IBoard, {}, {}, {}, mongoose.Document<unknown, {}, IBoard, {}, {}> & IBoard & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Board.d.ts.map