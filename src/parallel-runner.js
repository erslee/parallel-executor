import { spawn } from "child_process";
import chalk from "chalk";

export class ParallelRunner {
  constructor() {
    this.processes = new Map();
    this.colors = [
      "red",
      "green",
      "yellow",
      "blue",
      "magenta",
      "cyan",
      "redBright",
      "greenBright",
      "yellowBright",
      "blueBright",
    ];
    this.colorIndex = 0;
  }

  getNextColor() {
    const color = this.colors[this.colorIndex % this.colors.length];
    this.colorIndex++;
    return color;
  }

  formatServiceName(name, maxLength = 12) {
    return name.length > maxLength
      ? name.substring(0, maxLength - 3) + "..."
      : name.padEnd(maxLength);
  }

  logWithPrefix(service, message, color, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = this.formatServiceName(service);
    const typeIcon = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";

    console.log(
      chalk.gray(`[${timestamp}]`) +
      " " +
      chalk[color](`${prefix} |`) +
      " " +
      chalk.gray(typeIcon) +
      " " +
      message,
    );
  }

  async runCommand(service, command, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      const color = this.getNextColor();

      this.logWithPrefix(service, `Starting: ${command}`, color);

      const [cmd, ...args] = command.split(" ");
      const child = spawn(cmd, args, {
        cwd,
        stdio: "pipe",
        shell: true,
      });

      this.processes.set(service, { process: child, color });

      child.stdout.on("data", (data) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line) => line.trim());
        lines.forEach((line) => {
          this.logWithPrefix(service, line, color);
        });
      });

      child.stderr.on("data", (data) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line) => line.trim());
        lines.forEach((line) => {
          this.logWithPrefix(service, chalk.red(line), color, "error");
        });
      });

      child.on("close", (code) => {
        this.processes.delete(service);
        if (code === 0) {
          this.logWithPrefix(
            service,
            "Completed successfully",
            color,
            "success",
          );
          resolve({ service, code, success: true });
        } else {
          this.logWithPrefix(
            service,
            `Failed with code ${code}`,
            color,
            "error",
          );
          resolve({ service, code, success: false });
        }
      });

      child.on("error", (error) => {
        this.processes.delete(service);
        this.logWithPrefix(service, `Error: ${error.message}`, color, "error");
        reject({ service, error });
      });
    });
  }

  async runParallel(commands) {
    console.log(chalk.bold.blue("🚀 Starting parallel execution...\n"));

    const startTime = Date.now();
    const promises = commands.map(({ name, command, cwd }) =>
      this.runCommand(name, command, cwd),
    );

    try {
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log("\n" + chalk.bold.blue("📊 Execution Summary:"));
      console.log(chalk.gray("─".repeat(50)));

      results.forEach((result) => {
        const status = result.success
          ? chalk.green("✅ SUCCESS")
          : chalk.red("❌ FAILED");
        console.log(`${this.formatServiceName(result.service)} | ${status}`);
      });

      console.log(chalk.gray("─".repeat(50)));
      console.log(chalk.bold(`⏱️  Total time: ${duration}s`));

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (failCount > 0) {
        console.log(chalk.red(`❌ ${failCount} command(s) failed`));
        process.exit(1);
      } else {
        console.log(
          chalk.green(
            `✅ All ${successCount} command(s) completed successfully`,
          ),
        );
      }
    } catch (error) {
      console.error(chalk.red("Fatal error during execution:"), error);
      process.exit(1);
    }
  }

  stop() {
    console.log(chalk.yellow("\n🛑 Stopping all processes..."));
    this.processes.forEach(({ process }, service) => {
      console.log(chalk.yellow(`Terminating ${service}...`));
      process.kill("SIGTERM");
    });
    process.exit(0);
  }
}
