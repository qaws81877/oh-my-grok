import { Command } from 'commander';
import chalk from 'chalk';
import { Orchestrator } from './core/orchestrator';
import { OrchestratorV3 } from './core/orchestrator-v3';
import { SkillEngine } from './core/skill-engine';
import { StateManager } from './core/state-manager';
import { CommandRouter } from './core/command-router';

const program = new Command();

console.log(chalk.blue.bold('\n🚀 oh-my-grok-build v0.1.0 - Grok Build 전용 ACP Orchestration Harness\n'));

program
  .name('oh-my-grok-build')
  .description('High-quality orchestration harness for Grok Build CLI (SuperGrok Heavy)')
  .version('0.1.0');

program
  .command('setup')
  .description('Initialize .sgb/ directory and install default skills')
  .action(async () => {
    const state = new StateManager();
    await state.initialize();
    console.log(chalk.green('✅ .sgb/ 디렉토리 및 기본 설정 완료'));
    console.log(chalk.gray('   이제 Grok Build에서 #team, #ralph 등의 명령어를 사용할 수 있습니다.'));
  });

program
  .command('start')
  .description('Start the orchestration engine (for ACP connection)')
  .action(async () => {
    const orchestrator = new Orchestrator();
    await orchestrator.start();
  });

program
  .command('start-v3')
  .description('Start GrokForge Orchestrator v3 (Evidence Gates + Graph Memory + DAG)')
  .action(async () => {
    const orchestrator = new OrchestratorV3();
    await orchestrator.start();
  });

program.parse(process.argv);

// Default: show help if no command
if (!process.argv.slice(2).length) {
  program.help();
}
