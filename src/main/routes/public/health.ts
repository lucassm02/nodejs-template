import { HttpServer } from '@/infra/http/utils';

const server = HttpServer.getInstance();

server.get('/health', (_, res) => {
  res.status(200).json({ message: 'The service is online!' });
});
