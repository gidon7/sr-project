# sr-project — Cloudflare 자동 셋업 (D1 생성 + id 주입 + 마이그레이션 + 배포)
# 사용법(이미 wrangler login 된 터미널에서):  powershell -ExecutionPolicy Bypass -File .\setup-cf.ps1
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

function Run($cmd) { Write-Host "▶ $cmd" -ForegroundColor Cyan; iex $cmd }

# 0) 로그인 확인 (안 돼 있으면 브라우저 로그인)
$who = (npx wrangler whoami 2>&1 | Out-String)
if ($who -match "not authenticated") {
  Write-Host "Cloudflare 로그인이 필요합니다. 브라우저가 열립니다..." -ForegroundColor Yellow
  npx wrangler login
}

# 1) D1 생성 (이미 있으면 무시)
Write-Host "`n[1/4] D1 데이터베이스 확인/생성..." -ForegroundColor Green
try { npx wrangler d1 create sr-project-db 2>&1 | Out-Null } catch { }

# 2) database_id 조회 (--json)
$infoRaw = (npx wrangler d1 info sr-project-db --json 2>$null | Out-String)
$dbid = $null
try { $dbid = ($infoRaw | ConvertFrom-Json).uuid } catch { }
if (-not $dbid) {
  # 폴백: 텍스트에서 UUID 패턴 추출
  if ($infoRaw -match "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}") {
    $dbid = $Matches[0]
  }
}
if (-not $dbid) { throw "database_id 를 가져오지 못했습니다. 'npx wrangler d1 info sr-project-db' 출력을 확인하세요." }
Write-Host "  database_id = $dbid" -ForegroundColor Green

# 3) wrangler.jsonc 에 id 주입 (자리표시자 또는 기존 uuid 교체)
$cfg = Get-Content -Raw -Encoding UTF8 ".\wrangler.jsonc"
$cfg = $cfg -replace 'REPLACE_WITH_YOUR_D1_DATABASE_ID', $dbid
$cfg = $cfg -replace '("database_id":\s*")[0-9a-fA-F-]{36}(")', ('${1}' + $dbid + '${2}')
Set-Content -Path ".\wrangler.jsonc" -Value $cfg -Encoding UTF8
Write-Host "[2/4] wrangler.jsonc 업데이트 완료" -ForegroundColor Green

# 4) 운영 DB 스키마 적용
Write-Host "`n[3/4] 운영 DB 마이그레이션..." -ForegroundColor Green
npx wrangler d1 execute sr-project-db --remote --file=./migrations/0001_init.sql

# 5) 배포
Write-Host "`n[4/4] 빌드 + 배포..." -ForegroundColor Green
npm run deploy

Write-Host "`n✅ 완료! https://sr-project.pages.dev" -ForegroundColor Green
Write-Host "분석 기능을 쓰려면 API 키도 등록하세요:" -ForegroundColor Yellow
Write-Host "  npx wrangler pages secret put ANTHROPIC_API_KEY" -ForegroundColor Yellow
Write-Host "그리고 wrangler.jsonc 변경을 커밋:  git add wrangler.jsonc; git commit -m 'set D1 id'; git push" -ForegroundColor Yellow
