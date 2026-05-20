import { Orchestrator } from '../core/orchestrator';
import { SkillEngine } from '../core/skill-engine';

/**
 * #security-review 명령어
 * 전용 보안 리뷰 스킬을 호출하여 심층 보안 분석 수행
 */
export async function handleSecurityReview(
  orchestrator: Orchestrator,
  args: string[]
): Promise<string> {
  const task = args.join(' ');

  if (!task || task.trim().length === 0) {
    return `## Security Review

사용법: #security-review "검토할 코드/설계/계획"

예시:
#security-review "인증 시스템과 결제 로직"
#security-review "사용자 데이터 처리 부분 전체"
`;
  }

  // Skill Engine을 통해 security-review 스킬 실행
  const skillEngine = new SkillEngine();
  await skillEngine.loadSkills();

  const skill = skillEngine.findByTrigger('security-review');
  
  if (!skill) {
    return `❌ security-review 스킬을 찾을 수 없습니다.\n` +
           `skills/security-review.md 파일이 존재하는지 확인해주세요.`;
  }

  const result = await skillEngine.executeSkill(skill, task);
  return result;
}
