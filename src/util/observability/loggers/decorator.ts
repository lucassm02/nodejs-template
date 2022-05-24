import { logger as customLogger } from '@/util/observability/loggers/default';

import { makeDecorator } from './make-decorator';

const loggerAdapter = ({ name, ...payload }: any) => {
  customLogger.log({ level: 'verbose', message: name, ...payload });
};

export const decorator = makeDecorator(loggerAdapter, {
  inputName: 'input',
  outputName: 'output',
});
