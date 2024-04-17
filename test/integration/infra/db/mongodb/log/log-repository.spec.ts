import mongoose from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';

import { LogModel } from '@/infra/db/mongodb/log/log-model';
import { LogRepository } from '@/infra/db/mongodb/log/log-repository';

type SutTypes = {
  sut: LogRepository;
};

const makeSut = (): SutTypes => ({ sut: new LogRepository() });

let mongo: MongoMemoryServer;

describe('Log Repository', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await LogModel.deleteMany({});
  });

  it('should create ', async () => {
    const { sut } = makeSut();
    const mockLog = {
      level: 'info',
      message: 'Server is running on port: 3001',
      timestamp: '2022-11-04 15:45:31'
    };

    await sut.create(mockLog);
    const [result] = await LogModel.find();

    const resultKeys = Object.keys(result);

    const expectedKeys = ['$__', '$isNew', '_doc', 'message', 'timestamp'];

    expect(resultKeys.length).toBe(5);
    resultKeys.forEach((key) => {
      expect(expectedKeys.includes(key)).toBe(true);
    });
  });
});
