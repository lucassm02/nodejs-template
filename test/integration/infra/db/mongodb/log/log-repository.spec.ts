import { LogModel } from '@/infra/db/mongodb/log/log-model';
import { LogRepository } from '@/infra/db/mongodb/log/log-repository';
import mongoose from 'mongoose';
import { MONGO } from '@/util';

type SutTypes = {
  sut: LogRepository;
};

const makeSut = (): SutTypes => ({ sut: new LogRepository() });

describe('Log Repository', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGO.TEST.URL(), {
      dbName: MONGO.TEST.NAME,
      authSource: MONGO.TEST.AUTH_SOURCE,
      authMechanism: 'SCRAM-SHA-1'
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
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
