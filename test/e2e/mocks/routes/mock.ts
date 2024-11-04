import { Route } from '@/infra/http/util';

export default function (route: Route) {
  route.get('/mock', (req, reply, next, [{ message }]) => {
    reply.send({
      statusCode: 200,
      message
    });
  });
}
