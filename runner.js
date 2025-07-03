#!/usr/bin/env node

import { parseArguments } from './src/arguments-pacer.js';
import { ParallelRunner } from './src/parallel-runner.js';
import { fileURLToPath, resolve } from 'url';
import chalk from 'chalk';

// Handle graceful shutdown
process.on('SIGINT', () => {
  if (global.runner) {
    global.runner.stop();
  }
});

async function main() {
  const { configFile, commands: cliCommands, minLength, maxLength } = parseArguments();

  let commands = [];
  let minLen = minLength ?? 4;
  let maxLen = maxLength ?? 12;

  if (cliCommands && cliCommands.length > 0) {
    commands = cliCommands;
  } else if (configFile) {
    try {
      const fs = require('fs');
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      commands = config.commands || [];
      minLen = config.minLength ?? minLen;
      maxLen = config.maxLength ?? maxLen;
    } catch (error) {
      console.error(chalk.red('Error reading config file:'), error.message);
      process.exit(1);
    }
  } else {
    // Default example commands
    minLen = 10;
    maxLen = 20;
    commands = [
      {
        name: 'frontend',
        command: 'npm run dev',
        cwd: './frontend'
      },
      {
        name: 'backend',
        command: 'npm run start:dev',
        cwd: './backend'
      },
      {
        name: 'tests',
        command: 'npm test',
        cwd: './tests'
      }
    ];
  }

  if (commands.length === 0) {
    console.log(
      chalk.yellow(
        'No commands to run. Use --config to specify a configuration file.'
      )
    );
    process.exit(0);
  }

  global.runner = new ParallelRunner({ minLength: minLen, maxLength: maxLen });
  await global.runner.runParallel(commands);
}

main().catch(error => {
  console.error(chalk.red('Unexpected error:'), error);
  process.exit(1);
});
