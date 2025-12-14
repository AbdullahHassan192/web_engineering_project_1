# Tutoring Marketplace Startup Script
# This script helps you start the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tutoring Marketplace - Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($mongoService) {
    if ($mongoService.Status -eq 'Running') {
        Write-Host "✓ MongoDB service is running" -ForegroundColor Green
    } else {
        Write-Host "⚠ MongoDB service found but not running. Attempting to start..." -ForegroundColor Yellow
        try {
            Start-Service -Name "MongoDB" -ErrorAction Stop
            Write-Host "✓ MongoDB service started successfully" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to start MongoDB service. Please start it manually:" -ForegroundColor Red
            Write-Host "  net start MongoDB" -ForegroundColor Yellow
            Write-Host "  Or use MongoDB Atlas (cloud) instead" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠ MongoDB service not found. You have two options:" -ForegroundColor Yellow
    Write-Host "  1. Install MongoDB locally (see setup-mongodb.md)" -ForegroundColor Cyan
    Write-Host "  2. Use MongoDB Atlas (cloud) - Recommended for quick start" -ForegroundColor Cyan
    Write-Host "     Update MONGO_URI in .env file with your Atlas connection string" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend Server (Terminal 1):" -ForegroundColor Yellow
Write-Host "   cd server" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Frontend Client (Terminal 2):" -ForegroundColor Yellow
Write-Host "   cd client" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Open browser:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
















