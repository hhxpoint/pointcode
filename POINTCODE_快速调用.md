# PointCode 快速调用

## 启动

```bat
cd /d D:\agent\pointcode
start.bat
```

## 常用命令

```text
/provider
/provider list
/provider set dashscope
/provider key dashscope <your-key>

/model
/model qwen3.5-plus
/model qwen3.5-flash

/buddy
/help
/status
```

## 常见问题

### 1) `Unknown skill: buddy`

- 已修复为内置默认命令。
- 若仍看到旧行为，重新构建并重启:

```bat
bun run build
start.bat
```

### 2) `model '__custom__' not found`

- 已修复，不会再把占位值当真实模型发送。
- 正确用法是:

```text
/model <真实模型名>
```

### 3) `model 'qwen2.5-coder:7b' not found`

- 这是模型在目标服务端不存在，不是 CLI 语法问题。
- 若走 Ollama，请先确认本地已拉取该模型。
