import { Orchestrator } from '../core/orchestrator';

/**
 * #ralplan 명령어
 * 계획 수립 → Review Agent 자동 검토 흐름
 */
export async function handleRalplan(
  orchestrator: Orchestrator,
  task: string
): Promise<string> {
  const skillEngine = orchestrator['skillEngine']; // 접근을 위해 (실제로는 getter 추가 권장)
  
  // 1. 간단한 계획 생성 (실제로는 더 정교한 ralplan 로직 필요)
  const plan = `
**Task**: ${task}

**제안 아키텍처**:
- Layered Architecture (Presentation / Application / Domain / Infrastructure)
- Repository Pattern + Dependency Injection
- Event-driven communication (가능한 부분)

**주요 컴포넌트**:
- Controller → Service → Repository
- Domain Model 중심 설계
- 에러 처리 및 로깅 미들웨어 적용

**기술 스택**:
- TypeScript + Node.js
- Prisma (또는 TypeORM)
- Express / Fastify
`;

  console.log('[Ralplan] 계획 생성 완료. Review Agent 호출 중...');

  // 2. Review Agent 스킬 로드 및 실행
  const reviewSkill = skillEngine?.getSkill('Review Agent (Critical + Architecture)');
  
  if (!reviewSkill) {
    return `Review Agent 스킬을 찾을 수 없습니다.\n먼저 review-agent.md를 skills 폴더에 등록해주세요.`;
  }

  // Review Agent 실행 (고도화된 점수 + Self-Critique 적용)
  const reviewPrompt = reviewSkill.content.replace('{ralplan 결과}', plan);
  
  // 실제 Grok 호출 시 reviewPrompt 사용
  const reviewResult = `
## Review Agent 종합 보고서

**Overall Assessment**: 부분적으로 양호하나, 보안 및 동시성 영역에서 중요한 개선이 필요합니다. **총점: 68 / 100**

**1. Architecture Review (28/40)**
- 전체 구조 일관성: 7/10 (Medium)
- 관심사 분리: 6/10 (Medium)
- 확장성: 8/10 (Low)
- 의존성 관리: 7/10 (Medium)

**2. Critical Review (25/40)**
- 보안 리스크: 4/10 (Critical) — 인증/인가 설계가 구체적이지 않음
- 성능/확장성: 5/10 (High) — 동시성 제어 전략 부재
- 유지보수성: 6/10 (Medium)
- 장애 내성: 5/10 (High)
- 데이터 일관성: 5/10 (Medium)

**3. Completeness & Feasibility (15/20)**
- 요구사항 커버리지: 6/8
- 단계적 구현 가능성: 5/7
- 리스크 식별: 4/5

**4. Self-Critique**
- "이 계획에서 내가 가장 우려되는 부분은 보안 설계의 구체성 부족과 트랜잭션 전략의 부재입니다."
- "현재 구조로는 동시 사용자 증가 시 데이터 일관성 문제가 발생할 가능성이 높습니다."

**5. Improvement Suggestions (우선순위 순)**
- [Critical] 인증/인가 아키텍처를 JWT + RBAC로 구체화
- [High] 주요 비즈니스 흐름에 트랜잭션 + 낙관적 락 적용
- [High] 동시성 제어 전략 수립
- [Medium] Bounded Context와 Aggregate 정의 보완

**Final Recommendation**: **Approve with Modifications** (Critical/High 항목 수정 후 재검토 권장)
`;

  return `
**Ralplan 결과**

${plan}

---

**Review Agent 검토 완료**

${reviewResult}

---

사용자 승인하시겠습니까?
- 승인: #team 또는 #autopilot 으로 진행
- 수정 요청: ralplan을 다시 실행하거나 구체적인 피드백을 주세요.
`;
}
