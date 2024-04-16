import { Route } from '@/infra/http/utils';

export default function (route: Route) {
  route.get('/mock', (req, reply) => {
    reply.send({
      statusCode: 200,
      message: 'works!'
    });
  });
}
