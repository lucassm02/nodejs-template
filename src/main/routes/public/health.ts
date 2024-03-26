import { Route } from '@/infra/http/utils/http-server/types';

export default function (route: Route) {
  route.get('/health', (req, res) => {
    res.status(200).send({
      message: 'The service is online!'
    });
  });
}
