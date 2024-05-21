import { Route } from '@/infra/http/utils';

export default function (route: Route) {
  route.get('/mock', (req, reply, next, [{ message }]) => {
    reply.send({
      statusCode: 200,
      message
    });
  });
}
