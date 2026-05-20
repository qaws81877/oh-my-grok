# oh-my-grok-build - tmux HUD Design (Phase 3)

**목표**: Grok Build CLI를 tmux로 감싸서 **고품질 시각화 HUD**를 제공.  
omx(oh-my-codex)의 tmux HUD 경험을 기반으로 하되, Grok Build의 **Parallel Subagent + ACP + Worktree** 강점을 극대화하는 방향으로 설계.

---

## 1. 전체 레이아웃 (추천)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Grok Build Main Session                                      [Session: main] │
│                                                                              │
│  (grok-build 실제 실행 화면 - 대부분의 시간 여기서 작업)                     │
│                                                                              │
├──────────────────────────────┬───────────────────────────────────────────────┤
│  Subagent Dashboard          │  Worktree & Parallel Tasks                    │
│  ──────────────────────────  │  ───────────────────────────────────────────  │
│  [1] executor-01   RUNNING   │  feature/auth          (active)               │
│  [2] executor-02   RUNNING   │  feature/payment       (active)               │
│  [3] verifier-01   IDLE      │  feature/notification  (merged)               │
│  [4] researcher-01 RUNNING   │                                               │
│                              │  Active Subagents: 3 / 6                      │
│  Total: 4 subagents          │  Bottleneck: None                             │
├──────────────────────────────┴───────────────────────────────────────────────┤
│  ACP / Event Monitor                                        [Ralph Status]   │
│  ───────────────────────────────────────────────────────────────────────────  │
│  [14:32] ACP: Subagent #2 task completed → result received                   │
│  [14:33] Merge started (Intelligent Merge v2)                                │
│  [14:33] Self-Critique: 2 weak points found → auto-fix triggered             │
│                                                                              │
│  Ralph Loop: #4  |  Status: Running  |  Next: Verify phase                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**레이아웃 비율** (tmux 기준):
- 상단 메인: `70%`
- 중간: `20%` (Subagent + Worktree split)
- 하단: `10%` (로그 + Ralph 상태)

---

## 2. 각 페인 상세 설명

### Pane 1: Main Grok Build Session (가장 중요)
- 실제 `grok-build` 명령어가 실행되는 메인 창
- 사용자가 직접 입력하는 공간
- `#team`, `#ralph` 등의 명령어도 여기서 입력

### Pane 2: Subagent Dashboard
- 현재 실행 중인 모든 Subagent 상태 실시간 표시
- 표시 항목:
  - Subagent ID / 역할 (executor, verifier, researcher 등)
  - 상태 (RUNNING / IDLE / WAITING / ERROR)
  - 현재 작업 요약 (짧게)
  - 진행률 (가능한 경우)
- 색상 코딩: RUNNING=녹색, IDLE=회색, ERROR=빨강

### Pane 3: Worktree & Parallel Tasks
- 각 Subagent가 사용하는 worktree 목록
- 상태: `active` / `merged` / `conflict`
- 현재 병렬 작업 수 표시
- Bottleneck 자동 감지 결과 표시

### Pane 4: ACP / Event Monitor + Ralph Status
- ACP를 통해 오는 이벤트 실시간 로그
- Ralph 루프 진행 상황
- Self-Critique 결과 요약
- 중요한 이벤트만 필터링해서 표시 (선택 가능)

---

## 3. 기술적 구현 방향

### 3.1 tmux 세션 관리
- `tmux/` 디렉토리에 레이아웃 스크립트 작성
- `sgb tmux start` 또는 `sgb start --tmux` 명령어로 실행
- 세션 이름: `grok-build-<project-name>`

### 3.2 페인 간 통신
- `.sgb/tmux/` 디렉토리에 상태 파일 생성
  - `subagents.json`
  - `worktrees.json`
  - `ralph-status.json`
  - `events.log`
- Subagent Manager와 Orchestrator가 주기적으로 상태 파일 업데이트
- tmux pane에서는 `watch` 또는 `tail -f` + 간단한 포매터로 표시

### 3.3 실시간 업데이트 방식 (추천)
**옵션 A (간단)**: 파일 기반 + `watch` 명령어
**옵션 B (고급)**: Node.js 스크립트가 tmux pane에 직접 출력 (더 부드러움)
**옵션 C (최고)**: tmux + `tmux display-message` + 소켓 통신

초기에는 **옵션 A**로 빠르게 만들고, 이후 B로 업그레이드 추천.

### 3.4 키바인딩 (tmux prefix + 추가)
- `Prefix + s` : Subagent Dashboard 포커스
- `Prefix + w` : Worktree 페인 포커스
- `Prefix + l` : 로그/이벤트 페인 포커스
- `Prefix + r` : Ralph 상태 강제 갱신
- `Prefix + q` : HUD 종료 (세션 유지)

---

## 4. omx와의 차별점

| 기능                    | oh-my-codex (OMX)       | oh-my-grok-build (제안)              |
|-------------------------|-------------------------|--------------------------------------|
| Subagent 시각화         | 제한적                  | **강력** (실시간 + 역할 표시)        |
| Worktree 관리           | 없음                    | **명시적 표시**                      |
| ACP 이벤트 모니터링     | 없음                    | **지원**                             |
| Ralph 루프 시각화       | 기본                    | **상세** (loop count, critique 결과) |
| Bottleneck 감지         | 없음                    | **자동**                             |
| Self-Critique 결과      | 제한적                  | **명확히 표시**                      |

---

## 5. 구현 로드맵 (제안)

**Phase 3.1** (빠른 MVP)
- 기본 tmux 레이아웃 스크립트
- 파일 기반 상태 표시 (Subagent + Worktree)
- `sgb tmux start` 명령어

**Phase 3.2**
- Ralph 상태 + ACP 이벤트 연동
- 색상 + 간단한 포매팅
- 키바인딩 추가

**Phase 3.3** (고급)
- Node.js 기반 실시간 HUD 스크립트
- 더 부드러운 업데이트
- 커스텀 테마 지원

---

## 6. 다음 단계

이 설계에 대해 어떻게 생각하시나요?

특히 다음 중 원하는 부분을 알려주세요:

- 레이아웃을 더 세로형 / 가로형으로 바꾸고 싶다
- 특정 정보(예: Self-Critique 상세 결과)를 더 강조하고 싶다
- 실제 tmux 스크립트 코드부터 만들기 시작
- omx에서 쓰신 기존 tmux 코드를 참고해서 포팅

원하는 방향 말씀해주세요!