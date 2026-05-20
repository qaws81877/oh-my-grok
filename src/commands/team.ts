import { Orchestrator } from '../core/orchestrator';

/**
 * #team 명령어 처리
 * - 지정된 수의 Subagent를 병렬로 생성
 * - Worktree 자동 생성
 * - tmux HUD에 실시간 반영
 */
export async function handleTeam(
  orchestrator: Orchestrator,
  rawInput: string
): Promise<string> {
  const subagentManager = orchestrator.getSubagentManager();

  // 간단 파싱: "#team 4:executor "task"" 형태 지원
  const match = rawInput.match(/^(\d+):?(\w+)?\s+(.*)$/);
  let count = 4;
  let role = 'executor';
  let task = rawInput;

  if (match) {
    count = parseInt(match[1], 10) || 4;
    role = match[2] || 'executor';
    task = match[3] || rawInput;
  }

  // Subagent 병렬 생성 (자동으로 worktree 생성 + HUD 업데이트)
  const agents = subagentManager.spawnParallel(count, role);

  // 사용량 차감 (예시)
  orchestrator.consumeUsage(count * 2);

  return [
    `🚀 Team Mode Activated`,
    `Task: ${task}`,
    `Spawned ${count} ${role} subagents`,
    `Worktrees created automatically`,
    `HUD updated in real-time`,
    ``,
    `Agent IDs:`,
    ...agents.map(a => `  - ${a.id} (${a.worktree})`)
  ].join('\n');
}

