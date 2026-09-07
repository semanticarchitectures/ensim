import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { createInterface, type Interface } from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";

export interface FederationRecord {
  entityId: string;
  entityType: string;
  record: unknown;
}

interface StdioResponse {
  cmd: string;
  ok: boolean;
  error?: string;
  records?: FederationRecord[];
}

/**
 * Thin client for federation-kernel's JSON-over-stdio protocol (packages/federation-kernel's
 * StdioBridge) - see that package's README for the full protocol and two real Portico bugs it
 * had to be verified against. One command in flight at a time, matching StdioBridge's
 * synchronous single-threaded processing model; pending responses resolve in FIFO order.
 */
export class FederationClient {
  private readonly child: ChildProcessWithoutNullStreams;
  private readonly rl: Interface;
  private readonly pending: Array<(line: string) => void> = [];
  private closed = false;

  constructor(jarPath: string, javaBin = "java") {
    this.child = spawn(javaBin, ["-jar", jarPath], { stdio: ["pipe", "pipe", "pipe"] });
    this.rl = createInterface({ input: this.child.stdout });
    this.rl.on("line", (line) => this.handleLine(line));
  }

  private handleLine(line: string): void {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) {
      return; // Portico's own startup banner/log noise on stdout, not a protocol response
    }
    this.pending.shift()?.(trimmed);
  }

  private send(cmd: string, fields: Record<string, unknown> = {}): Promise<StdioResponse> {
    if (this.closed) {
      return Promise.reject(new Error("FederationClient is closed"));
    }
    return new Promise((resolve, reject) => {
      this.pending.push((line) => {
        let response: StdioResponse;
        try {
          response = JSON.parse(line);
        } catch (e) {
          reject(e);
          return;
        }
        if (response.ok === false) {
          reject(new Error(`federation-kernel command "${cmd}" failed: ${response.error}`));
        } else {
          resolve(response);
        }
      });
      this.child.stdin.write(JSON.stringify({ cmd, ...fields }) + "\n");
    });
  }

  async connect(federationName: string, federateName: string): Promise<void> {
    await this.send("connect", { federationName, federateName });
  }

  async publish(entityType: string, entityId: string, record: unknown): Promise<void> {
    await this.send("publish", { entityType, entityId, record });
  }

  async subscribe(): Promise<void> {
    await this.send("subscribe");
  }

  async tick(timeoutSeconds = 0.5): Promise<FederationRecord[]> {
    const response = await this.send("tick", { timeoutSeconds });
    return response.records ?? [];
  }

  async resign(): Promise<void> {
    await this.send("resign");
  }

  close(): void {
    this.closed = true;
    this.rl.close();
    this.child.kill();
  }
}

export function defaultFederationKernelJarPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // packages/sim-services/src -> packages/federation-kernel/target/...
  return path.resolve(here, "..", "..", "federation-kernel", "target", "federation-kernel-0.1.0-SNAPSHOT.jar");
}

export function isFederationKernelJarAvailable(jarPath: string): boolean {
  return existsSync(jarPath);
}
