import { Route } from '@/infra/http/util/web-server/types';

export default function (route: Route) {
  route.get('/health', (_req, res) => {
    res.status(200).send({
      message: 'The service is online!'
    });
  });
}
