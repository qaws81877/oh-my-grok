import { Orchestrator } from '../core/orchestrator';
import fs from 'fs-extra';
import path from 'path';

/**
 * #worktrees 명령어
 * 현재 Grok Build가 관리하는 worktree 목록과 상태를 보여줍니다.
 * (Grok Build 네이티브 worktree를 최대한 활용하면서 편의 기능만 추가)
 */
export async function handleWorktrees(
  orchestrator: Orchestrator,
  args: string[]
): Promise<string> {
  const subagentManager = orchestrator.getSubagentManager();
  const worktreeBaseDir = path.join(process.cwd(), '.worktrees');

  // SubagentManager에서 관리 중인 worktree 목록 수집
  const activeWorktrees = subagentManager.getAll()
    .filter(agent => agent.worktree)
    .map(agent => ({
      id: agent.id,
      role: agent.role,
      status: agent.status,
      worktree: agent.worktree,
      startedAt: agent.startedAt
    }));

  // 실제 파일 시스템에 존재하는 worktree 디렉토리 확인 (Grok Build 네이티브)
  let nativeWorktrees: string[] = [];
  if (fs.existsSync(worktreeBaseDir)) {
    nativeWorktrees = fs.readdirSync(worktreeBaseDir)
      .filter(name => {
        const fullPath = path.join(worktreeBaseDir, name);
        return fs.statSync(fullPath).isDirectory();
      });
  }

  let output = `## Worktree Status\n\n`;

  if (activeWorktrees.length === 0 && nativeWorktrees.length === 0) {
    output += `현재 활성 worktree가 없습니다.\n`;
    output += `Grok Build가 자동으로 worktree를 생성하여 사용합니다.\n`;
    return output;
  }

  // Subagent가 사용 중인 worktree
  if (activeWorktrees.length > 0) {
    output += `### Subagent가 사용 중인 Worktree\n\n`;
    output += `| Agent ID | Role | Status | Worktree | Started |\n`;
    output += `|----------|------|--------|----------|---------|\n`;

    activeWorktrees.forEach(w => {
      const started = w.startedAt ? new Date(w.startedAt).toLocaleTimeString() : '-';
      output += `| ${w.id} | ${w.role} | ${w.status} | ${w.worktree} | ${started} |\n`;
    });
    output += `\n`;
  }

  // Grok Build 네이티브 worktree (파일 시스템 기준)
  if (nativeWorktrees.length > 0) {
    output += `### Grok Build 네이티브 Worktree (파일 시스템)\n\n`;
    output += nativeWorktrees.map(w => `- ${w}`).join('\n');
    output += `\n\n`;
  }

  output += `**참고**: Grok Build가 worktree 생성/관리를 네이티브로 수행합니다.\n`;
  output += `이 명령어는 현재 상태를 보기 좋게 보여주는 편의 기능입니다.\n`;

  return output;
}
