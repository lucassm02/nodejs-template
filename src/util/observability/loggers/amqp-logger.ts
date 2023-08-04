import { createDefaultLog } from '@/main/facades';

import { makeDecorator } from './make-decorator';

export const amqpLogger = makeDecorator(
  (payload: Record<string, unknown>) => createDefaultLog(payload, 'AMQP'),
  {
    inputName: 'input',
    outputName: 'output'
  }
);
