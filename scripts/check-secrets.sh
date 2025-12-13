#!/bin/bash
# Script to check for secrets in the codebase
# Usage: ./scripts/check-secrets.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Scanning codebase for potential secrets..."

# Common secret patterns
PATTERNS=(
    "password\s*[=:]\s*['\"][^'\"]+['\"]"
    "secret\s*[=:]\s*['\"][^'\"]+['\"]"
    "api[_-]?key\s*[=:]\s*['\"][^'\"]+['\"]"
    "mongodb\+srv://[^'\s\"<>]+"
    "GOCSPX-[A-Za-z0-9_-]+"
    "sk-[a-zA-Z0-9]{32,}"
    "AKIA[0-9A-Z]{16}"
    "Bearer\s+[A-Za-z0-9_-]{20,}"
)

EXCLUDE_PATTERNS=(
    "node_modules"
    ".git"
    "venv"
    "env.example"
    ".env.example"
    "SECURITY.md"
    "SECURITY_ALERT.md"
    "CLEANUP_REPORT.md"
)

FOUND_ISSUES=0

# Find all text files
FILES=$(find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.yml" -o -name "*.yaml" -o -name "*.json" -o -name "*.md" -o -name "*.env" -o -name "*.sh" \) 2>/dev/null)

for FILE in $FILES; do
    # Skip excluded paths
    SKIP=0
    for EXCLUDE in "${EXCLUDE_PATTERNS[@]}"; do
        if [[ "$FILE" == *"$EXCLUDE"* ]]; then
            SKIP=1
            break
        fi
    done
    [ $SKIP -eq 1 ] && continue
    
    # Check each pattern
    for PATTERN in "${PATTERNS[@]}"; do
        if grep -qiE "$PATTERN" "$FILE" 2>/dev/null; then
            # Check if it's in a comment or example
            MATCHES=$(grep -inE "$PATTERN" "$FILE" 2>/dev/null)
            while IFS= read -r LINE; do
                # Skip if it's clearly a placeholder/example
                if echo "$LINE" | grep -qiE "(example|placeholder|your-|your_|username|password|secret)"; then
                    continue
                fi
                echo -e "${RED}⚠️  Potential secret found in: $FILE${NC}"
                echo -e "${YELLOW}   $LINE${NC}"
                FOUND_ISSUES=1
            done <<< "$MATCHES"
        fi
    done
done

echo ""
if [ $FOUND_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ No obvious secrets found${NC}"
    exit 0
else
    echo -e "${RED}❌ Potential secrets detected!${NC}"
    echo -e "${YELLOW}Please review and move secrets to environment variables.${NC}"
    exit 1
fi

