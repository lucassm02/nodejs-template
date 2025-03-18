import { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { elasticAPM } from '@/util';

export const injectApmTransactionIdOnHeadersMiddleware = fp(
  (fastify, _opts, done) => {
    fastify.addHook(
      'onSend',
      (
        _fastifyRequest: FastifyRequest,
        fastifyResponse: FastifyReply,
        _payload,
        onSendDone
      ) => {
        const apm = elasticAPM().getAPM();

        if (apm && apm.currentTransaction) {
          fastifyResponse.header(
            'apm-transaction-id',
            apm.currentTransaction.ids['transaction.id']
          );
        }

        onSendDone();
      }
    );
    done();
  }
);
