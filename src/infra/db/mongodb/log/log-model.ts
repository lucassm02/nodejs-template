import mongoose from 'mongoose';

export interface LogModel extends mongoose.Document {
  url: string;
  level: string;
  [key: string]: any;
  created_at: Date;
}

const schema = new mongoose.Schema(
  {
    __v: { select: false },
    level: { type: String },
    created_at: { type: Date, default: () => new Date() },
  },
  { strict: false }
);

export const LogModel = mongoose.model<LogModel>('LogModel', schema, 'log');
