import type { SharedState } from '@/presentation/protocols/shared-state';

declare module 'fastify' {
  interface FastifyRequest {
    state: Partial<SharedState>;
  }
}
