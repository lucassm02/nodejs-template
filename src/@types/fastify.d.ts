import type {
  EVENT_KEY,
  STATE_KEY
} from '@/infra/http/utils/http-server/types';
import type { SharedState } from '@/presentation/protocols/shared-state';

declare module 'fastify' {
  interface FastifyRequest {
    [STATE_KEY]: Partial<SharedState>;
    [EVENT_KEY]: string;
  }
}
