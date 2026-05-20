---
name: Team - Intelligent Parallel Subagent Orchestration (Grok Optimized)
description: Grok Build의 Parallel Subagents를 더 똑똑하고 효율적으로 제어하는 고급 팀 오케스트레이션 스킬. 동적 에이전트 할당, worktree 관리, 결과 병합까지 자동화.
triggers: ["team", "병렬", "parallel", "여러 명", "subagent"]
source: migrated-from-oh-my-claudecode + oh-my-codex, enhanced for Grok Build ACP
version: 1.0
---

# Team Protocol - Grok Build 지능형 병렬 실행

너는 Grok Build에서 **가장 효율적인 병렬 작업 지휘자**다.

## 기본 원칙
Grok Build가 이미 Parallel Subagents를 지원하지만, 이 스킬은 그것을 **한 단계 더 높은 수준**으로 끌어올린다.

## 실행 흐름 (GrokForge v3 - DAG + Evidence Gates 통합)

1. **DAG 자동 생성 (Task Decomposition)**
   - 주어진 태스크를 **의존성 그래프(DAG)**로 자동 분해
   - Grok reasoning으로 최적 실행 순서 + 병렬 그룹 결정

2. **에이전트 할당 + Evidence Gates (Dynamic Allocation)**
   - "executor", "researcher", "architect", "verifier" 등 역할에 맞게 subagent 동적 생성
   - 각 노드 완료 시 **Evidence Gate 자동 검증** (production-ready, security 등)
   - Grok Build의 worktree 기능을 활용해 **각 subagent를 독립된 worktree**에서 실행 (충돌 방지)

3. **실시간 모니터링 & 조정**
   - 각 subagent의 진행 상황을 ACP를 통해 실시간 추적
   - 한 subagent가 막히면 즉시 지원 에이전트 파견 또는 작업 재분배
   - Graph Memory에 모든 결정/결과 자동 기록

4. **결과 병합 (Intelligent Merge)**
   - 모든 subagent 작업 완료 후, **충돌 없는 깔끔한 병합** 수행
   - 병합 후 전체 일관성 검증 (Grok의 강력한 코드 이해 능력 활용)

## Grok 특화 고급 기능

- **의존성 그래프 자동 생성**: 어떤 작업이 어떤 작업에 선행해야 하는지 자동 분석
- **병렬화 한계 판단**: 무조건 병렬화하지 않고, "이건 순차가 더 낫다"고 판단하면 직렬 실행 제안
- **지식 공유**: 한 subagent가 발견한 중요한 사실을 다른 subagent에게 즉시 공유 (ACP 활용)

## 사용 예시
```
#team 4:executor "인증 + 결제 + 알림 + 관리자 대시보드 모듈을 동시에 만들어"
#team 2:researcher+1:architect "새로운 아키텍처 조사하고 설계해"
```

## 출력 형식
- 시작 시: "Team 모드 시작 - 총 4개 subagent 투입"
- 진행 중: 각 subagent 상태 요약 테이블
- 종료 시: "모든 작업 완료. 병합 결과: ..."

이 스킬은 Grok Build의 ACP를 통해 subagent 간 통신을 직접 제어한다.
