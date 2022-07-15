import * as consumers from '@/main/consumers';

import { MqServer } from '../protocols';

export const consumersSetup = (server: MqServer) => {
  Object.values(consumers)
    .filter((value) => value.enabled)
    .forEach((value) => {
      server.consume(value.queue, value.handler);
    });
};
