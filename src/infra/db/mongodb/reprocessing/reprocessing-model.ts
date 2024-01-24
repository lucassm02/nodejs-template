import mongoose from 'mongoose';

import { generateUuid } from '@/util';

export interface ReprocessingModel extends mongoose.Document {
  reprocessing_id: string;
  exchange: string;
  message: { reprocessing: object };
  queue: string;
  routing_key: string;
  headers: object;
  created_at: Date;
}

const schema = new mongoose.Schema(
  {
    reprocessing_id: { type: String, default: () => generateUuid() },
    created_at: { type: Date, default: () => new Date() },
    deleted_at: { type: Date }
  },
  { strict: false }
);

export const ReprocessingModel = mongoose.model<ReprocessingModel>(
  'reprocessing',
  schema,
  'reprocessing'
);
