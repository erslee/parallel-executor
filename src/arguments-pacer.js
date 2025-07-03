import chalk from 'chalk';

// Example usage and CLI interface
export function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
${chalk.bold.blue('Parallel NPM Runner')}

Usage:
  node runner.js [options]

Options:
  --config <file>    Use configuration file (JSON)
  --commands <cmds>  Pass semicolon-separated shell commands to run in parallel
  --help            Show this help message

Examples:
  # Using config file
  node runner.js --config commands.json

  # Using commands directly
  node runner.js --commands 'cd frontend && npm run dev; cd backend && npm run dev'

  # The config file should look like:
  {
    "commands": [
      {
        "name": "frontend",
        "command": "npm run dev",
        "cwd": "./frontend"
      },
      {
        "name": "backend",
        "command": "npm run start:dev",
        "cwd": "./backend"
      }
    ]
  }
`);
    process.exit(0);
  }

  // Parse --commands first (priority)
  const commandsIndex = args.indexOf('--commands');
  if (commandsIndex !== -1 && args[commandsIndex + 1]) {
    // Split by ';', trim, and filter out empty commands
    const raw = args[commandsIndex + 1];
    const commands = raw
      .split(';')
      .map((cmd, i) => ({
        name: `cmd${i + 1}`,
        command: cmd.trim(),
        cwd: process.cwd()
      }))
      .filter(cmd => cmd.command);
    return { commands };
  }

  // Parse --config
  const configIndex = args.indexOf('--config');
  if (configIndex !== -1 && args[configIndex + 1]) {
    return { configFile: args[configIndex + 1] };
  }

  return {};
}
