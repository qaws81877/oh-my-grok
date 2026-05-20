#!/usr/bin/env node
/**
 * Mock Grok Build CLI for testing ACP stdio transport
 * 
 * Usage:
 *   node test/mock-grok-build.ts
 */

import readline from 'readline';

console.log('[Mock Grok Build] Starting in ACP mode...');

// stdin에서 명령어 받기
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let agentCounter = 0;
const activeAgents = new Map();

function sendMessage(type: string, payload: any) {
  const message = {
    id: `mock-${Date.now()}`,
    type,
    timestamp: Date.now(),
    payload
  };
  process.stdout.write(JSON.stringify(message) + '\n');
}

// 초기 handshake 응답
setTimeout(() => {
  sendMessage('handshake', { status: 'ok', version: 'mock-1.0' });
}, 100);

// 주기적으로 가짜 에이전트 생성 (테스트용)
setInterval(() => {
  if (Math.random() > 0.7 && activeAgents.size < 5) {
    const agentId = `sub-mock-${++agentCounter}`;
    const worktree = `executor-${Date.now()}`;
    
    activeAgents.set(agentId, { status: 'RUNNING', worktree });
    
    sendMessage('agent:spawned', {
      id: agentId,
      role: Math.random() > 0.5 ? 'executor' : 'verifier',
      worktree,
      startedAt: Date.now()
    });
  }
}, 3000);

// 주기적으로 상태 변경 (테스트용)
setInterval(() => {
  if (activeAgents.size > 0) {
    const entries = Array.from(activeAgents.entries());
    const [id, data] = entries[Math.floor(Math.random() * entries.length)];
    
    if (data.status === 'RUNNING' && Math.random() > 0.6) {
      const newStatus = Math.random() > 0.5 ? 'COMPLETED' : 'FAILED';
      data.status = newStatus;
      
      sendMessage('agent:status-changed', {
        id,
        status: newStatus,
        completedAt: Date.now()
      });
      
      if (newStatus !== 'RUNNING') {
        activeAgents.delete(id);
      }
    }
  }
}, 4000);

// 사용량 시뮬레이션
let usage = 45;
setInterval(() => {
  usage = Math.min(95, usage + Math.floor(Math.random() * 5));
  sendMessage('usage:updated', { percent: usage, remaining: 2000 - Math.floor(usage * 20) });
}, 8000);

// 명령어 처리
rl.on('line', (line) => {
  try {
    const msg = JSON.parse(line.trim());
    console.error(`[Mock] Received command: ${msg.type}`);
    
    if (msg.type === 'command') {
      // 간단한 응답
      sendMessage('command:result', {
        command: msg.payload.command,
        result: `Executed: ${msg.payload.command}`,
        success: true
      });
    }
  } catch (e) {
    // 무시
  }
});

console.log('[Mock Grok Build] Ready. Waiting for ACP messages...');
