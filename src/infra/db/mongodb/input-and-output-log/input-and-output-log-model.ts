import mongoose from 'mongoose';

export interface InputAndOutputLogModel extends mongoose.Document {
  type: string;
  payload: Object;
  created_at: Date;
}

const schema = new mongoose.Schema(
  {
    type: { type: mongoose.Schema.Types.String },
    created_at: { type: Date, default: () => new Date() }
  },
  { strict: false }
);

export const InputAndOutputLogModel = mongoose.model<InputAndOutputLogModel>(
  'InputAndOutputLog',
  schema,
  'input_and_output_log'
);
