import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class GraphMemory {
  private baseDir = path.join(process.cwd(), '.sgb', 'graph');
  private nodes: any[] = [];
  private edges: any[] = [];

  async initialize(): Promise<void> {
    await fs.ensureDir(this.baseDir);
    console.log(chalk.gray(`   Graph Memory initialized at ${this.baseDir}`));
  }

  async recordExecution(command: string, args: string[], result: string): Promise<void> {
    const node = {
      id: `exec-${Date.now()}`,
      type: 'Execution',
      command,
      args,
      result: result.substring(0, 200),
      timestamp: new Date().toISOString()
    };
    
    this.nodes.push(node);
    await this.saveGraph();
  }

  async query(pattern: string): Promise<any> {
    // 간단한 패턴 매칭 (실제로는 더 정교한 쿼리 엔진)
    const matches = this.nodes.filter(n => 
      n.command?.includes(pattern) || 
      n.result?.includes(pattern)
    );
    
    return {
      matches: matches.length,
      results: matches.slice(0, 5)
    };
  }

  private async saveGraph(): Promise<void> {
    await fs.writeJson(path.join(this.baseDir, 'nodes.json'), this.nodes, { spaces: 2 });
    await fs.writeJson(path.join(this.baseDir, 'edges.json'), this.edges, { spaces: 2 });
  }

  async getSummary(): Promise<string> {
    return `Graph Memory: ${this.nodes.length} nodes, ${this.edges.length} edges`;
  }
}
