#!/bin/bash

echo "========================================"
echo "  PointCode - AI编程助手"
echo "========================================"
echo ""

# Check if built
if [ ! -f "dist/cli.mjs" ]; then
    echo "[!] 未找到构建文件，正在构建..."
    bun run build
    echo ""
fi

echo "[✓] 启动PointCode..."
echo ""

# Run PointCode
node dist/cli.mjs "$@"
