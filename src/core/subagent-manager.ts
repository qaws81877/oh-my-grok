import { EventEmitter } from 'events';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { TmuxStatusManager } from './tmux-status';
import { Orchestrator } from './orchestrator';

export interface Subagent {
  id: string;
  role: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  worktree?: string;
  startedAt?: number;
  completedAt?: number;
  result?: any;
  error?: string;
}

export type CleanupPolicy = 'keep' | 'delete' | 'archive';

export class SubagentManager extends EventEmitter {
  private subagents: Map<string, Subagent> = new Map();
  private tmuxStatus: TmuxStatusManager;
  private cleanupPolicy: CleanupPolicy = 'keep';
  private maxCompletedAgents: number = 50;

  constructor(
    private orchestrator: Orchestrator,
    private worktreeBaseDir: string = path.join(process.cwd(), '.worktrees')
  ) {
    super();
    this.tmuxStatus = new TmuxStatusManager();
    fs.ensureDirSync(this.worktreeBaseDir);
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.on('agent:spawned', (agent: Subagent) => {
      console.log(chalk.green(`[Subagent] Spawned: ${agent.id} (${agent.role})`));
      this.syncHud();
    });

    this.on('agent:status-changed', (agent: Subagent, oldStatus: string, newStatus: string) => {
      console.log(chalk.blue(`[Subagent] ${agent.id}: ${oldStatus} → ${newStatus}`));
      this.syncHud();
    });

    this.on('agent:completed', (agent: Subagent) => {
      console.log(chalk.green(`[Subagent] Completed: ${agent.id}`));
      this.handleWorktreeCleanup(agent);
      this.cleanupOldAgents();
    });

    this.on('agent:failed', (agent: Subagent) => {
      console.log(chalk.red(`[Subagent] Failed: ${agent.id} - ${agent.error}`));
      this.handleWorktreeCleanup(agent);
    });

    this.on('agent:cancelled', (agent: Subagent) => {
      console.log(chalk.yellow(`[Subagent] Cancelled: ${agent.id}`));
      this.handleWorktreeCleanup(agent);
    });
  }

  private syncHud() {
    const activeCount = this.getActiveAgentCount();
    const worktreeCount = this.getActiveWorktreeCount();
    this.orchestrator.updateTmuxStatus({ 
      agents: activeCount,
      worktrees: worktreeCount 
    });
  }

  private handleWorktreeCleanup(agent: Subagent) {
    if (!agent.worktree) return;
    const worktreePath = path.join(this.worktreeBaseDir, agent.worktree);

    if (this.cleanupPolicy === 'delete') {
      fs.remove(worktreePath).catch(() => {});
    } else if (this.cleanupPolicy === 'archive') {
      // TODO: archive 로직 추가 가능
    }
  }

  private cleanupOldAgents() {
    const completed = Array.from(this.subagents.values())
      .filter(a => ['COMPLETED', 'FAILED'].includes(a.status))
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    if (completed.length > this.maxCompletedAgents) {
      completed.slice(this.maxCompletedAgents).forEach(agent => {
        this.subagents.delete(agent.id);
      });
    }
  }

  /** Subagent 생성 */
  spawn(role: string, worktreeName?: string): Subagent {
    const worktree = worktreeName || `${role}-${Date.now()}`;
    const worktreePath = path.join(this.worktreeBaseDir, worktree);
    fs.ensureDirSync(worktreePath);

    const agent: Subagent = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      status: 'RUNNING',
      worktree,
      startedAt: Date.now()
    };

    this.subagents.set(agent.id, agent);
    this.emit('agent:spawned', agent);
    return agent;
  }

  /** 여러 개 병렬 생성 */
  spawnParallel(count: number, role: string = 'executor'): Subagent[] {
    return Array.from({ length: count }, () => this.spawn(role));
  }

  /** 상태 변경 */
  setStatus(id: string, newStatus: Subagent['status'], errorMessage?: string) {
    const agent = this.subagents.get(id);
    if (!agent) return;

    const oldStatus = agent.status;
    agent.status = newStatus;

    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(newStatus)) {
      agent.completedAt = Date.now();
    }
    if (newStatus === 'FAILED' && errorMessage) {
      agent.error = errorMessage;
    }

    this.emit('agent:status-changed', agent, oldStatus, newStatus);

    if (newStatus === 'COMPLETED') this.emit('agent:completed', agent);
    if (newStatus === 'FAILED') this.emit('agent:failed', agent);
    if (newStatus === 'CANCELLED') this.emit('agent:cancelled', agent);
  }

  getActiveAgentCount(): number {
    return Array.from(this.subagents.values()).filter(a => a.status === 'RUNNING').length;
  }

  getActiveWorktreeCount(): number {
    return Array.from(this.subagents.values())
      .filter(a => a.worktree && a.status === 'RUNNING').length;
  }

  getAll(): Subagent[] {
    return Array.from(this.subagents.values());
  }

  getById(id: string): Subagent | undefined {
    return this.subagents.get(id);
  }

  /**
   * ACP로부터 외부 Subagent 등록 (Grok Build 네이티브)
   */
  registerExternalAgent(agent: Partial<Subagent>) {
    if (!agent.id) return;

    const existing = this.subagents.get(agent.id);
    if (existing) {
      Object.assign(existing, agent);
    } else {
      this.subagents.set(agent.id, {
        id: agent.id,
        role: agent.role || 'executor',
        status: agent.status || 'RUNNING',
        worktree: agent.worktree,
        startedAt: agent.startedAt || Date.now()
      } as Subagent);
    }

    this.emit('agent:spawned', this.subagents.get(agent.id));
    this.syncHud();
  }

  setCleanupPolicy(policy: CleanupPolicy) {
    this.cleanupPolicy = policy;
  }
}
