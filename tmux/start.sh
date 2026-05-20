#!/bin/bash
# tmux HUD starter for oh-my-grok-build
# Usage: ./tmux/start.sh [session-name]

SESSION_NAME=${1:-grok-build}

# Check if session already exists
tmux has-session -t "$SESSION_NAME" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Session '$SESSION_NAME' already exists. Attaching..."
    tmux attach-session -t "$SESSION_NAME"
    exit 0
fi

echo "Creating new tmux session: $SESSION_NAME"

# Create new session with main pane
tmux new-session -d -s "$SESSION_NAME" -n main

# Set main window options
tmux set-option -t "$SESSION_NAME" status on
tmux set-option -t "$SESSION_NAME" status-interval 5
tmux set-option -t "$SESSION_NAME" status-left-length 50
tmux set-option -t "$SESSION_NAME" status-right-length 80

# Customize status bar (minimal style)
tmux set-option -t "$SESSION_NAME" status-left "#[fg=green,bold]Grok Build #[default]"
tmux set-option -t "$SESSION_NAME" status-right "#(~/.config/oh-my-grok-build/tmux/statusline.sh)"

# Set status bar colors
tmux set-option -t "$SESSION_NAME" status-bg colour235
tmux set-option -t "$SESSION_NAME" status-fg colour250

# Create main pane and run grok-build (placeholder)
tmux send-keys -t "$SESSION_NAME":main 'echo "Grok Build Main Session"' C-m
tmux send-keys -t "$SESSION_NAME":main 'grok-build || echo "Run your grok-build command here"' C-m

# Attach to session
tmux attach-session -t "$SESSION_NAME"
