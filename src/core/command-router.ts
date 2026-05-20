import { SkillEngine } from './skill-engine';
import { Orchestrator } from './orchestrator';
import { OrchestratorV3 } from './orchestrator-v3';
import { handleTeam as handleTeamCommand } from '../commands/team';
import { handleRalph as handleRalphCommand } from '../commands/ralph';
import { handleAutopilot as handleAutopilotCommand } from '../commands/autopilot';
import { handleRalplan as handleRalplanCommand } from '../commands/ralplan';
import { handleWorktrees as handleWorktreesCommand } from '../commands/worktrees';
import { handleSecurityReview as handleSecurityReviewCommand } from '../commands/security-review';
import { handleCiSetup as handleCiSetupCommand } from '../commands/ci-setup';

export class CommandRouter {
  private skillEngine: SkillEngine;
  private orchestrator: Orchestrator;
  private orchestratorV3: OrchestratorV3 | null = null;

  constructor(skillEngine: SkillEngine, orchestrator: Orchestrator, orchestratorV3?: OrchestratorV3) {
    this.skillEngine = skillEngine;
    this.orchestrator = orchestrator;
    if (orchestratorV3) this.orchestratorV3 = orchestratorV3;
  }

  async route(command: string, args: string[]): Promise<string> {
    const cmd = command.toLowerCase().replace('#', '');

    switch (cmd) {
      case 'team':
        return handleTeamCommand(this.orchestrator, args.join(' '));
      case 'ralph':
        return handleRalphCommand(this.orchestrator, args.join(' '));
      case 'autopilot':
        return handleAutopilotCommand(this.orchestrator, args.join(' '));
      case 'deep-interview':
        return this.handleDeepInterview(args);
      case 'ralplan':
        return handleRalplanCommand(this.orchestrator, args.join(' '));
      case 'worktrees':
        return handleWorktreesCommand(this.orchestrator, args);
      case 'security-review':
        return handleSecurityReviewCommand(this.orchestrator, args);
      case 'ci-setup':
        return handleCiSetupCommand(this.orchestrator, args);
      default:
        // Try to find matching skill
        const skill = this.skillEngine.findByTrigger(cmd);
        if (skill) {
          return this.executeSkill(skill, args);
        }
        return `알 수 없는 명령어: #${cmd}\n사용 가능한 명령어: #team, #ralph, #autopilot, #deep-interview, #worktrees\n#ralph 예시: #ralph "작업 내용" --anti-slop`;
    }
  }

  // handleTeam is now handled by the imported function from ../commands/team.ts
  // It uses the real SubagentManager with Event-driven updates and Worktree management.


  private async handleRalph(args: string[]): Promise<string> {
    const task = args.join(' ');
    
    if (this.orchestratorV3) {
      // v3 모드: Evidence Gates + Graph Memory 연동
      const result = await this.orchestratorV3.verifyWithEvidence({ task }, 'production-ready');
      await this.orchestratorV3.queryGraph(task);
    }
    
    return `🔄 [Ralph Mode v3] ${task}\n\n` +
           `Evidence Gates + Graph Memory + Self-Critique 통합 루프.\n` +
           `생산성/보안 게이트 자동 검증 + 모든 결정 기록.`;
  }

  private async handleAutopilot(args: string[]): Promise<string> {
    return `🤖 [Autopilot Mode]\n\n` +
           `최소 개입으로 최대한 자동 실행합니다.\n` +
           `고품질 skills + Parallel Subagents + Self-Critique를 결합합니다.`;
  }

  private async handleDeepInterview(args: string[]): Promise<string> {
    const skill = this.skillEngine.getSkill('Deep Interview (Grok Optimized)');
    if (skill) {
      return `📋 Deep Interview 스킬 로드 완료\n\n${skill.content.substring(0, 800)}...\n\n` +
             `이제 사용자의 요구사항을 깊이 파고들겠습니다.`;
    }
    return 'Deep Interview 스킬을 찾을 수 없습니다.';
  }

  private async executeSkill(skill: any, args: string[]): Promise<string> {
    return `✨ 스킬 실행: ${skill.name}\n\n${skill.content.substring(0, 600)}...`;
  }
}
