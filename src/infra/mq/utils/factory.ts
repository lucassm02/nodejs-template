import { RabbitMqServer } from './rabbitmq-server';

export function rabbitMqServer(getInstance = true) {
  if (getInstance) return RabbitMqServer.getInstance();
  return new RabbitMqServer();
}
