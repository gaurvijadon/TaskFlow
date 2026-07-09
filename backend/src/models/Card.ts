import mongoose, { Document, Schema } from 'mongoose';

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

const cardSchema = new Schema<ICard>(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    listId: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

cardSchema.index({ listId: 1, order: 1 });
cardSchema.index({ boardId: 1 });

export default mongoose.model<ICard>('Card', cardSchema);
