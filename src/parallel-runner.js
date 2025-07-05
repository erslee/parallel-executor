import { spawn } from 'child_process';
import colorizer from './colorizer.js';
import { ColorManager } from './color-manager.js';

export class ParallelRunner {
  #maxLength;
  #minLength;
  #colorManager = new ColorManager();
  #processes = new Map();

  constructor(options = {}) {
    this.#maxLength = options.maxLength ?? 12;
    this.#minLength = options.minLength ?? 4;
  }

  formatServiceName(name) {
    const formatted =
      name.length > this.#maxLength
        ? `${name.substring(0, this.#maxLength - 3)}...`
        : name.padEnd(this.#maxLength);
    return formatted;
  }

  logWithPrefix(service, message, color, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = this.formatServiceName(service);
    const typeIcon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';

    console.log(
      `${colorizer.gray(`[${timestamp}]`)} ${colorizer[color](
        `${prefix} |`
      )} ${colorizer.gray(typeIcon)} ${message}`
    );
  }

  async runCommand(service, command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      const color = this.#colorManager.getNextColor();

      this.logWithPrefix(service, `Starting: ${command}`, color);

      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        cwd,
        stdio: 'pipe',
        shell: true
      });

      this.#processes.set(service, { process: child, color });

      child.stdout.on('data', data => {
        const lines = data
          .toString()
          .split('\n')
          .filter(line => line.trim());
        lines.forEach(line => {
          this.logWithPrefix(service, line, color);
        });
      });

      child.stderr.on('data', data => {
        const lines = data
          .toString()
          .split('\n')
          .filter(line => line.trim());
        lines.forEach(line => {
          this.logWithPrefix(service, colorizer.red(line), color, 'error');
        });
      });

      child.on('close', code => {
        this.#processes.delete(service);
        if (code === 0) {
          this.logWithPrefix(
            service,
            'Completed successfully',
            color,
            'success'
          );
          resolve({ service, code, success: true });
        } else {
          this.logWithPrefix(
            service,
            `Failed with code ${code}`,
            color,
            'error'
          );
          resolve({ service, code, success: false });
        }
      });

      child.on('error', error => {
        this.#processes.delete(service);
        this.logWithPrefix(service, `Error: ${error.message}`, color, 'error');
        reject({ service, error });
      });
    });
  }

  async runParallel(commands) {
    console.log(colorizer.bold.blue('🚀 Starting parallel execution...\n'));

    const length = Math.max(...commands.map(({ name }) => name.length));
    this.#maxLength =
      length > this.#maxLength
        ? this.#maxLength
        : length < this.#minLength
          ? this.#minLength
          : length;

    const startTime = Date.now();
    const promises = commands.map(({ name, command, cwd }) =>
      this.runCommand(name, command, cwd)
    );

    try {
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`\n${colorizer.bold.blue('📊 Execution Summary:')}`);
      console.log(colorizer.gray('─'.repeat(50)));

      results.forEach(result => {
        const status = result.success
          ? colorizer.green('✅ SUCCESS')
          : colorizer.red('❌ FAILED');
        console.log(`${this.formatServiceName(result.service)} | ${status}`);
      });

      console.log(colorizer.gray('─'.repeat(50)));
      console.log(colorizer.bold(`⏱️  Total time: ${duration}s`));

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (failCount > 0) {
        console.log(colorizer.red(`❌ ${failCount} command(s) failed`));
        process.exit(1);
      } else {
        console.log(
          colorizer.green(
            `✅ All ${successCount} command(s) completed successfully`
          )
        );
      }
    } catch (error) {
      console.error(colorizer.red('Fatal error during execution:'), error);
      process.exit(1);
    }
  }

  stop() {
    console.log(colorizer.yellow('\n🛑 Stopping all processes...'));
    this.#processes.forEach(({ process }, service) => {
      console.log(colorizer.yellow(`Terminating ${service}...`));
      process.kill('SIGTERM');
    });
    process.exit(0);
  }
}
