# ============================================================
#  ONE-TIME SETUP: database banata hai + .env mein password daalta hai
# ============================================================
#  Neeche apna asli PostgreSQL password likho (jo aapne PostgreSQL
#  install karte waqt 'postgres' user ke liye set kiya tha).
# ------------------------------------------------------------

$PGPASSWORD_VALUE = "YAHAN_APNA_PASSWORD_LIKHO"

# ------------------------------------------------------------
if ($PGPASSWORD_VALUE -eq "YAHAN_APNA_PASSWORD_LIKHO") {
    Write-Host "RUKO: Pehle is file ki line 9 me apna asli password likho, phir dobara chalao." -ForegroundColor Red
    exit 1
}

$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$env:PGPASSWORD = $PGPASSWORD_VALUE

# 1) Database banao (agar pehle se hai to koi baat nahi)
Write-Host "1/2  Database 'smart_city_db' bana rahe hain..." -ForegroundColor Cyan
& $psql -U postgres -h localhost -c "CREATE DATABASE smart_city_db;" 2>&1 | Out-Host

# Connection test
$test = & $psql -U postgres -h localhost -d smart_city_db -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "GALAT PASSWORD ya PostgreSQL band hai. Error:" -ForegroundColor Red
    Write-Host $test
    exit 1
}
Write-Host "     Database OK." -ForegroundColor Green

# 2) .env file me password daalo
Write-Host "2/2  .env file update kar rahe hain..." -ForegroundColor Cyan
$envPath = Join-Path $PSScriptRoot ".env"
$url = "postgresql://postgres:$PGPASSWORD_VALUE@localhost:5432/smart_city_db"
@"
DATABASE_URL=$url

SECRET_KEY=dev-secret-change-me
ACCESS_TOKEN_EXPIRE_MINUTES=60
"@ | Set-Content -Path $envPath -Encoding UTF8
Write-Host "     .env updated." -ForegroundColor Green

Write-Host "`nSAB READY! Ab backend chalao:" -ForegroundColor Green
Write-Host "   python -m uvicorn app.main:app --reload" -ForegroundColor Yellow
