import { application } from '@/main/application';
import request from 'supertest';

application.baseUrl('/api/v1');

const rawServer = application.getServer();

describe('Health Route', () => {
  it('Should return 200 when the server is online', async () => {
    await request(rawServer).get('/api/v1/health').expect(200);
  });
});
