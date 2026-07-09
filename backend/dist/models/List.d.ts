import mongoose, { Document } from 'mongoose';
export interface IList extends Document {
    title: string;
    boardId: mongoose.Types.ObjectId;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IList, {}, {}, {}, mongoose.Document<unknown, {}, IList, {}, {}> & IList & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=List.d.ts.map