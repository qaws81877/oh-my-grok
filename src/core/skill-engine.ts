import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export interface Skill {
  name: string;
  description: string;
  triggers: string[];
  content: string;
}

export class SkillEngine {
  private skillsDir = path.join(process.cwd(), '.sgb', 'skills');
  private skills: Map<string, Skill> = new Map();

  async loadSkills(): Promise<void> {
    if (!await fs.pathExists(this.skillsDir)) {
      console.warn('No .sgb/skills directory found. Run "oh-my-grok-build setup" first.');
      return;
    }

    const files = await fs.readdir(this.skillsDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(this.skillsDir, file);
        const raw = await fs.readFile(filePath, 'utf-8');
        
        // Simple frontmatter parser for Phase 1
        const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        let data: any = {};
        let content = raw;

        if (frontmatterMatch) {
          const yaml = frontmatterMatch[1];
          content = frontmatterMatch[2].trim();
          
          // Very basic YAML parsing for name, description, triggers
          data.name = (yaml.match(/name:\s*(.+)/) || [])[1]?.trim().replace(/['"]/g, '');
          data.description = (yaml.match(/description:\s*(.+)/) || [])[1]?.trim().replace(/['"]/g, '');
          const triggersMatch = yaml.match(/triggers:\s*\[(.*?)\]/);
          if (triggersMatch) {
            data.triggers = triggersMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
          }
        }

        const skill: Skill = {
          name: data.name || file.replace('.md', ''),
          description: data.description || '',
          triggers: data.triggers || [],
          content: content.trim()
        };

        this.skills.set(skill.name.toLowerCase(), skill);
      }
    }

    console.log(chalk.green(`✅ Loaded ${this.skills.size} skills`));
  }

  getSkill(name: string): Skill | undefined {
    return this.skills.get(name.toLowerCase());
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  findByTrigger(trigger: string): Skill | undefined {
    for (const skill of this.skills.values()) {
      if (skill.triggers.some(t => t.toLowerCase() === trigger.toLowerCase())) {
        return skill;
      }
    }
    return undefined;
  }
}
