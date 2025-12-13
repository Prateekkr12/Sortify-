# PowerShell script to check for secrets in the codebase
# Usage: .\scripts\check-secrets.ps1

Write-Host "🔍 Scanning codebase for potential secrets..." -ForegroundColor Cyan

# Common secret patterns
$patterns = @(
    "password\s*[=:]\s*['`"][^'`"]+['`"]",
    "secret\s*[=:]\s*['`"][^'`"]+['`"]",
    "api[_-]?key\s*[=:]\s*['`"][^'`"]+['`"]",
    "mongodb\+srv://[^'\s`"<>]+",
    "GOCSPX-[A-Za-z0-9_-]+",
    "sk-[a-zA-Z0-9]{32,}",
    "AKIA[0-9A-Z]{16}"
)

$excludePatterns = @(
    "node_modules",
    ".git",
    "venv",
    "env.example",
    ".env.example",
    "SECURITY.md",
    "SECURITY_ALERT.md",
    "CLEANUP_REPORT.md"
)

$foundIssues = 0

# Find all text files
$files = Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx,*.py,*.yml,*.yaml,*.json,*.md,*.env,*.sh | 
    Where-Object { $_.FullName -notmatch "node_modules|\.git|venv" }

foreach ($file in $files) {
    # Skip excluded paths
    $skip = $false
    foreach ($exclude in $excludePatterns) {
        if ($file.FullName -match [regex]::Escape($exclude)) {
            $skip = $true
            break
        }
    }
    if ($skip) { continue }
    
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Check each pattern
    foreach ($pattern in $patterns) {
        if ($content -match $pattern -and $content -notmatch "(example|placeholder|your-|your_|username|password|secret)") {
            Write-Host "⚠️  Potential secret found in: $($file.FullName)" -ForegroundColor Yellow
            $foundIssues = 1
        }
    }
}

Write-Host ""
if ($foundIssues -eq 0) {
    Write-Host "✅ No obvious secrets found" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Potential secrets detected!" -ForegroundColor Red
    Write-Host "Please review and move secrets to environment variables." -ForegroundColor Yellow
    exit 1
}

