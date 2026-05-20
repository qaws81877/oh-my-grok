#!/bin/bash
#
# OMG (Oh My Grok) - One-line Installer
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Yeezi/oh-my-grok-build/main/install.sh | bash
#

set -e

echo "🚀 OMG (Oh My Grok) 설치 시작..."

# 1. 레포 클론 또는 업데이트
if [ -d "oh-my-grok-build" ]; then
    echo "📁 기존 디렉토리 발견. 업데이트 중..."
    cd oh-my-grok-build
    git pull
else
    echo "📥 레포지토리 클론 중..."
    git clone https://github.com/Yeezi/oh-my-grok-build.git
    cd oh-my-grok-build
fi

# 2. npm 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 3. bin/omg를 ~/.local/bin에 설치
echo "🔧 omg 명령어 설치 중..."
mkdir -p "$HOME/.local/bin"
cp bin/omg "$HOME/.local/bin/omg"
chmod +x "$HOME/.local/bin/omg"

# 4. PATH 등록 (zshrc / bashrc)
SHELL_RC="$HOME/.zshrc"
if [ -f "$HOME/.bashrc" ] && [ ! -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.bashrc"
fi

if ! grep -q '.local/bin' "$SHELL_RC" 2>/dev/null; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    echo "✅ PATH에 ~/.local/bin 등록 완료"
fi

# 5. 초기 설정 실행
echo "⚙️  초기 설정 실행 중..."
"$HOME/.local/bin/omg" setup

echo ""
echo "✅ OMG 설치 완료!"
echo ""
echo "사용법:"
echo "  omg              # 네이티브 Grok Build"
echo "  omg madmax       # 하네스 + tmux HUD"
echo "  omg setup        # 설정 다시 실행"
echo "  omg doctor       # 환경 점검"
echo ""
echo "새 터미널을 열거나 'source $SHELL_RC' 를 실행하세요."
