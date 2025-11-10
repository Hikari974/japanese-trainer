#!/usr/bin/env bash
# ==============================================================================
# Template Synchronization Script
# ==============================================================================
#
# Synchronizes .claude/core/ from claude-code-template to current project.
# Alternative to Template Sync Agent for batch updates and CI/CD.
#
# Usage:
#   ./claude/scripts/sync-template.sh           # Interactive mode
#   ./.claude/scripts/sync-template.sh --auto   # Auto mode (safe files only)
#
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Mode
AUTO_MODE=false
if [[ "$1" == "--auto" ]]; then
    AUTO_MODE=true
fi

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/.claude/.template-config.yml"

# Check config exists
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${RED}Error: .template-config.yml not found${NC}"
    echo "Expected at: $CONFIG_FILE"
    exit 1
fi

# Read template source from config (basic YAML parsing)
TEMPLATE_SOURCE=$(grep "source:" "$CONFIG_FILE" | sed 's/.*source: *"\(.*\)".*/\1/' | sed 's/{{TEMPLATE_PATH}}//')

# If template source is empty or placeholder, ask user
if [[ -z "$TEMPLATE_SOURCE" ]] || [[ "$TEMPLATE_SOURCE" == "" ]]; then
    echo -e "${YELLOW}Template source not configured in .template-config.yml${NC}"
    echo -n "Enter path to claude-code-template/.claude/core: "
    read TEMPLATE_SOURCE
fi

# Verify template source exists
if [[ ! -d "$TEMPLATE_SOURCE" ]]; then
    echo -e "${RED}Error: Template source not found: $TEMPLATE_SOURCE${NC}"
    exit 1
fi

PROJECT_CORE="$PROJECT_ROOT/.claude/core"

echo -e "${BLUE}=== Template Sync ===${NC}"
echo "Template source: $TEMPLATE_SOURCE"
echo "Project core: $PROJECT_CORE"
echo ""

# Counters
NEW_FILES=0
MODIFIED_FILES=0
SKIPPED_FILES=0

# Find all files in template
cd "$TEMPLATE_SOURCE"
TEMPLATE_FILES=$(find . -type f -name "*.md" -o -name "*.yml" -o -name "VERSION" | sed 's|^\./||')

for FILE in $TEMPLATE_FILES; do
    TEMPLATE_FILE="$TEMPLATE_SOURCE/$FILE"
    PROJECT_FILE="$PROJECT_CORE/$FILE"

    # Check if file exists in project
    if [[ ! -f "$PROJECT_FILE" ]]; then
        # NEW FILE
        echo -e "${GREEN}[NEW]${NC} $FILE"
        NEW_FILES=$((NEW_FILES + 1))

        if [[ "$AUTO_MODE" == true ]]; then
            # Auto mode: copy if in auto_sync list
            if echo "$FILE" | grep -qE "(agents/.*\.md|templates/|rules/.*\.yml)"; then
                mkdir -p "$(dirname "$PROJECT_FILE")"
                cp "$TEMPLATE_FILE" "$PROJECT_FILE"
                echo "  → Copied (auto)"
            else
                echo "  → Skipped (requires manual review)"
                SKIPPED_FILES=$((SKIPPED_FILES + 1))
            fi
        else
            # Interactive mode: ask user
            echo -n "  Copy this file? (y/n): "
            read -r RESPONSE
            if [[ "$RESPONSE" =~ ^[Yy]$ ]]; then
                mkdir -p "$(dirname "$PROJECT_FILE")"
                cp "$TEMPLATE_FILE" "$PROJECT_FILE"
                echo "  → Copied"
            else
                echo "  → Skipped"
                SKIPPED_FILES=$((SKIPPED_FILES + 1))
            fi
        fi
    else
        # File exists - check if modified
        if ! cmp -s "$TEMPLATE_FILE" "$PROJECT_FILE"; then
            # MODIFIED FILE
            echo -e "${YELLOW}[MODIFIED]${NC} $FILE"
            MODIFIED_FILES=$((MODIFIED_FILES + 1))

            if [[ "$AUTO_MODE" == true ]]; then
                echo "  → Skipped (manual review required)"
                SKIPPED_FILES=$((SKIPPED_FILES + 1))
            else
                # Show diff summary
                ADDED=$(diff -u "$PROJECT_FILE" "$TEMPLATE_FILE" | grep -c "^+" || true)
                REMOVED=$(diff -u "$PROJECT_FILE" "$TEMPLATE_FILE" | grep -c "^-" || true)
                echo "  Changes: +$ADDED lines, -$REMOVED lines"

                echo -n "  Show diff? (y/n): "
                read -r RESPONSE
                if [[ "$RESPONSE" =~ ^[Yy]$ ]]; then
                    diff -u "$PROJECT_FILE" "$TEMPLATE_FILE" || true
                fi

                echo -n "  Apply template version? (y/n): "
                read -r RESPONSE
                if [[ "$RESPONSE" =~ ^[Yy]$ ]]; then
                    cp "$TEMPLATE_FILE" "$PROJECT_FILE"
                    echo "  → Updated"
                else
                    echo "  → Kept local version"
                    SKIPPED_FILES=$((SKIPPED_FILES + 1))
                fi
            fi
        fi
    fi
done

echo ""
echo -e "${BLUE}=== Summary ===${NC}"
echo "New files: $NEW_FILES"
echo "Modified files: $MODIFIED_FILES"
echo "Skipped files: $SKIPPED_FILES"

if [[ "$AUTO_MODE" == true ]]; then
    echo ""
    echo -e "${YELLOW}Auto mode: Only safe files were synced${NC}"
    echo "Run without --auto for full interactive sync"
fi

echo ""
echo -e "${GREEN}Sync complete!${NC}"
