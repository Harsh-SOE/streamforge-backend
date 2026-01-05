import { execSync } from 'child_process';

const serviceName = process.argv[2];
if (!serviceName) {
  console.error('Usage: yarn prisma:generate:client <serviceName> <migrationName>');
  process.exit(1);
}

const cmd = `npx prisma generate --schema ./apps/${serviceName}/prisma/schema.prisma`;

console.log('Running:', cmd);
execSync(cmd, { stdio: 'inherit' });
