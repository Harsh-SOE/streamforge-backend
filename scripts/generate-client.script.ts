import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';
import { join } from 'path';
import { existsSync } from 'fs';
import { execFileSync } from 'child_process';

const allowedServices = [
  'users',
  'videos',
  'reaction',
  'channel',
  'comments',
  'views',
  'history',
  'playlist',
  'subscribe',
];

const serviceName = process.argv[2];

const error = (msg: string) => {
  console.error(chalk.red.bold('✖ ') + chalk.red(msg));
  process.exit(1);
};

const info = (msg: string) => {
  console.log(chalk.blue('ℹ ') + chalk.blue(msg));
};

if (!serviceName) {
  error(`Service name not provided.\nUsage: yarn prisma:generate:client <serviceName>`);
}

if (!allowedServices.includes(serviceName)) {
  error(
    `Unrecognized service name.\nAllowed services:\n${allowedServices
      .map((s) => `  • ${chalk.cyan(s)}`)
      .join('\n')}`,
  );
}

const serviceRoot = join(__dirname, '..', 'apps', serviceName);
const schemaPath = join(serviceRoot, 'prisma', 'schema.prisma');

console.log(
  boxen(
    `${chalk.bold.magenta('Prisma Client Generator')}\n\n` +
      `${chalk.gray('Service:')} ${chalk.yellow(serviceName)}`,
    {
      padding: 1,
      borderColor: 'magenta',
      borderStyle: 'round',
    },
  ),
);

if (!existsSync(serviceRoot)) {
  error(`Service directory not found:\n${chalk.gray(serviceRoot)}`);
}

if (!existsSync(schemaPath)) {
  error(`schema.prisma not found:\n${chalk.gray(schemaPath)}`);
}

info('Schema found, starting Prisma client generation…');

const spinner = ora({
  text: `Generating Prisma client for ${chalk.yellow(serviceName)}…\n`,
  spinner: 'dots',
}).start();

try {
  execFileSync(join(__dirname, '..', 'node_modules', '.bin', 'prisma'), ['generate'], {
    stdio: ['ignore', 'ignore', 'inherit'],
    cwd: serviceRoot,
    env: {
      ...process.env,
      PRISMA_HIDE_UPDATE_MESSAGE: 'true',
    },
  });

  spinner.succeed('Prisma client generated');

  console.log(
    boxen(
      `${chalk.green.bold('Success!')}\n\n` +
        `${chalk.gray('Service:')} ${chalk.cyan(serviceName)}\n` +
        `${chalk.gray('Schema:')}  ${chalk.gray(schemaPath)}`,
      {
        padding: 1,
        borderColor: 'green',
        borderStyle: 'round',
      },
    ),
  );
} catch (err) {
  spinner.fail('Prisma client generation failed');
  error((err as Error).message);
}
