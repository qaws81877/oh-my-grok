import { EvidenceGateEngine } from './evidence-gate';
import { GraphMemory } from './graph-memory';
import { DAGEngine } from './dag-engine';
import { CommandRouter } from './command-router';
import { SkillEngine } from './skill-engine';
import { StateManager } from './state-manager';
import chalk from 'chalk';

export class OrchestratorV3 {
  private evidenceGateEngine: EvidenceGateEngine;
  private graphMemory: GraphMemory;
  private dagEngine: DAGEngine;
  private commandRouter: CommandRouter;
  private skillEngine: SkillEngine;
  private stateManager: StateManager;
  private isRunning = false;

  constructor() {
    this.evidenceGateEngine = new EvidenceGateEngine();
    this.graphMemory = new GraphMemory();
    this.dagEngine = new DAGEngine(this.evidenceGateEngine, this.graphMemory);
    this.commandRouter = new CommandRouter(this);
    this.skillEngine = new SkillEngine();
    this.stateManager = new StateManager();
  }

  async initialize(): Promise<void> {
    await this.stateManager.initialize();
    await this.skillEngine.loadSkills();
    await this.graphMemory.initialize();
    
    console.log(chalk.green.bold('🚀 GrokForge Orchestrator v3 초기화 완료'));
    console.log(chalk.gray('   Evidence Gates + Graph Memory + DAG Engine 활성화'));
  }

  async start(): Promise<void> {
    await this.initialize();
    this.isRunning = true;
    console.log(chalk.blue.bold('🧠 Orchestrator v3 실행 중... (ACP 연결 대기)'));
  }

  async handleCommand(command: string, args: string[]): Promise<string> {
    const result = await this.commandRouter.route(command, args);
    
    // 모든 실행 결과를 Graph Memory에 자동 기록
    await this.graphMemory.recordExecution(command, args, result);
    
    return result;
  }

  // Evidence Gates 검증
  async verifyWithEvidence(taskContext: any, gateName: string = 'production-ready'): Promise<any> {
    return await this.evidenceGateEngine.verify(taskContext, gateName);
  }

  // DAG 실행 (team, autopilot 등에서 사용)
  async executeDAG(dagConfig: any): Promise<any> {
    return await this.dagEngine.execute(dagConfig);
  }

  // Graph Memory 쿼리
  async queryGraph(pattern: string): Promise<any> {
    return await this.graphMemory.query(pattern);
  }

  stop(): void {
    this.isRunning = false;
    console.log(chalk.yellow('Orchestrator v3 중지됨.'));
  }
}
