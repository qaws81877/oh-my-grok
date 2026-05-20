import fs from 'fs-extra';
import path from 'path';

const STATUS_DIR = path.join(process.env.HOME || '~', '.sgb', 'tmux');

export class TmuxStatusManager {
  private statusDir: string;

  constructor() {
    this.statusDir = STATUS_DIR;
    fs.ensureDirSync(this.statusDir);
  }

  private writeFile(filename: string, content: string) {
    const filePath = path.join(this.statusDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Update number of active agents
   */
  updateAgents(count: number) {
    this.writeFile('agents.txt', `🟢 ${count} agents`);
  }

  /**
   * Update SuperGrok usage (percentage)
   */
  updateUsage(percent: number) {
    const barLength = 10;
    const filled = Math.round((percent / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    this.writeFile('usage.txt', `SuperGrok Usage ${bar} ${percent}%`);
  }

  /**
   * Update warning message (shown in yellow)
   */
  updateWarnings(message: string) {
    if (message) {
      this.writeFile('warnings.txt', `⚠ ${message}`);
    } else {
      // Clear warning
      this.writeFile('warnings.txt', '');
    }
  }

  /**
   * Set session start time (call once when session starts)
   */
  setSessionStart() {
    const timestamp = Math.floor(Date.now() / 1000);
    this.writeFile('session_start.txt', timestamp.toString());
  }

  /**
   * Update all status at once
   */
  updateAll(options: {
    agents?: number;
    usagePercent?: number;
    warning?: string;
    worktrees?: number;
  }) {
    if (options.agents !== undefined) {
      this.updateAgents(options.agents);
    }
    if (options.usagePercent !== undefined) {
      this.updateUsage(options.usagePercent);
    }
    if (options.warning !== undefined) {
      this.updateWarnings(options.warning);
    }
    if (options.worktrees !== undefined) {
      this.updateWorktrees(options.worktrees);
    }
  }

  /**
   * Update active worktree count
   */
  updateWorktrees(count: number) {
    if (count > 0) {
      this.writeFile('worktrees.txt', `🌲 ${count} worktrees`);
    } else {
      this.writeFile('worktrees.txt', '');
    }
  }

  /**
   * Clear all status files
   */
  clearAll() {
    this.updateAgents(0);
    this.updateUsage(0);
    this.updateWarnings('');
  }
}
