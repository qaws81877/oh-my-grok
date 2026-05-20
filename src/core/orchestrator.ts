import { SkillEngine } from './skill-engine';
import { CommandRouter } from './command-router';
import { StateManager } from './state-manager';
import { TmuxStatusManager } from './tmux-status';
import { UsageTracker } from './usage-tracker';
import { ACPClient } from './acp-client';
import chalk from 'chalk';

export class Orchestrator {
  private skillEngine: SkillEngine;
  private commandRouter: CommandRouter;
  private stateManager: StateManager;
  private tmuxStatus: TmuxStatusManager;
  private usageTracker: UsageTracker;
  private subagentManager: SubagentManager;
  private acpClient: ACPClient;
  private isRunning = false;

  constructor() {
    this.skillEngine = new SkillEngine();
    this.stateManager = new StateManager();
    this.commandRouter = new CommandRouter(this.skillEngine, this);
    this.tmuxStatus = new TmuxStatusManager();
    this.usageTracker = new UsageTracker(this.tmuxStatus);
    this.subagentManager = new SubagentManager(this);
    this.acpClient = new ACPClient();
  }

  async start(): Promise<void> {
    console.log(chalk.blue.bold('🧠 oh-my-grok-build Orchestrator 시작'));

    await this.stateManager.initialize();
    await this.skillEngine.loadSkills();

    // Initialize tmux status
    this.tmuxStatus.setSessionStart();
    this.tmuxStatus.updateAgents(0);
    this.tmuxStatus.updateUsage(100); // placeholder

    // Connect to ACP (stdio) - 실제 Grok Build CLI 연결 시도 (실패 시 자동 fallback)
    await this.acpClient.connect({ simulation: false });

    // === ACP 이벤트 → SubagentManager / HUD 연동 ===
    this.acpClient.on('agent:spawned', (agent) => {
      this.subagentManager.registerExternalAgent?.(agent);
    });

    this.acpClient.on('agent:status-changed', ({ id, status, error }) => {
      this.subagentManager.setStatus(id, status, error);
    });

    this.acpClient.on('worktree:created', ({ path, agentId }) => {
      console.log(chalk.gray(`[ACP] Worktree created: ${path} (agent: ${agentId})`));
    });

    this.acpClient.on('usage:updated', ({ percent }) => {
      this.tmuxStatus.updateUsage(percent);
    });

    this.acpClient.on('error', (err) => {
      console.error(chalk.red('[ACP Error]'), err);
      this.tmuxStatus.updateWarnings(`ACP Error: ${err.code || err.message}`);
    });

    this.isRunning = true;
    console.log(chalk.green('✅ Orchestrator ready. ACP 연결 완료 (simulation + event bridging)'));
    console.log(chalk.gray('   Grok Build 세션에서 #team, #ralph 등의 명령어를 사용하세요.'));

    // In real implementation, this would connect to Grok Build via ACP (WebSocket/stdio)
    // For Phase 1: just keep alive
    setInterval(() => {
      if (this.isRunning) {
        // Heartbeat or ACP message polling would go here
      }
    }, 30000);
  }

  async handleCommand(command: string, args: string[]): Promise<string> {
    return this.commandRouter.route(command, args);
  }

  /**
   * Update tmux HUD status (can be called from SubagentManager, commands, etc.)
   */
  updateTmuxStatus(options: {
    agents?: number;
    usagePercent?: number;
    warning?: string;
    worktrees?: number;
  }) {
    this.tmuxStatus.updateAll(options);
  }

  /**
   * Consume SuperGrok usage (call when executing tasks)
   */
  consumeUsage(amount: number = 2) {
    this.usageTracker.consume(amount);
  }

  getSubagentManager(): SubagentManager {
    return this.subagentManager;
  }

  stop(): void {
    this.isRunning = false;
    console.log(chalk.yellow('Orchestrator stopped.'));
  }
}
