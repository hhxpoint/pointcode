@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PROFILE_PATH=%SCRIPT_DIR%.openclaude-profile.json"

if exist "%PROFILE_PATH%" (
	for /f "tokens=*" %%a in ('node -e "const p=require(process.argv[1]);if(p&&p.env){for(const[k,v] of Object.entries(p.env)){console.log(k+'='+String(v))}}" "%PROFILE_PATH%"') do (
		set "%%a"
	)
)

if not exist "%SCRIPT_DIR%dist\cli.mjs" (
	pushd "%SCRIPT_DIR%"
	bun run build
	if errorlevel 1 (
		popd
		exit /b 1
	)
	popd
)

node "%SCRIPT_DIR%dist\cli.mjs" %*
