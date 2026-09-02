# post-pull.ps1 - Automated Post-Pull Build Setup
# Run after: git pull
# Usage: .\post-pull.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  POST-PULL BUILD SETUP AUTOMATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check git status
Write-Host "🔍 Checking changes from last commit..." -ForegroundColor Yellow
$changedFiles = git diff HEAD~1 --name-only 2>$null

if ($null -eq $changedFiles) {
    Write-Host "⚠️  No previous commit found. Running full setup." -ForegroundColor Yellow
    $changedFiles = @()
} else {
    Write-Host "Changed files:" -ForegroundColor Gray
    $changedFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
}

# Check if frontend dependencies need update
$packageChanged = $changedFiles | Where-Object { $_ -match "package\.json|package-lock\.json" }
if ($packageChanged) {
    Write-Host "`n📦 package.json changed - Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend install failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "`n✓ No frontend dependency changes" -ForegroundColor Green
}

# Check if backend dependencies need update
$pomChanged = $changedFiles | Where-Object { $_ -match "pom\.xml" }
if ($pomChanged) {
    Write-Host "`n⚙️  pom.xml changed - Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    .\mvnw.cmd clean install -DskipTests -q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend install failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ No backend dependency changes" -ForegroundColor Green
}

# Check for new database migrations
$migrationFiles = $changedFiles | Where-Object { $_ -match "db/migration/V\d+" }
if ($migrationFiles) {
    Write-Host "`n🗄️  New database migrations detected:" -ForegroundColor Yellow
    $migrationFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host "⚠️  Migrations will run automatically on backend startup" -ForegroundColor Cyan
}

# Verify TypeScript compilation
Write-Host "`n✅ Verifying TypeScript compilation..." -ForegroundColor Cyan
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript check failed!" -ForegroundColor Red
    exit 1
}

# Verify Java compilation
Write-Host "`n✅ Verifying Java compilation..." -ForegroundColor Cyan
Push-Location backend
.\mvnw.cmd compile -q
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Java compilation failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ POST-PULL SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Frontend: npm run dev" -ForegroundColor Gray
Write-Host "  2. Backend:  cd backend && .\mvnw.cmd spring-boot:run" -ForegroundColor Gray
Write-Host "  3. Open:     http://localhost:3000" -ForegroundColor Gray
Write-Host "`n"
