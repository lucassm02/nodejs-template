import { sqlConnection } from '@/infra/db/mssql/util';

(async () => {
  const response = await sqlConnection('users')
    .select('*')
    .where({ id: 1 })
    .turbo();
})();

// // Add a benchmark for the query without .turbo
// suite.add('Without Turbo', {
//   defer: true,
//   fn: async (deferred) => {
//     try {
//       await sqlConnection('users').select('*').where({ id: 1 });
//       deferred.resolve();
//     } catch (error) {
//       console.error('Error executing query:', error);
//       deferred.reject(error);
//     }
//   },
//   maxTime: 60 // Run the test for 60 seconds
// });

// // Add a benchmark for the query with .turbo
// suite.add('With Turbo', {
//   defer: true,
//   fn: async (deferred) => {
//     try {
//       await sqlConnection('users').select('*').where({ id: 1 }).turbo();
//       deferred.resolve();
//     } catch (error) {
//       console.error('Error executing query:', error);
//       deferred.reject(error);
//     }
//   },
//   maxTime: 60 // Run the test for 60 seconds
// });

// // Add listeners
// suite
//   .on('cycle', (event) => {
//     console.log(String(event.target));
//   })
//   .on('complete', () => {
//     console.log(`Fastest is ${suite.filter('fastest').map('name')}`);
//     sqlConnection.destroy(); // Close the database connection when done
//   })
//   .on('error', (error) => {
//     console.error('Benchmark encountered an error:', error);
//     sqlConnection.destroy(); // Close the database connection on error
//   });

// // Run the suite
// suite.run({ async: true });
