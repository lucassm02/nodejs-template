import { rabbitMqServer } from '@/infra/mq/utils';
import { RABBIT } from '@/util';

export function getRabbitmqConnection() {
  const rabbitServer = rabbitMqServer();

  return rabbitServer
    .setCredentials({
      user: RABBIT.USER,
      password: RABBIT.PASSWORD,
      host: RABBIT.HOST,
      port: RABBIT.PORT
    })
    .start();
}
