export interface ParallelRunnerOptions {
  minLength?: number;
  maxLength?: number;
}

export interface ParallelCommand {
  name: string;
  command: string;
  cwd?: string;
}

export interface ParallelResult {
  service: string;
  code: number;
  success: boolean;
}

export declare class ParallelRunner {
  constructor(options?: ParallelRunnerOptions);
  runParallel(commands: ParallelCommand[]): Promise<ParallelResult[]>;
  stop(): void;
}
