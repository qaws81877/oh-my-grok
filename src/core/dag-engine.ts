import { EvidenceGateEngine } from './evidence-gate';
import { GraphMemory } from './graph-memory';
import chalk from 'chalk';

export class DAGEngine {
  constructor(
    private evidenceGateEngine: EvidenceGateEngine,
    private graphMemory: GraphMemory
  ) {}

  async execute(dagConfig: any): Promise<any> {
    console.log(chalk.magenta(`📊 DAG Execution 시작: ${dagConfig.name || 'Unnamed DAG'}`));

    const results: any[] = [];

    for (const node of dagConfig.nodes || []) {
      console.log(chalk.cyan(`  → Executing node: ${node.id} (${node.type})`));

      // Evidence Gate 검증 (있는 경우)
      if (node.evidence_gates) {
        for (const gate of node.evidence_gates) {
          const gateResult = await this.evidenceGateEngine.verify(node, gate);
          if (!gateResult.passed) {
            console.log(chalk.red(`    ❌ Gate ${gate} 실패 - 노드 중단`));
            return { success: false, failed_at: node.id };
          }
        }
      }

      // 실제 작업 실행 (mock)
      const nodeResult = {
        nodeId: node.id,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      results.push(nodeResult);
      
      // Graph Memory에 기록
      await this.graphMemory.recordExecution(
        `DAG:${node.id}`, 
        [node.type], 
        JSON.stringify(nodeResult)
      );
    }

    console.log(chalk.green(`✅ DAG Execution 완료: ${results.length} nodes`));
    return { success: true, results };
  }
}
