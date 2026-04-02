# PointCode 一键安装脚本 (Windows PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PointCode 一键安装脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js 是否安装
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "错误：Node.js 未安装" -ForegroundColor Red
    Write-Host "请先从 https://nodejs.org 安装 Node.js (需要 v20.0.0 或更高版本)" -ForegroundColor Yellow
    exit 1
}

# 检查 Node.js 版本
$versionNumber = $nodeVersion -replace 'v','' -split '\.' | Select-Object -First 1
if ([int]$versionNumber -lt 20) {
    Write-Host "错误：Node.js 版本过低 (当前：$nodeVersion)" -ForegroundColor Red
    Write-Host "需要 Node.js v20.0.0 或更高版本" -ForegroundColor Yellow
    exit 1
}

# 检查 npm 是否安装
try {
    $npmVersion = npm -v
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "错误：npm 未安装" -ForegroundColor Red
    Write-Host "请确保 Node.js 正确安装" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "正在安装 PointCode..." -ForegroundColor Yellow
Write-Host ""

# 全局安装 pointcode
try {
    npm install -g pointcode
} catch {
    Write-Host "安装失败，请检查网络连接或手动运行：npm install -g pointcode" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ PointCode 安装成功!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "使用方法:" -ForegroundColor White
Write-Host "  pointcode" -ForegroundColor Gray
Write-Host ""
Write-Host "如果提示命令不存在，请将 npm 全局目录添加到 PATH:" -ForegroundColor Yellow
Write-Host "  $env:Path += `";$(npm config get prefix)`"" -ForegroundColor Gray
