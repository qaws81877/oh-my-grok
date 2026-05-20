#!/bin/bash
# Minimal statusline for oh-my-grok-build tmux HUD
# This script is called by tmux status-right every few seconds

STATUS_DIR="$HOME/.sgb/tmux"
mkdir -p "$STATUS_DIR"

# Read status from files (orchestrator will write these)
AGENTS_FILE="$STATUS_DIR/agents.txt"
USAGE_FILE="$STATUS_DIR/usage.txt"
WARNINGS_FILE="$STATUS_DIR/warnings.txt"
WORKTREES_FILE="$STATUS_DIR/worktrees.txt"
SESSION_START_FILE="$STATUS_DIR/session_start.txt"

# Default values
AGENTS="~ 0 agents"
USAGE="SuperGrok Usage N/A"
WARNINGS=""
WORKTREES=""
ELAPSED=""

# Read active agents
if [ -f "$AGENTS_FILE" ]; then
    AGENTS=$(cat "$AGENTS_FILE")
fi

# Read usage
if [ -f "$USAGE_FILE" ]; then
    USAGE=$(cat "$USAGE_FILE")
fi

# Read warnings
if [ -f "$WARNINGS_FILE" ]; then
    WARNINGS=$(cat "$WARNINGS_FILE")
fi

# Read worktrees
if [ -f "$WORKTREES_FILE" ]; then
    WORKTREES=$(cat "$WORKTREES_FILE")
fi

# Calculate session elapsed time
if [ -f "$SESSION_START_FILE" ]; then
    START_TIME=$(cat "$SESSION_START_FILE")
    CURRENT_TIME=$(date +%s)
    ELAPSED_SEC=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED_SEC -lt 60 ]; then
        ELAPSED="${ELAPSED_SEC}s"
    elif [ $ELAPSED_SEC -lt 3600 ]; then
        ELAPSED="$((ELAPSED_SEC / 60))m"
    else
        ELAPSED="$((ELAPSED_SEC / 3600))h $(( (ELAPSED_SEC % 3600) / 60 ))m"
    fi
else
    ELAPSED="N/A"
fi

# Build status line
STATUS=""

# Active agents
STATUS+="#[fg=green]$AGENTS#[default]  "

# Worktrees (if any)
if [ -n "$WORKTREES" ]; then
    STATUS+="#[fg=green]$WORKTREES#[default]  "
fi

# Model (hardcoded for now, can be dynamic later)
STATUS+="#[fg=cyan]Grok-4 Heavy#[default]  "

# Usage
STATUS+="#[fg=yellow]$USAGE#[default]  "

# Session time
STATUS+="#[fg=blue]Session: $ELAPSED#[default]"

# Warnings (only show if exists)
if [ -n "$WARNINGS" ]; then
    STATUS+="  #[fg=yellow]$WARNINGS#[default]"
fi

echo -e "$STATUS"
