# Creates the smart_city_db database in PostgreSQL.
# Run this once from the backend/ folder:  .\create_db.ps1
# It will ask for your PostgreSQL 'postgres' user password.

$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"

Write-Host "Creating database 'smart_city_db' (you'll be asked for the postgres password)..."
& $psql -U postgres -h localhost -c "CREATE DATABASE smart_city_db;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully." -ForegroundColor Green
} else {
    Write-Host "If it said 'already exists', that's fine." -ForegroundColor Yellow
}
