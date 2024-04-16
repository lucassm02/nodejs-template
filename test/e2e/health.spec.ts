import request from 'supertest';

import { application } from '@/main/application';

import { migrate } from '../migrations/example-db';
import { seedExampleDatabase } from '../seed/example-db-seed';

application.setBaseUrl('/api/v1');

const getServer = () => application.getServer();

describe('Health Route', () => {
  beforeAll(async () => {
    await application.ready();
    await migrate.up.HealthIntegrationTest();
    await seedExampleDatabase();
  });
  afterAll(async () => {
    await migrate.down();
  });
  it('Should return 200 when the server is online', async () => {
    await request(getServer()).get('/api/v1/health').expect(200);
  });
});
