import { Orchestrator } from '../core/orchestrator';

/**
 * #ralph 명령어 - Persistent Verify & Fix Loop
 * Event-driven SubagentManager와 연동
 */
export async function handleRalph(
  orchestrator: Orchestrator,
  taskWithFlags: string
): Promise<string> {
  // 플래그 파싱
  const hasAntiSlop = taskWithFlags.includes('--anti-slop') || taskWithFlags.includes('--strict');
  const isStrict = taskWithFlags.includes('--strict');
  const task = taskWithFlags.replace(/--anti-slop|--strict/g, '').trim();
  const subagentManager = orchestrator.getSubagentManager();

  let loopCount = 0;
  const maxLoops = 8; // 안전장치

  orchestrator.updateTmuxStatus({ warning: `Ralph Loop 시작` });

  while (loopCount < maxLoops) {
    loopCount++;

    // 1. Execute phase (주요 작업)
    const executor = subagentManager.spawn('executor');
    console.log(`[Ralph] Loop #${loopCount} - Executor spawned: ${executor.id}`);

    // 실제 작업 시뮬레이션 (나중에 ACP 연동)
    await new Promise(resolve => setTimeout(resolve, 800));

    // 2. Verify phase
    const verifier = subagentManager.spawn('verifier');
    subagentManager.setStatus(verifier.id, 'RUNNING');

    // Verify 로직 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 600));

    const hasIssue = Math.random() > 0.6; // 40% 확률로 이슈 발견

    if (!hasIssue) {
      subagentManager.setStatus(verifier.id, 'COMPLETED');
      subagentManager.setStatus(executor.id, 'COMPLETED');

      // Anti-Slop 강제 적용 (플래그가 있을 때만)
      if (hasAntiSlop) {
        console.log(`[Ralph] Anti-Slop Enforcer 실행 중...`);
        // 실제로는 skillEngine을 통해 anti-slop.md 호출
        // 지금은 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const antiSlopScore = Math.floor(Math.random() * 30) + 70; // 70~100
        console.log(`[Ralph] Anti-Slop Score: ${antiSlopScore}/100`);
        
        if (antiSlopScore < 85 && isStrict) {
          console.log(`[Ralph] Anti-Slop: Critical slop 감지 → 추가 수정`);
          hasIssue = true; // 다시 루프
        }
      }

      orchestrator.updateTmuxStatus({ 
        warning: `Ralph #${loopCount} 완료` 
      });

      return [
        `✅ Ralph Loop 완료 (총 ${loopCount}회)`,
        `Task: ${task}`,
        `모든 검증 통과${hasAntiSlop ? ' + Anti-Slop 적용' : ''}`,
        ``,
        `마지막 Executor: ${executor.id}`,
        `마지막 Verifier: ${verifier.id}`
      ].join('\n');
    }

    // 3. Fix phase
    subagentManager.setStatus(verifier.id, 'COMPLETED');
    const fixer = subagentManager.spawn('fixer');
    
    console.log(`[Ralph] Loop #${loopCount} - Issue found. Fixer spawned: ${fixer.id}`);
    
    await new Promise(resolve => setTimeout(resolve, 700));
    subagentManager.setStatus(fixer.id, 'COMPLETED');
    subagentManager.setStatus(executor.id, 'COMPLETED');

    orchestrator.updateTmuxStatus({ 
      warning: `Ralph #${loopCount} - Fix 완료, 재검증 중...` 
    });

    // 다음 루프를 위해 약간 대기
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return `⚠ Ralph Loop가 ${maxLoops}회를 초과했습니다. 수동 확인이 필요합니다.`;
}
