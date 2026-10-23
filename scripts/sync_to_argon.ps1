# Script to mirror the current project to E:\personal\zanjirzan_full_project_v2 for Gemini Argon upload
$Source = "e:\personal\philosophy_zanjirzan_app"
$Dest = "E:\personal\zanjirzan_full_project_v2"

if (!(Test-Path $Dest)) {
    New-Item -ItemType Directory -Path $Dest -Force | Out-Null
}

Write-Host "Syncing to $Dest..." -ForegroundColor Cyan
robocopy $Source $Dest /MIR /XD node_modules .next .venv .git __pycache__ .pytest_cache /XF *.pyc *.log /NP
if ($LASTEXITCODE -le 7) {
    Write-Host "Sync successful! Clean code ready for Gemini Argon." -ForegroundColor Green
    exit 0
} else {
    Write-Host "Sync failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
