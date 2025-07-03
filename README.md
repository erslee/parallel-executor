# parallel-sh

Run multiple shell commands in parallel with pretty, Docker-like output.

## Features
- Run multiple commands in parallel
- Colorful, prefixed output for each command
- Supports config file or direct command-line input
- Graceful shutdown on Ctrl+C

## Installation

You can run directly with `npx` (no install needed):

```sh
npx parallel-sh --commands 'cd frontend && npm run dev; cd backend && npm run dev'
```

Or install globally:

```sh
npm install -g parallel-sh
parallel-sh --commands 'cd frontend && npm run dev; cd backend && npm run dev'
```

Or locally in your project:

```sh
npm install parallel-sh --save-dev
npx parallel-sh --commands 'cd frontend && npm run dev; cd backend && npm run dev'
```

## Usage

### Command-line Options

- `--commands <cmds>`: Pass semicolon-separated shell commands to run in parallel.
- `--config <file>`: Use a JSON configuration file specifying commands to run.
- `--minLength <number>`: Minimum width for the service name column (default: 4).
- `--maxLength <number>`: Maximum width for the service name column (default: 12).
- `--help`: Show help message and usage examples.

### Examples

#### Run commands directly

```sh
npx parallel-sh --commands 'cd frontend && npm run dev; cd backend && npm run start:dev'
```

#### Using a config file

Create a file (e.g., `commands.json`):

```json
{
  "minLength": 6,
  "maxLength": 16,
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
```

Then run:

```sh
npx parallel-sh --config commands.json
```

#### Show help

```sh
npx parallel-sh --help
```

## License

MIT

### minLength and maxLength

You can control the minimum and maximum width of the service name column in the output using `--minLength` and `--maxLength` (CLI) or `minLength` and `maxLength` (config file).

- `minLength`: Minimum width for the service name column (default: 4)
- `maxLength`: Maximum width for the service name column (default: 12)

**Example:**

```sh
npx parallel-sh --commands 'echo frontend; echo backend' --minLength 8 --maxLength 20
```

Or in your config file:

```json
{
  "minLength": 8,
  "maxLength": 20,
  "commands": [ ... ]
}
```
