#!/bin/bash
set -e

# PointCode npm 发布脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================"
echo "  PointCode npm 发布脚本"
echo "========================================"
echo ""

# 检查登录状态
echo -e "${YELLOW}检查 npm 登录状态...${NC}"
if ! npm whoami &> /dev/null; then
    echo -e "${RED}未登录 npm，请先登录:${NC}"
    echo "  npm login"
    exit 1
fi

NPM_USER=$(npm whoami)
echo -e "${GREEN}✓ 已登录为：${NPM_USER}${NC}"
echo ""

# 构建项目
echo -e "${YELLOW}构建项目...${NC}"
bun run build
echo -e "${GREEN}✓ 构建完成${NC}"
echo ""

# 检查包名是否已存在
PACKAGE_NAME=$(node -p "require('./package.json').name")
echo -e "${YELLOW}检查包名：${PACKAGE_NAME}${NC}"

# 发布
echo -e "${YELLOW}发布到 npm...${NC}"
npm publish --access public

echo ""
echo "========================================"
echo -e "${GREEN}✓ 发布成功!${NC}"
echo "========================================"
echo ""
echo "用户可以现在安装:"
echo "  npm install -g ${PACKAGE_NAME}"
echo "  npx ${PACKAGE_NAME}"
echo ""
