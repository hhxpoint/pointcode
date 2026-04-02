#!/bin/bash
set -e

# PointCode 一键安装脚本 (Linux/Mac)

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "========================================"
echo "  PointCode 一键安装脚本"
echo "========================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误：Node.js 未安装${NC}"
    echo "请先从 https://nodejs.org 安装 Node.js (需要 v20.0.0 或更高版本)"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}错误：Node.js 版本过低 (当前：$(node -v))${NC}"
    echo "需要 Node.js v20.0.0 或更高版本"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误：npm 未安装${NC}"
    echo "请确保 Node.js 正确安装"
    exit 1
fi

echo -e "${GREEN}✓ Node.js: $(node -v)${NC}"
echo -e "${GREEN}✓ npm: $(npm -v)${NC}"
echo ""

# 全局安装 pointcode
echo -e "${YELLOW}正在安装 PointCode...${NC}"
npm install -g pointcode

echo ""
echo "========================================"
echo -e "${GREEN}✓ PointCode 安装成功!${NC}"
echo "========================================"
echo ""
echo "使用方法:"
echo "  pointcode"
echo ""
echo "如果提示命令不存在，请确保 npm 全局目录在 PATH 中:"
echo "  echo 'export PATH=\$(npm config get prefix)/bin:\$PATH' >> ~/.bashrc"
echo "  source ~/.bashrc"
echo ""
