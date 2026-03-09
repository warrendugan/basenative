#!/bin/bash

# Ralph Loop Integration Script
# Autonomous AI agent loop for iterative development in Labor Abstraction Ecosystem
# Reads PRD stories, runs Claude Code, verifies completion, updates learnings

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
AGENTS_FILE="$SCRIPT_DIR/AGENTS.md"
CLAUDE_FILE="$SCRIPT_DIR/CLAUDE.md"
LOG_FILE="$SCRIPT_DIR/.ralph-log"

MAX_ITERATIONS=5
ITERATION=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Validate required files exist
validate_files() {
    if [ ! -f "$PRD_FILE" ]; then
        error "prd.json not found at $PRD_FILE"
        exit 1
    fi

    if [ ! -f "$CLAUDE_FILE" ]; then
        error "CLAUDE.md not found at $CLAUDE_FILE"
        exit 1
    fi

    if [ ! -f "$AGENTS_FILE" ]; then
        warning "AGENTS.md not found, will create on first run"
    fi
}

# Get incomplete stories from prd.json
get_incomplete_stories() {
    jq -r '.stories[] | select(.status == "pending" or .status == "in_progress") | .id + "|" + .title' "$PRD_FILE"
}

# Count total and completed stories
count_stories() {
    local total=$(jq '.stories | length' "$PRD_FILE")
    local completed=$(jq '[.stories[] | select(.status == "completed")] | length' "$PRD_FILE")
    echo "$completed/$total"
}

# Extract story details from prd.json
get_story_details() {
    local story_id="$1"
    jq ".stories[] | select(.id == \"$story_id\")" "$PRD_FILE"
}

# Update story status in prd.json
update_story_status() {
    local story_id="$1"
    local new_status="$2"

    jq ".stories |= map(if .id == \"$story_id\" then .status = \"$new_status\" else . end)" "$PRD_FILE" > "$PRD_FILE.tmp"
    mv "$PRD_FILE.tmp" "$PRD_FILE"
}

# Verify story completion
verify_story() {
    local story_id="$1"
    local story_details=$(get_story_details "$story_id")

    log "Verifying story: $story_id"

    # Extract verification command if present
    local verify_cmd=$(echo "$story_details" | jq -r '.verificationCommand // empty')

    if [ -z "$verify_cmd" ]; then
        warning "No verification command for $story_id, marking as completed"
        return 0
    fi

    # Run verification command
    if eval "$verify_cmd" > /dev/null 2>&1; then
        success "Story $story_id verification passed"
        return 0
    else
        error "Story $story_id verification failed"
        return 1
    fi
}

# Append learning to AGENTS.md
add_learning() {
    local learning="$1"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')

    if [ ! -f "$AGENTS_FILE" ]; then
        cat > "$AGENTS_FILE" << 'EOF'
# AGENTS.md — Persistent Learnings

This file accumulates learnings and discovered patterns across Ralph loop iterations to prevent repeated mistakes and improve future runs.

## Core Architecture
- Nx 22.3.3 integrated monorepo
- Angular 21 with strict signals (no decorators for inputs/outputs)
- @if/@for/@switch control flow only
- Standalone components only, inject() function
- Cloudflare Workers with D1 + KV
- Multi-tenant architecture

## Laws of UX Enforcement
- Visibility of System Status
- Match between System and Real World
- User Control and Freedom
- Consistency and Standards
- Error Prevention and Recovery
- Recognition vs Recall
- Flexibility and Efficiency
- Aesthetic and Minimalist Design
- Error Messages Clear and Constructive
- Help and Documentation

## Learnings Log

EOF
    fi

    echo "### [$timestamp] Iteration $ITERATION" >> "$AGENTS_FILE"
    echo "$learning" >> "$AGENTS_FILE"
    echo "" >> "$AGENTS_FILE"
}

# Main loop
main() {
    log "Starting Ralph loop integration"
    log "Workspace: $SCRIPT_DIR"

    validate_files

    log "Current progress: $(count_stories)"

    while [ $ITERATION -lt $MAX_ITERATIONS ]; do
        ITERATION=$((ITERATION + 1))
        log "=== Iteration $ITERATION / $MAX_ITERATIONS ==="

        # Get incomplete stories
        incomplete=$(get_incomplete_stories)

        if [ -z "$incomplete" ]; then
            success "All stories completed!"
            exit 0
        fi

        # Process first incomplete story
        story_line=$(echo "$incomplete" | head -n 1)
        story_id=$(echo "$story_line" | cut -d'|' -f1)
        story_title=$(echo "$story_line" | cut -d'|' -f2)

        log "Processing story: $story_id - $story_title"
        update_story_status "$story_id" "in_progress"

        # Prepare context for Claude Code
        story_context=$(get_story_details "$story_id" | jq -c .)
        agents_context=$(cat "$AGENTS_FILE" 2>/dev/null || echo "No prior learnings")

        # Create temporary context file for Claude Code
        context_file="$SCRIPT_DIR/.ralph-context-$story_id.json"
        cat > "$context_file" << EOF
{
  "iteration": $ITERATION,
  "story": $story_context,
  "agentsFile": "$AGENTS_FILE",
  "claudeFile": "$CLAUDE_FILE",
  "workspaceRoot": "$SCRIPT_DIR"
}
EOF

        log "Context prepared in $context_file"
        log "Please run: claude-code --context $context_file"
        log "Press ENTER when the story implementation is complete..."
        read -r

        # Verify story completion
        if verify_story "$story_id"; then
            update_story_status "$story_id" "completed"
            success "Story $story_id marked as completed"
            add_learning "Story $story_id ($story_title) completed successfully"
        else
            warning "Story $story_id verification failed, moving to next iteration"
            update_story_status "$story_id" "pending"
            add_learning "Story $story_id ($story_title) verification failed at iteration $ITERATION"
        fi

        rm -f "$context_file"
        log "Progress: $(count_stories)"
        echo ""
    done

    error "Maximum iterations ($MAX_ITERATIONS) reached"
    log "Incomplete stories remain. Review AGENTS.md and prd.json for details."
    exit 1
}

# Run main
main
