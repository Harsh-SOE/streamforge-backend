#!/usr/bin/env ts-node

import chalk from 'chalk';
import boxen from 'boxen';
import ora, { Ora } from 'ora';
import { checkbox, select } from '@inquirer/prompts';
import { spawn, spawnSync, ChildProcess } from 'child_process';

type DockerCleanupChoice = 'dangling-images' | 'dangling-volumes' | 'cache';
type AppMode = 'development' | 'production';

let activeSpinner: Ora | null = null;
let activeChildProcess: ChildProcess | null = null;
let isExiting = false;
let currentMode: AppMode = 'development';

const printBox = (text: string, color: 'cyan' | 'green' | 'yellow' | 'red' | 'blue' = 'cyan') => {
  console.log(
    boxen(chalk[color](text), {
      padding: 1,
      borderColor: color,
      borderStyle: 'round',
    }),
  );
};

const info = (msg: string) => {
  console.log(chalk.cyanBright(`💡 ${msg}`));
};

function runCommand(command: string, label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    activeSpinner = ora(label).start();

    const child = spawn(command, { shell: true, stdio: 'pipe' });
    activeChildProcess = child;

    let stderrData = '';

    child.stderr?.on('data', (data) => {
      stderrData += (data as Buffer).toString();
    });

    child.on('error', (error) => {
      activeSpinner?.fail();
      activeSpinner = null;
      reject(error);
    });

    child.on('close', (code) => {
      activeChildProcess = null;
      if (code === 0) {
        activeSpinner?.succeed();
        activeSpinner = null;
        resolve();
      } else {
        activeSpinner?.fail();
        activeSpinner = null;
        if (stderrData) console.error(chalk.red(stderrData));
        reject(new Error(`Command "${command}" failed with code ${code}`));
      }
    });
  });
}

function runTilt(mode: AppMode) {
  printBox(`🚀 Tilt started in ${mode.toUpperCase()} mode`, 'green');

  currentMode = mode;

  const tilt = spawn('tilt up', {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, MODE: mode },
  });

  activeChildProcess = tilt;

  tilt.on('exit', (code) => {
    activeChildProcess = null;
    if (code === 0 || code === null) {
      console.log(chalk.green('✔ Tilt exited cleanly'));
      gracefulExit('Tilt finished');
    } else {
      console.log(chalk.red(`✖ Tilt exited with code ${code}`));
      gracefulExit('Tilt crashed');
    }
  });
}

async function cleanDocker(actions: DockerCleanupChoice[]) {
  if (actions.length === 0) {
    console.log(chalk.gray('↪ Skipping Docker cleanup\n'));
    return;
  }

  printBox('🧹 Docker Cleanup', 'blue');

  if (actions.includes('dangling-images')) {
    await runCommand(
      'docker image ls -qf dangling=true | xargs -r docker image rm',
      'Removing dangling images',
    );
  }

  if (actions.includes('dangling-volumes')) {
    await runCommand(
      'docker container prune -f',
      'Pruning stopped containers (required for volumes)',
    );
    await runCommand(
      'docker volume ls -qf dangling=true | xargs -r docker volume rm',
      'Removing dangling volumes',
    );
  }

  if (actions.includes('cache')) {
    await runCommand('docker builder prune --all -f', 'Clearing Docker build cache');
  }

  console.log();
}

async function askDockerCleanup(): Promise<DockerCleanupChoice[]> {
  return checkbox<DockerCleanupChoice>({
    message: 'Docker cleanup before starting?',
    choices: [
      { name: '🖼️  Remove dangling images', value: 'dangling-images' },
      { name: '📦 Remove dangling volumes', value: 'dangling-volumes' },
      { name: '🧱 Clear build cache', value: 'cache' },
    ],
  });
}

async function askAppMode(): Promise<AppMode> {
  return select<AppMode>({
    message: 'Start app in which mode?',
    choices: [
      { name: '🛠️  Development', value: 'development' },
      { name: '🚀 Production', value: 'production' },
    ],
  });
}

async function main() {
  console.clear();

  printBox('🚀 Streamforge Application Startup', 'cyan');

  try {
    const dockerCleanup = await askDockerCleanup();
    const mode = await askAppMode();

    printBox(`▶ Mode: ${mode.toUpperCase()}`, 'yellow');

    await cleanDocker(dockerCleanup);

    printBox('⚡ Starting application', 'green');
    runTilt(mode);
  } catch (err) {
    const error = err as Error;
    if (error.message.includes('force closed') || error.name === 'ExitPromptError') {
      gracefulExit('User cancelled');
    } else {
      activeSpinner?.fail();
      console.error(chalk.red.bold('✖ Unexpected Error: ') + error.message);
      process.exit(1);
    }
  }
}

function gracefulExit(msg?: string) {
  if (isExiting) return;
  isExiting = true;

  if (activeSpinner) {
    activeSpinner.stop();
    activeSpinner = null;
  }

  if (activeChildProcess && !activeChildProcess.killed) {
    activeChildProcess.kill('SIGINT');
  }

  console.log('\n');
  printBox('🛑 Shutting Down', 'yellow');

  console.log(chalk.yellow(`▶ Running: tilt down -v (Mode: ${currentMode})`));

  try {
    spawnSync('tilt down -v', {
      shell: true,
      stdio: 'inherit',
      env: { ...process.env, MODE: currentMode },
    });
    console.log(chalk.green('✔ Tilt resources destroyed'));
  } catch (err) {
    console.error(chalk.red('✖ Failed to run tilt down'), err);
  }

  const statusMsg = msg ? ` | ${chalk.yellow.bold(msg)}` : '';
  console.log(chalk.gray(`\n👋 Bye${statusMsg}`));

  process.exit(0);
}

process.on('SIGINT', () => gracefulExit('SIGINT'));
process.on('SIGTERM', () => gracefulExit('SIGTERM'));

main().catch((err) => info((err as Error).message));
