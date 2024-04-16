import mongoose from 'mongoose';

import { InputAndOutputLogModel } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-model';
import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';
import { MONGO } from '@/util';

type SutTypes = {
  sut: InputAndOutputLogRepository;
};

const makeSut = (): SutTypes => ({ sut: new InputAndOutputLogRepository() });

describe('InputAndOutputLog Repository', () => {
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
    await InputAndOutputLogModel.deleteMany({});
  });

  it('should create a inputAndOutputLog', async () => {
    const { sut } = makeSut();

    const mockLog = {
      type: 'HTTP',
      url: '/phoenix/v1/accounts/billets/CE0F8028-1217-4C03-B18E-52F3741133DB/resubmissions',
      request: {
        params: {
          paymentId: 'CE0F8028-1217-4C03-B18E-52F3741133DB'
        },
        headers: {
          authorization:
            'jm49ylyX0Q4nKsoN4HUkMap3Ffa0v2VWSCrvw/OIEgcxpVCGttmWyEO8l34sbj+mNnRFRIBx8TkrPh/ZbMu8kEZx9KiKO23nobhx7JnyBjb5bAbpIqM/1HTP7JLGPiTEDFeF/Jb33kp1f442rqu4CGyeZgCFJa059mFxUER8jDQVCNt39TMlwjDS4Khfr0Kmyvnc7riBQF/CoFUlvdqAZAAKo3r9QNB+Qg1TsqITEHGDEfZOEpdkLorQB1tEz3abMfr3uqHez6Cr/6T+5qng6wT4rLomRybWf3iAUK+q3M7ogP8m9Kp9I51GvicUlv8VaCzNbG+6UyYARxxXepIfdC11PXXWvlQesZfuROO/BRo=',
          'user-agent': 'PostmanRuntime/7.29.2',
          accept: '*/*',
          'cache-control': 'no-cache',
          'postman-token': 'caccacbb-e969-459a-9c9c-f2b369e1d6c1',
          host: 'localhost:3000',
          'accept-encoding': 'gzip, deflate, br',
          connection: 'keep-alive',
          'content-length': '0'
        }
      },
      response: {
        body: {
          message: 'Boleto reenviado com sucesso!',
          payload: {
            payment_id: 'CE0F8028-1217-4C03-B18E-52F3741133DB',
            payerName: 'Erick Azevedo Alves',
            payerDocument: '94159520839',
            value: 2000,
            digitableLine:
              '34191.09057 50399.950190 61309.830000 2 90940000002000',
            link: 'https://sandbox.moip.com.br/v2/boleto/BOL-9KZICRPLH4SB/print',
            ourNumber: 'PAY-O1IXV6H8HW9C',
            expirationDate: new Date('2022-08-31T00:00:00.000Z'),
            deletedAt: null,
            resend: true,
            service: 'RECARGA'
          },
          error: []
        },
        headers: {
          'access-control-allow-origin': '*',
          'access-control-expose-headers': 'X-Total-Count',
          'content-security-policy':
            "default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
          'x-dns-prefetch-control': 'off',
          'expect-ct': 'max-age=0',
          'x-frame-options': 'SAMEORIGIN',
          'strict-transport-security': 'max-age=15552000; includeSubDomains',
          'x-download-options': 'noopen',
          'x-content-type-options': 'nosniff',
          'x-permitted-cross-domain-policies': 'none',
          'referrer-policy': 'no-referrer',
          'x-xss-protection': '0',
          'content-type': 'application/json; charset=utf-8'
        },
        code: 200
      }
    };
    await sut.create(mockLog);
    const [result] = await InputAndOutputLogModel.find();

    const resultKeys = Object.keys(result);

    const expectedKeys = [
      '$__',
      '$isNew',
      '_doc',
      'url',
      'request',
      'params',
      'headers',
      'response',
      'body',
      'payload'
    ];

    expect(resultKeys.length).toBe(10);
    resultKeys.forEach((key) => {
      expect(expectedKeys.includes(key)).toBe(true);
    });
  });
});
