import { execSync } from 'child_process';

const serviceName = process.argv[2];
const migrationName = process.argv[3];
if (!serviceName || !migrationName) {
  console.error('Usage: yarn prisma:generate:migrations <serviceName> <migrationName>');
  process.exit(1);
}

const cmd = `cd apps/${serviceName} && npx prisma migrate dev --name ${migrationName} && cd .. && cd ..`;

console.log('Running:', cmd);
execSync(cmd, { stdio: 'inherit' });
