@echo off
echo Starting PointCode with Ollama...
set CLAUDE_CODE_USE_OPENAI=1
set OPENAI_BASE_URL=http://localhost:11434/v1
set OPENAI_MODEL=myqwen:latest
node dist/cli.mjs
