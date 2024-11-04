import request from 'supertest';

import { webServer } from '@/main/web-server';

import { migrate } from '../migrations/example-db';
import { seedExampleDatabase } from '../seed/example-db-seed';

webServer.setBaseUrl('/api/v1');

const getServer = () => webServer.getServer();

describe('Health Route', () => {
  beforeAll(async () => {
    await webServer.ready();
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
