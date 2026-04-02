#!/bin/bash
echo "Starting PointCode with Ollama..."
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_BASE_URL=http://localhost:11434/v1
export OPENAI_MODEL=myqwen:latest
node dist/cli.mjs
