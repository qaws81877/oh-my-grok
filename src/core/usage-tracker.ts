import { TmuxStatusManager } from './tmux-status';

/**
 * Simple usage tracker for SuperGrok quota.
 * This is a placeholder that can be replaced with real API later.
 */
export class UsageTracker {
  private tmuxStatus: TmuxStatusManager;
  private currentUsage: number = 100; // Start at 100%

  constructor(tmuxStatus: TmuxStatusManager) {
    this.tmuxStatus = tmuxStatus;
  }

  /**
   * Simulate usage decrease (call this when tasks are executed)
   */
  consume(amount: number = 2) {
    this.currentUsage = Math.max(0, this.currentUsage - amount);
    this.tmuxStatus.updateUsage(this.currentUsage);
    return this.currentUsage;
  }

  getCurrentUsage(): number {
    return this.currentUsage;
  }

  /**
   * Reset usage (for testing)
   */
  reset() {
    this.currentUsage = 100;
    this.tmuxStatus.updateUsage(100);
  }
}
