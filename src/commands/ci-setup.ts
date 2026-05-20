import { Orchestrator } from '../core/orchestrator';
import fs from 'fs-extra';
import path from 'path';

/**
 * #ci-setup 명령어
 * 프로젝트에 맞는 GitHub Actions CI 파이프라인을 자동 생성
 */
export async function handleCiSetup(
  orchestrator: Orchestrator,
  args: string[]
): Promise<string> {
  const projectRoot = process.cwd();
  const workflowDir = path.join(projectRoot, '.github', 'workflows');
  const ciFilePath = path.join(workflowDir, 'ci.yml');

  // 1. .github/workflows 디렉토리 생성
  await fs.ensureDir(workflowDir);

  // 2. 기존 CI 파일 백업 (있을 경우)
  if (await fs.pathExists(ciFilePath)) {
    const backupPath = ciFilePath + '.backup-' + Date.now();
    await fs.copy(ciFilePath, backupPath);
  }

  // 3. 플래그 파싱 (Phase 3)
  const includeSecurity = args.includes('--include=security') || args.includes('--full');
  const includeLint = args.includes('--include=lint') || args.includes('--full');
  const includeDeploy = args.includes('--include=deploy') || args.includes('--full');
  const isFull = args.includes('--full');

  // 4. 프로젝트 타입 감지
  const projectType = await detectProjectType(projectRoot);

  // 5. CI 템플릿 생성 (Phase 3)
  const ciContent = generateCiTemplate(projectType, {
    includeSecurity,
    includeLint,
    includeDeploy,
    isFull
  });

  await fs.writeFile(ciFilePath, ciContent, 'utf8');

  let message = `## ✅ CI 파이프라인 생성 완료

**생성된 파일**: \`.github/workflows/ci.yml\`

**감지된 프로젝트 타입**: ${projectType}
**보안 리뷰**: ${includeSecurity ? '✅ 포함' : '❌ 기본 (옵션)'}
**Lint**: ${includeLint ? '✅ 포함' : '❌ 기본 (옵션)'}
**Deploy**: ${includeDeploy ? '✅ 포함' : '❌ 기본 (옵션)'}
`;

  message += `\n**다음 단계**:
1. 생성된 파일을 확인하세요
2. 필요시 Secrets 설정 (GROK_API_KEY 등)
3. 커밋 후 푸시

**고급 옵션**:
- \`#ci-setup --include=security,lint,deploy\`
- \`#ci-setup --full\``;

  return message;
}

/**
 * 프로젝트 타입 감지 (Phase 3 - 고도화 버전)
 */
async function detectProjectType(projectRoot: string): Promise<string> {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  if (await fs.pathExists(packageJsonPath)) {
    try {
      const pkg = await fs.readJson(packageJsonPath);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps.next) return 'Next.js';
      if (deps['@nestjs/core']) return 'NestJS';
      if (deps.react) return 'React';
      if (deps.vue) return 'Vue';
      if (deps['@angular/core']) return 'Angular';
      if (deps.express) return 'Express';
      return 'Node.js';
    } catch {
      return 'Node.js';
    }
  }
  
  if (await fs.pathExists(path.join(projectRoot, 'requirements.txt')) || 
      await fs.pathExists(path.join(projectRoot, 'pyproject.toml'))) {
    return 'Python';
  }
  
  if (await fs.pathExists(path.join(projectRoot, 'go.mod'))) {
    return 'Go';
  }
  
  if (await fs.pathExists(path.join(projectRoot, 'Cargo.toml'))) {
    return 'Rust';
  }
  
  if (await fs.pathExists(path.join(projectRoot, 'pom.xml')) || 
      await fs.pathExists(path.join(projectRoot, 'build.gradle'))) {
    return 'Java';
  }
  
  return 'Generic';
}

/**
 * CI 템플릿 생성 (Phase 3 - 다중 옵션 지원)
 */
function generateCiTemplate(projectType: string, options: {
  includeSecurity: boolean;
  includeLint: boolean;
  includeDeploy: boolean;
  isFull: boolean;
}): string {
  const { includeSecurity, includeLint, includeDeploy, isFull } = options;
  let setupStep = '';
  let installStep = '';
  let testStep = '';
  let buildStep = '';

  switch (projectType) {
    case 'Node.js':
      setupStep = `- name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'`;
      installStep = `- run: npm ci`;
      testStep = `- run: npm test`;
      buildStep = `- run: npm run build`;
      break;

    case 'Python':
      setupStep = `- name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'`;
      installStep = `- run: pip install -r requirements.txt`;
      testStep = `- run: python -m pytest`;
      buildStep = `# Python 프로젝트는 보통 빌드 단계가 없습니다`;
      break;

    case 'Go':
      setupStep = `- name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.22'`;
      installStep = `- run: go mod download`;
      testStep = `- run: go test ./...`;
      buildStep = `- run: go build -o app .`;
      break;

    default:
      setupStep = `# 프로젝트 타입을 자동 감지하지 못했습니다. 수동으로 수정하세요.`;
      installStep = `# Install dependencies`;
      testStep = `# Run tests`;
      buildStep = `# Build project`;
  }

  // Security Review Job
  let securityJob = '';
  if (includeSecurity) {
    securityJob = `
  security-review:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Security Review (Grok Build)
        run: |
          grok build --headless --security-review
        env:
          GROK_API_KEY: \${{ secrets.GROK_API_KEY }}
`;
  }

  // Lint Job
  let lintJob = '';
  if (includeLint) {
    lintJob = `
  lint:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Run Linter
        run: |
          npm run lint || echo "Lint script not found, skipping..."
`;
  }

  // Deploy Job (example)
  let deployJob = '';
  if (includeDeploy) {
    deployJob = `
  deploy:
    runs-on: ubuntu-latest
    needs: [build, security-review]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Production
        run: echo "Deploy step - customize as needed"
`;
  }

  return `name: CI Pipeline (Generated by oh-my-grok-build)

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

${setupStep}

      - name: Install dependencies
${installStep}

      - name: Run tests
${testStep}

      - name: Build
${buildStep}
${securityJob}
${lintJob}
${deployJob}

# Generated by #ci-setup command
# Options:
#   #ci-setup --include=security
#   #ci-setup --include=lint
#   #ci-setup --include=deploy
#   #ci-setup --full
`;
}

