import { createDefaultLog } from '@/main/facades';

import { makeDecorator } from './make-decorator';

export const workerLogger = makeDecorator(
  (payload: Record<string, unknown>) => createDefaultLog(payload, 'WORKER'),
  {
    inputName: 'options',
    outputName: 'result'
  }
);
