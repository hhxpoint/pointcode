@echo off
setlocal enabledelayedexpansion

REM PointCode 快速启动脚本
REM 用法: pointcode [args...]
REM 首次使用会提示选择模型，之后直接启动

set "SCRIPT_DIR=%~dp0"
set "PROFILE_PATH=%SCRIPT_DIR%.openclaude-profile.json"

REM 检查是否已有配置文件
if exist "%PROFILE_PATH%" (
    REM 有配置文件，直接启动
    goto :launch
)

REM 首次启动，显示模型选择
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  PointCode 模型选择                         ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo   [云端模型]
echo   1. DeepSeek-V3.2 (Chat)
echo   2. DeepSeek-V3.2 (Reasoner)
echo   3. Qwen3.5 Plus
echo   4. GLM-5
echo   5. MiMo-V2 Pro
echo   6. GPT-4o
echo.
echo   [本地模型 - Ollama]
echo   7. Llama 3.1 8B
echo   8. Qwen2.5 Coder 7B
echo.
echo   9. 自定义 OpenAI 兼容模型
echo.

set /p "CHOICE=选择模型 (1-9) [1]: "
if "%CHOICE%"=="" set "CHOICE=1"

if "%CHOICE%"=="1" (
    set "PROVIDER=deepseek"
    set "MODEL=deepseek-chat"
    set "BASE_URL=https://api.deepseek.com"
    set "NEEDS_KEY=1"
) else if "%CHOICE%"=="2" (
    set "PROVIDER=deepseek"
    set "MODEL=deepseek-reasoner"
    set "BASE_URL=https://api.deepseek.com"
    set "NEEDS_KEY=1"
) else if "%CHOICE%"=="3" (
    set "PROVIDER=dashscope"
    set "MODEL=qwen3.5-plus"
    set "BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1"
    set "NEEDS_KEY=1"
) else if "%CHOICE%"=="4" (
    set "PROVIDER=zhipu"
    set "MODEL=glm-5"
    set "BASE_URL=https://open.bigmodel.cn/api/paas/v4/"
    set "NEEDS_KEY=1"
) else if "%CHOICE%"=="5" (
    set "PROVIDER=mimo"
    set "MODEL=mimo-v2-pro"
    set "BASE_URL=https://api.xiaomimimo.com/v1"
    set "NEEDS_KEY=1"
) else if "%CHOICE%"=="6" (
    set "PROVIDER=openai"
    set "MODEL=gpt-4o"
    set "BASE_URL=https://api.openai.com/v1"
    set "NEEDS_KEY=1"
) else if "%CHOICE%"=="7" (
    set "PROVIDER=ollama"
    set "MODEL=llama3.1:8b"
    set "BASE_URL=http://localhost:11434/v1"
    set "NEEDS_KEY=0"
) else if "%CHOICE%"=="8" (
    set "PROVIDER=ollama"
    set "MODEL=qwen2.5-coder:7b"
    set "BASE_URL=http://localhost:11434/v1"
    set "NEEDS_KEY=0"
) else if "%CHOICE%"=="9" (
    set /p "BASE_URL=API Base URL: "
    set /p "MODEL=模型 ID: "
    set "PROVIDER=custom"
    set "NEEDS_KEY=1"
) else (
    echo 无效选择
    exit /b 1
)

REM 获取 API Key (如果需要)
set "API_KEY="
if "%NEEDS_KEY%"=="1" (
    echo.
    set /p "API_KEY=输入 %PROVIDER% API Key: "
    if "!API_KEY!"=="" (
        echo 错误: API Key 不能为空
        exit /b 1
    )
)

REM 保存配置文件
echo {> "%PROFILE_PATH%"
echo   "profile": "openai",>> "%PROFILE_PATH%"
echo   "env": {>> "%PROFILE_PATH%"
echo     "CLAUDE_CODE_USE_OPENAI": "1",>> "%PROFILE_PATH%"
echo     "OPENAI_BASE_URL": "%BASE_URL%",>> "%PROFILE_PATH%"
echo     "OPENAI_MODEL": "%MODEL%">> "%PROFILE_PATH%"
if defined API_KEY (
    echo     ,>> "%PROFILE_PATH%"
    echo     "OPENAI_API_KEY": "!API_KEY!">> "%PROFILE_PATH%"
)>> "%PROFILE_PATH%"
echo   },>> "%PROFILE_PATH%"
echo   "createdAt": "%date% %time%">> "%PROFILE_PATH%"
echo }>> "%PROFILE_PATH%"

echo.
echo ✓ 配置已保存
echo   模型: %MODEL%
echo   地址: %BASE_URL%
echo.

:launch
REM 设置环境变量并启动
set "CLAUDE_CODE_USE_OPENAI=1"

REM 从配置文件读取环境变量
if exist "%PROFILE_PATH%" (
    for /f "tokens=*" %%a in ('node -e "const p=require('%PROFILE_PATH%');if(p.env)for(const[k,v]of Object.entries(p.env))console.log(k+'='+v)"') do (
        set "%%a"
    )
)

REM 构建并启动
if not exist "%SCRIPT_DIR%dist\cli.mjs" (
    echo 正在构建 PointCode...
    cd /d "%SCRIPT_DIR%"
    call bun run build
)

echo 启动 PointCode...
echo.
node "%SCRIPT_DIR%dist\cli.mjs" %*
