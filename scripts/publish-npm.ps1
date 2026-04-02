# PointCode npm 发布脚本 (PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PointCode npm 发布脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查登录状态
Write-Host "检查 npm 登录状态..." -ForegroundColor Yellow
try {
    $npmUser = npm whoami
    Write-Host "✓ 已登录为：$npmUser" -ForegroundColor Green
} catch {
    Write-Host "未登录 npm，请先登录：npm login" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 构建项目
Write-Host "构建项目..." -ForegroundColor Yellow
bun run build
Write-Host "✓ 构建完成" -ForegroundColor Green
Write-Host ""

# 获取包名
$packageJson = Get-Content package.json -Raw | ConvertFrom-Json
$packageName = $packageJson.name

Write-Host "包名：$packageName" -ForegroundColor Yellow
Write-Host ""

# 发布
Write-Host "发布到 npm..." -ForegroundColor Yellow
npm publish --access public

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ 发布成功!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "用户可以现在安装:" -ForegroundColor White
Write-Host "  npm install -g $packageName" -ForegroundColor Gray
Write-Host "  npx $packageName" -ForegroundColor Gray
Write-Host ""
