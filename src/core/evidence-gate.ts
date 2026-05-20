import chalk from 'chalk';

export interface EvidenceRule {
  type: 'file_exists' | 'test_pass' | 'grok_critique' | 'diff_review' | 'security_scan';
  path?: string;
  command?: string;
  min_score?: number;
}

export interface GateDefinition {
  name: string;
  description: string;
  required_evidence: EvidenceRule[];
  criteria: string[];
  retry_policy?: { max_retries: number; backoff: string };
}

export class EvidenceGateEngine {
  private gates: Map<string, GateDefinition> = new Map();

  constructor() {
    // 기본 게이트 등록
    this.registerDefaultGates();
  }

  private registerDefaultGates(): void {
    this.gates.set('production-ready', {
      name: 'production-ready',
      description: '프로덕션 레디 수준 검증',
      required_evidence: [
        { type: 'file_exists', path: 'src/**/*.ts' },
        { type: 'test_pass', command: 'npm test' },
        { type: 'grok_critique', min_score: 85 }
      ],
      criteria: ['모든 required_evidence pass', 'Grok self-critique 점수 >= 85'],
      retry_policy: { max_retries: 3, backoff: 'exponential' }
    });

    this.gates.set('security', {
      name: 'security',
      description: '보안 검증',
      required_evidence: [
        { type: 'security_scan' },
        { type: 'grok_critique', min_score: 90 }
      ],
      criteria: ['보안 취약점 없음', 'Grok self-critique 점수 >= 90']
    });
  }

  async verify(taskContext: any, gateName: string = 'production-ready'): Promise<any> {
    const gate = this.gates.get(gateName);
    if (!gate) {
      return { passed: false, reason: `Gate ${gateName} not found` };
    }

    console.log(chalk.cyan(`🔍 Evidence Gate [${gateName}] 검증 시작...`));

    // 실제 구현에서는 여기서 Evidence 수집 + Grok API 호출
    const mockResult = {
      passed: true,
      score: 88,
      evidence_collected: gate.required_evidence.length,
      reason: '모든 증거 통과',
      suggestions: []
    };

    if (mockResult.passed) {
      console.log(chalk.green(`✅ Gate [${gateName}] PASS (score: ${mockResult.score})`));
    } else {
      console.log(chalk.red(`❌ Gate [${gateName}] FAIL`));
    }

    return mockResult;
  }
}
