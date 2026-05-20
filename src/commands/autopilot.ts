import { Orchestrator } from '../core/orchestrator';

/**
 * #autopilot 명령어 - 최소 개입 자동 실행
 * SubagentManager를 활용해 자율적으로 작업 수행
 */
export async function handleAutopilot(
  orchestrator: Orchestrator,
  task: string
): Promise<string> {
  const subagentManager = orchestrator.getSubagentManager();

  orchestrator.updateTmuxStatus({ warning: 'Autopilot Mode Activated' });

  // 1. Planner Subagent
  const planner = subagentManager.spawn('planner');
  console.log(`[Autopilot] Planner spawned: ${planner.id}`);

  await new Promise(resolve => setTimeout(resolve, 600));

  // 2. Executor들 병렬 실행
  const executors = subagentManager.spawnParallel(3, 'executor');
  console.log(`[Autopilot] ${executors.length} Executors spawned`);

  await new Promise(resolve => setTimeout(resolve, 1200));

  // 3. Verifier
  const verifier = subagentManager.spawn('verifier');
  subagentManager.setStatus(verifier.id, 'RUNNING');

  await new Promise(resolve => setTimeout(resolve, 800));

  // 완료 처리
  subagentManager.setStatus(planner.id, 'COMPLETED');
  executors.forEach(e => subagentManager.setStatus(e.id, 'COMPLETED'));
  subagentManager.setStatus(verifier.id, 'COMPLETED');

  orchestrator.updateTmuxStatus({ warning: '' });

  return [
    `🤖 Autopilot 완료`,
    `Task: ${task}`,
    ``,
    `Planner: ${planner.id}`,
    `Executors: ${executors.map(e => e.id).join(', ')}`,
    `Verifier: ${verifier.id}`,
    ``,
    `모든 작업이 자율적으로 수행되었습니다.`
  ].join('\n');
}
