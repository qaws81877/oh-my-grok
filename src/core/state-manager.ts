import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class StateManager {
  private baseDir = path.join(process.cwd(), '.sgb');

  async initialize(): Promise<void> {
    await fs.ensureDir(this.baseDir);
    await fs.ensureDir(path.join(this.baseDir, 'state'));
    await fs.ensureDir(path.join(this.baseDir, 'sessions'));
    await fs.ensureDir(path.join(this.baseDir, 'skills'));

    // Copy default skills if not exist
    const skillsSrc = path.join(__dirname, '../../skills');
    if (await fs.pathExists(skillsSrc)) {
      await fs.copy(skillsSrc, path.join(this.baseDir, 'skills'), { overwrite: false });
    }

    console.log(chalk.gray(`   .sgb/ initialized at ${this.baseDir}`));
  }

  async getState(key: string): Promise<any> {
    const file = path.join(this.baseDir, 'state', `${key}.json`);
    if (await fs.pathExists(file)) {
      return fs.readJson(file);
    }
    return null;
  }

  async setState(key: string, value: any): Promise<void> {
    const file = path.join(this.baseDir, 'state', `${key}.json`);
    await fs.writeJson(file, value, { spaces: 2 });
  }
}
