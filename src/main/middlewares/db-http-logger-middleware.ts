import { httpLoggerAdapter } from '../adapters';
import { createHttpRequestLog } from '../facades';

export const dbHttpLoggerMiddleware = httpLoggerAdapter(createHttpRequestLog);
