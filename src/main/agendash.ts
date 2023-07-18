import { MONGO, WORKER, logger } from '@/util';
import { Agenda } from 'agenda';
import agendash from 'agendash';
import express from 'express';

const app = express();

const mongoUrl = `${MONGO.URL()}/${MONGO.NAME}?authSource=${MONGO.AUTH_SOURCE}`;
const mongoCollection = 'agenda';

const agenda = new Agenda().database(mongoUrl, mongoCollection);

const middleware = agendash(agenda, {
  title: 'Agenda Dashboard',
});

const { BASE_URI, PORT } = WORKER.DASHBOARD;

app.use(BASE_URI, middleware);
app.set('port', PORT);

app.listen(PORT, () => {
  logger.log(
    {
      level: 'info',
      message: `Agendash started http://localhost:${PORT}${BASE_URI}`,
    },
    'offline'
  );
});
