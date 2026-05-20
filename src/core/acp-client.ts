import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';
import readline from 'readline';

export interface ACPMessage {
  id: string;
  type: string;
  timestamp: number;
  payload: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ACPClient extends EventEmitter {
  private childProcess?: ChildProcess;
  private rl?: readline.Interface;
  private connected = false;
  private messageIdCounter = 0;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isReconnecting = false;

  /**
   * stdio transport로 Grok Build CLI와 연결
   * (현재는 시뮬레이션 모드 지원)
   */
  async connect(options: {
    command?: string;
    args?: string[];
    simulation?: boolean;
  } = {}): Promise<void> {
    const { 
      command = 'grok', 
      args = ['build', '--headless'], 
      simulation = false 
    } = options;

    if (simulation) {
      console.log('[ACP] 시뮬레이션 모드로 실행합니다.');
      this.connected = true;
      this.emit('connected', { simulation: true });
      return;
    }

    console.log(`[ACP] 실제 Grok Build CLI 연결 시도 중... (${command} ${args.join(' ')})`);

    try {
      // 실제 Grok Build CLI 프로세스 실행 (stdio)
      this.childProcess = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

    this.rl = readline.createInterface({
      input: this.childProcess.stdout!,
      crlfDelay: Infinity
    });

    this.rl.on('line', (line) => {
      try {
        const message: ACPMessage = JSON.parse(line);
        this.emit('message', message);
        this.emit(message.type, message.payload);
      } catch (err) {
        console.error('[ACP] Invalid JSON received:', line);
      }
    });

    this.childProcess.stderr?.on('data', (data) => {
      console.error('[ACP] stderr:', data.toString());
    });

    this.childProcess.on('close', (code) => {
      this.connected = false;
      this.emit('disconnected', { code });
    });

    this.childProcess.on('error', (err) => {
      console.error('[ACP] Grok Build CLI 실행 실패:', err.message);
      console.log('[ACP] 시뮬레이션 모드로 전환합니다.');
      this.connected = true;
      this.emit('connected', { simulation: true, fallback: true });
    });

    this.connected = true;
    this.emit('connected', { pid: this.childProcess?.pid });
  }

  /**
   * 메시지 전송 (stdio)
   */
  send(message: Partial<ACPMessage>): void {
    if (!this.connected) {
      throw new Error('ACP not connected');
    }

    const fullMessage: ACPMessage = {
      id: `msg-${Date.now()}-${this.messageIdCounter++}`,
      timestamp: Date.now(),
      ...message
    } as ACPMessage;

    const jsonLine = JSON.stringify(fullMessage) + '\n';

    if (this.childProcess?.stdin) {
      this.childProcess.stdin.write(jsonLine);
    } else {
      // 시뮬레이션 모드
      console.log('[ACP] Sent (sim):', fullMessage);
      // 시뮬레이션 응답 (개발용)
      setTimeout(() => {
        this.emit('message', {
          id: fullMessage.id,
          type: 'command:result',
          timestamp: Date.now(),
          payload: { success: true, echo: fullMessage }
        });
      }, 50);
    }
  }

  disconnect(): void {
    if (this.childProcess) {
      this.childProcess.kill();
    }
    if (this.rl) {
      this.rl.close();
    }
    this.connected = false;
    this.emit('disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 간단한 재연결 (기본 구현)
   */
  async reconnect(): Promise<void> {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    this.disconnect();
    this.reconnectAttempts++;

    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      console.error('[ACP] 최대 재연결 횟수 초과');
      this.isReconnecting = false;
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[ACP] ${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    await new Promise(resolve => setTimeout(resolve, delay));
    await this.connect({ simulation: true });
    this.isReconnecting = false;
  }
}
