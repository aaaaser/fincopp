import { testDatabaseConnection, disconnectDatabase } from '../server/config/database';

async function run(): Promise<void> {
  const result = await testDatabaseConnection();
  console.log('=== FINCOP MySQL 8 Connection Check ===');
  console.log(JSON.stringify(result, null, 2));
  await disconnectDatabase();
  process.exit(result.connected ? 0 : 1);
}

void run();
