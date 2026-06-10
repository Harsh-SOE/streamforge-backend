import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';

const allowedServices = [
  'authz',
  'channel',
  'comments',
  'history',
  'playlist',
  'read',
  'reaction',
  'saga',
  'subscribe',
  'users',
  'videos',
  'views',
];

const serviceName = process.argv[2];

const error = (msg: string) => {
  console.error(chalk.red.bold('✖ ') + chalk.red(msg));
  process.exit(1);
};

const info = (msg: string) => {
  console.log(chalk.blue('ℹ ') + chalk.blue(msg));
};

const success = (msg: string) => {
  console.log(chalk.green('✔ ') + chalk.green(msg));
};

if (!serviceName) {
  error(`Service name not provided.\nUsage: yarn generate:proto <serviceName>`);
}

if (!allowedServices.includes(serviceName)) {
  error(
    `Unrecognized service name.\nAllowed services:\n${allowedServices
      .map((s) => `  • ${chalk.cyan(s)}`)
      .join('\n')}`,
  );
}

const protoRoot = join(__dirname, '..', 'libs', 'proto');
const protoPath = join(protoRoot, `${serviceName}.proto`);
const outPath = join(__dirname, '..', 'libs', 'contracts', 'src', `protocols`);

console.log(
  boxen(
    `${chalk.bold.cyan('Protocol Buffer Generator')}\n\n` +
      `${chalk.gray('Service:')} ${chalk.yellow(serviceName)}`,
    {
      padding: 1,
      borderColor: 'cyan',
      borderStyle: 'round',
    },
  ),
);

if (!existsSync(protoPath)) {
  error(`Proto file not found:\n${chalk.gray(protoPath)}`);
}

if (!existsSync(outPath)) {
  info(`Output directory does not exist, creating it…`);
  mkdirSync(outPath, { recursive: true });
  success(`Created ${chalk.gray(outPath)}`);
}

const spinner = ora({
  text: `Generating TypeScript contracts for ${chalk.yellow(serviceName)}…`,
  spinner: 'dots',
}).start();

try {
  execFileSync(
    'protoc',
    [
      `-I=${protoRoot}`,
      '--plugin=./node_modules/.bin/protoc-gen-ts_proto',
      `--ts_proto_out=${outPath}`,
      '--ts_proto_opt=useOptionals=none,useDate=false,nestJs=true',
      protoPath,
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  );

  spinner.succeed(`Proto generation completed`);

  console.log(
    boxen(
      `${chalk.green.bold('Success!')}\n\n` +
        `${chalk.gray('Service:')} ${chalk.cyan(serviceName)}\n` +
        `${chalk.gray('Output:')}  ${chalk.gray(outPath)}`,
      {
        padding: 1,
        borderColor: 'green',
        borderStyle: 'round',
      },
    ),
  );
} catch (err) {
  spinner.fail('Proto generation failed');
  error((err as Error).message);
}
