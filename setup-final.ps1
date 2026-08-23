Write-Host "Krest Center - Final Integrated Setup" -ForegroundColor Cyan
Write-Host ""
if (!(Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env. Edit DB_PASSWORD and JWT_SECRET before continuing." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "EXISTING PART 3 DATABASE:" -ForegroundColor Green
Write-Host "Keep your existing krest_center_db. Run database/migrations/008_final_auth_integration.sql, then database/migrations/009_product_variants.sql once."
Write-Host "Run: npm install"
Write-Host "Run: npm run audit"
Write-Host "Run: npm run dev"
Write-Host ""
Write-Host "FRESH DATABASE:" -ForegroundColor Green
Write-Host "1. Run database/schema.sql in MySQL Workbench"
Write-Host "2. Run database/seed.sql"
Write-Host "3. npm install"
Write-Host "4. npm run seed:admin"
Write-Host "5. npm run seed:seller"
Write-Host "6. npm run seed:buyer"
Write-Host "7. npm run audit"
Write-Host "8. npm run dev"
Write-Host ""
Write-Host "Open http://localhost:5000"
