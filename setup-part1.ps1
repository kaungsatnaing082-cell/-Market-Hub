Write-Host "Krest Center Part 1 setup" -ForegroundColor Cyan

if (!(Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Edit .env and set your MySQL password."
Write-Host "2. Run database/schema.sql and database/seed.sql in MySQL Workbench."
Write-Host "3. npm install"
Write-Host "4. npm run seed:admin"
Write-Host "5. npm run dev"
Write-Host "6. Open http://localhost:5000"
