# oh-my-grok-build

**SuperGrok Build (Grok Build CLI) 전용 고품질 ACP Orchestration Harness**

xAI 공식 Grok Build CLI를 위한 **풀 오케스트레이션** 레이어입니다.  
oh-my-claudecode와 oh-my-codex의 철학을 Grok Build의 ACP + Parallel Subagents + Skills 네이티브 지원에 맞게 재설계했습니다.

## 주요 기능 (v0.4)

- **ACP 연동** — Grok Build와 실시간 통신 (stdio 기반)
- **Event-driven SubagentManager** — 병렬 Subagent 관리 + Worktree 자동 처리
- **Review Agent** — Architecture + Critical + Adversarial 검토
- **Security Review** — 전용 보안 리뷰 스킬 (`#security-review`)
- **CI 자동화** — `#ci-setup`으로 GitHub Actions 파이프라인 자동 생성
- **tmux HUD** — 실시간 agents / worktrees / usage / session time 모니터링

## 명령어 레퍼런스

| 명령어              | 설명                                      | 옵션 |
|---------------------|-------------------------------------------|------|
| `#team`             | 병렬 Subagent 실행                        | - |
| `#ralph`            | 강력한 Verify & Fix 루프 (UltraQA 포함)   | `--anti-slop` |
| `#autopilot`        | 자율 실행                                 | - |
| `#ralplan`          | 계획 수립 + Review Agent 자동 검토        | - |
| `#security-review`  | 보안 취약점 심층 분석                     | - |
| `#ci-setup`         | GitHub Actions CI 파이프라인 자동 생성    | `--include=security,lint,deploy`, `--full` |
| `#worktrees`        | 현재 worktree 상태 확인                   | - |
| `#deep-interview`   | 요구사항 깊이 있게 수집                   | - |

## 사용 예시

```bash
# 기본 워크플로
#deep-interview
#ralplan "인증 + 결제 시스템 설계"
#security-review "결제 로직"
#team 4:executor "인증 시스템 구현"

# CI 파이프라인 자동 생성
#ci-setup --include=security,lint
#ci-setup --full

# 강력한 검증
#ralph "보안이 중요한 결제 시스템" --anti-slop
```

## 설치

```bash
git clone https://github.com/yourname/oh-my-grok-build
cd oh-my-grok-build
npm install
npm run build
npm link
```

## 프로젝트 구조

```
oh-my-grok-build/
├── src/
│   ├── core/              # Orchestrator, SubagentManager, ACPClient, SkillEngine
│   └── commands/          # team, ralph, autopilot, ralplan, security-review, ci-setup, worktrees
├── skills/                # review-agent, security-review, ultraqa, deep-interview 등
├── tmux/                  # HUD (statusline)
└── test/                  # mock-grok-build.ts (테스트용)
```

## 현재 상태 (v0.4)

- ACP 기반 실시간 통신 완료
- Security Review + CI 자동화 기능 완성
- Review Agent + Adversarial Verification 통합
- tmux HUD 기본 동작 안정화

**다음 목표**: Staged Team Pipeline (`#team` 고도화) + 전체 워크플로우 완성
```

### Anti-Slop (AI Slop 방지)

```bash
#ralph "작업 내용" --anti-slop     # Anti-Slop 1회 적용
#ralph "작업 내용" --strict        # Anti-Slop + 엄격 검증
```

## 현재 지원 명령어 (Phase 1)

- `#team` — 지능형 병렬 subagent 오케스트레이션
- `#ralph` — 영속적 Verify/Fix 루프
- `#autopilot` — 최소 개입 자동 실행
- `#deep-interview` — 깊이 있는 요구사항 분석

## 포함된 고품질 Skills (Grok Optimized)

- `deep-interview.md`
- `ralph.md`
- `team.md`
- `self-critique.md`

모두 Grok의 reasoning, self-critique, 긴 컨텍스트를 최대한 활용하도록 설계됨.

## 현재 상태 (v0.5)

- Core: Orchestrator + Event-driven SubagentManager + ACP (stdio 최적화)
- Commands: `#team`, `#ralph` (--anti-slop, --strict 지원), `#autopilot`, `#ralplan`, `#worktrees`
- Skills: Review Agent, UltraQA, Anti-Slop Enforcer, Deep-Interview 등
- tmux HUD: 최소화된 statusline + 실시간 worktree/agents 표시
- Philosophy: Grok truth-seeking + Anti-Slop + 유연한 워크플로

## 로드맵

- Staged Team Pipeline (5단계: plan → prd → exec → verify → fix)
- 더 많은 고품질 스킬 (security-review, performance-audit 등)
- 실제 Grok Build ACP 완전 연동
- Notification / Hook 시스템

## 기반

- oh-my-claudecode (Yeachan-Heo)
- oh-my-codex (Yeachan-Heo)
- xAI Grok Build CLI 공식 문서

---

**SuperGrok Heavy 사용자 전용** — Grok의 진짜 힘을 제대로 끌어올리는 harness입니다.
