// TODO: The Worker need a method to stop agenda schedules

// import Agenda from 'agenda';

// import { WorkerManager } from '@/infra/worker';
// import { logger } from '@/util';

// describe('Worker Manager Class', () => {
//   beforeEach(() => {
//     jest.spyOn(logger, 'log').mockReturnValue();
//   });

//   afterAll(async () => {
//     jest.clearAllMocks();
//     const agenda = new Agenda();
//     await agenda.stop();
//   });

//   it('should register a worker on agenda', () => {
//     const logSpy = jest.spyOn(logger, 'log');

//     try {
//       const sut = new WorkerManager();
//       sut.makeWorker(
//         { name: 'worker-1', enabled: true, repeatInterval: '1 minute' },
//         jest.fn()
//       );

//       const expected = {
//         level: 'info',
//         message:
//           'New worker was registered, name: worker-1, repeat interval: 1 minute'
//       };
//       expect(logSpy).toHaveBeenCalledWith(expected);
//     } catch (error) {
//       expect(error).not.toBeDefined();
//     }
//   });
// });
