# oh-my-grok-build
## SuperGrok Build 전용 ACP 기반 풀 오케스트레이션 Harness

**버전**: v0.1.0 (설계 단계)  
**대상**: Grok Build CLI (xAI 공식, SuperGrok Heavy 전용, 2026.05.14 Early Beta)  
**목표**: Grok Build의 ACP를 최대한 활용하여, oh-my-claudecode / oh-my-codex 수준 이상의 고급 multi-agent orchestration 제공

---

## 1. 프로젝트 방향성

Grok Build CLI는 이미 다음을 **네이티브 지원**합니다:
- Plugins / Hooks / Skills / AGENTS.md / MCP servers
- ACP (Agent Communication Protocol)
- Parallel Subagents + Worktree

따라서 기존 두 harness처럼 "없는 기능을 억지로 붙이는" 형태가 아니라,  
**"Grok Build의 강점을 극대화하는 고품질 orchestration 레이어"**를 만드는 것이 목표입니다.

**핵심 방향**:
- **ACP 풀 활용** (가장 중요)
- Grok Build 세션 안에서 자연스럽게 동작하는 고급 명령어 (`#team`, `#ralph` 등)
- Parallel Subagent를 더 똑똑하게 제어
- Grok의 장점(긴 컨텍스트, 강력한 reasoning, self-critique)을 최대한 살린 skills

---

## 2. 전체 아키텍처

```
Grok Build CLI (공식)
        │
        ├── ACP (Agent Communication Protocol)
        │       │
        │       └── oh-my-grok-build Orchestrator (별도 프로세스 또는 플러그인)
        │               ├── Command Router
        │               ├── Skill Engine
        │               ├── Subagent Manager (Parallel + Worktree)
        │               ├── State Manager (.sgb/)
        │               └── Grok API Client (고급 라우팅)
        │
        └── 사용자 세션 (터미널)
                ├── #team, #ralph, #autopilot, #deep-interview, #superbuild
                └── 자연어 지시 → Orchestrator가 ACP로 제어
```

**두 가지 배포 형태** (추후 결정):
- **형태 A (추천)**: Grok Build 플러그인으로 배포 (가장 가볍고 네이티브)
- **형태 B**: 독립 래퍼 CLI (`sgb` 또는 `grok-build` 대체) + ACP 연결

---

## 3. 디렉토리 구조 (v1)

```
oh-my-grok-build/
├── package.json
├── README.md
├── DESIGN.md
├── src/
│   ├── index.ts                    # 진입점 (플러그인 등록 또는 ACP 서버)
│   ├── core/
│   │   ├── orchestrator.ts         # ACP 기반 메인 오케스트레이터
│   │   ├── acp-client.ts           # Grok Build ACP 통신 클라이언트
│   │   ├── command-router.ts       # #team, #ralph 등 명령어 파싱/라우팅
│   │   ├── skill-engine.ts         # 스킬 로딩 + 주입
│   │   ├── subagent-manager.ts     # Parallel Subagent + Worktree 제어
│   │   └── state-manager.ts        # .sgb/ 상태 관리
│   ├── commands/                   # 고급 명령어 구현
│   │   ├── team.ts
│   │   ├── ralph.ts
│   │   ├── autopilot.ts
│   │   ├── deep-interview.ts
│   │   └── superbuild.ts
│   ├── skills/                     # 고품질 스킬 (Grok 최적화)
│   │   ├── plan-review-approve.md
│   │   ├── parallel-subagent.md
│   │   ├── self-critique.md
│   │   ├── codebase-understanding.md
│   │   └── production-ready.md
│   ├── agents/                     # 전문 에이전트 정의
│   │   ├── planner.ts
│   │   ├── executor.ts
│   │   ├── verifier.ts
│   │   ├── researcher.ts
│   │   └── architect.ts
│   └── utils/
│       └── worktree.ts
├── templates/
│   └── AGENTS.md                   # Grok Build용 최적화된 AGENTS.md 템플릿
├── hooks/
│   └── session-start.ts
└── acp/
    └── protocol.ts                 # ACP 메시지 타입 정의
```

---

## 4. 핵심 기능 상세

### 4.1 고급 명령어 (우선순위 1)

Grok Build 세션 안에서 아래 명령어 사용 가능하게 함:

| 명령어              | 설명                                      | 내부 동작 |
|---------------------|-------------------------------------------|-----------|
| `#team 3:executor`  | 3명의 executor로 병렬 실행                | Subagent Manager + ACP |
| `#ralph "task"`     | Plan → Execute → Verify → Fix 루프        | Orchestrator + Skill Engine |
| `#autopilot "task"` | 완전 자동 실행 (최소 개입)                | Full orchestration |
| `#deep-interview`   | 요구사항 깊게 파악                        | Researcher Agent |
| `#superbuild`       | 프로덕션 레벨 빌드/리팩토링               | Production-ready skill |

### 4.2 Parallel Subagent 최적화 (우선순위 2)

- Grok Build의 기본 Parallel Subagent보다 **더 똑똑한 제어**
  - 동적 subagent 수 결정
  - Worktree 자동 생성/관리
  - Subagent 간 통신 (ACP 활용)
  - 실패한 subagent 자동 재시도 + merge 전략

### 4.3 고품질 Skills 세트 (우선순위 3)

Grok의 강점을 극대화한 skills (예시):

- `plan-review-approve.md` — Plan 모드 최적화
- `self-critique.md` — Grok의 reasoning을 활용한 강력한 self-review
- `parallel-subagent.md` — 병렬 실행 가이드
- `codebase-understanding.md` — 대형 레포 전체 이해
- `production-ready.md` — 프로덕션 코드 품질 보장

---

## 5. 설치 및 사용 흐름 (예상)

```bash
# 1. 설치
npm install -g oh-my-grok-build

# 2. Grok Build에서 플러그인 등록 (또는 자동 감지)
grok-build
> /plugin install oh-my-grok-build

# 3. 사용
#team 4:executor "인증 모듈 전체 리팩토링해"
#ralph "결제 시스템을 안정적으로 만들어"
#superbuild "이 프로젝트를 프로덕션 레디로 업그레이드"
```

---

## 6. Phase별 로드맵

**Phase 1 (MVP, 2~3일)**
- 기본 orchestrator + ACP 연결
- 3개 핵심 명령어 (`#team`, `#ralph`, `#autopilot`)
- 기본 skills 5개 + AGENTS.md 템플릿
- State 관리 (.sgb/)

**Phase 2 (3~5일)**
- Parallel Subagent Optimizer (고급 제어)
- Worktree 자동 관리
- Self-critique 루프 강화
- 더 많은 고급 명령어

**Phase 3 (고급)**
- tmux HUD (선택)
- MCP 서버 연동
- 커스텀 ACP 봇 제작 가이드
- 커뮤니티 스킬 마켓플레이스

---

## 7. 기술 스택 (제안)

- **언어**: TypeScript (Node.js 20+)
- **ACP 통신**: WebSocket 또는 stdio 기반 (Grok Build ACP 스펙 확인 필요)
- **상태 관리**: 파일 기반 (.sgb/) + optional Redis
- **패키지**: npm 배포

---

## 다음 단계

이 DESIGN.md를 기반으로:

1. **초기 skeleton 코드** 생성 (src/ 구조 + 기본 orchestrator)
2. **첫 번째 skill** (plan-review-approve) 구현 예시
3. **ACP 연결 테스트 코드**

원하시면 바로 **Phase 1 skeleton**을 만들어드릴까요?

또는 이 설계에서 수정/추가하고 싶은 부분이 있나요?