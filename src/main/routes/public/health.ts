import { Route } from '@/infra/http/utils/http-server/types';

export default function (route: Route) {
  route.get('/health', (_, res) => {
    res.status(200).json({ message: 'The service is online!' });
  });
}
