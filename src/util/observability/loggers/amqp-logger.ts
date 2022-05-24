import { createAmqpLog } from '@/main/facades';

import { makeDecorator } from './make-decorator';

export const amqpLogger = makeDecorator(createAmqpLog, {
  inputName: 'input',
  outputName: 'output',
});
