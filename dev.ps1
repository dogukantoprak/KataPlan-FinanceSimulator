[CmdletBinding()]
param(
    [switch]$Stop,
    [switch]$Status
)

$ErrorActionPreference = 'Stop'

$RepoRoot = $PSScriptRoot
$RunDir = Join-Path $RepoRoot '.run'

$BackendPidFile = Join-Path $RunDir 'backend.pid'
$FrontendPidFile = Join-Path $RunDir 'frontend.pid'

$BackendOutLog = Join-Path $RunDir 'backend.out.log'
$BackendErrLog = Join-Path $RunDir 'backend.err.log'
$FrontendOutLog = Join-Path $RunDir 'frontend.out.log'
$FrontendErrLog = Join-Path $RunDir 'frontend.err.log'

$BackendUrl = 'http://127.0.0.1:5000/api/health'
$FrontendUrl = 'http://localhost:5173'
$BackendPattern = '"status":"ok"'
$FrontendPattern = 'KataPlan'
$BackendPort = 5000
$FrontendPort = 5173

function Ensure-RunDirectory {
    if (-not (Test-Path $RunDir)) {
        New-Item -ItemType Directory -Path $RunDir | Out-Null
    }
}

function Get-ManagedProcess {
    param(
        [Parameter(Mandatory)]
        [string]$PidFile
    )

    if (-not (Test-Path $PidFile)) {
        return $null
    }

    $rawPid = Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $rawPid) {
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        return $null
    }

    $rawPid = $rawPid.Trim()
    if (-not $rawPid) {
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        return $null
    }

    $pidValue = 0
    if (-not [int]::TryParse($rawPid, [ref]$pidValue)) {
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        return $null
    }

    $process = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
    if (-not $process) {
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
        return $null
    }

    return $process
}

function Stop-ManagedProcess {
    param(
        [Parameter(Mandatory)]
        [string]$Name,
        [Parameter(Mandatory)]
        [string]$PidFile
    )

    $process = Get-ManagedProcess -PidFile $PidFile
    if (-not $process) {
        return $false
    }

    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 400

    if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
        throw "Could not stop $Name process $($process.Id)."
    }

    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    return $true
}

function Test-UrlReady {
    param(
        [Parameter(Mandatory)]
        [string]$Url,
        [string]$Pattern,
        [int]$Attempts = 1,
        [int]$DelayMs = 0
    )

    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                if ($Pattern -and $response.Content -notmatch [regex]::Escape($Pattern)) {
                    continue
                }

                return $true
            }
        } catch {
        }

        if ($attempt -lt $Attempts -and $DelayMs -gt 0) {
            Start-Sleep -Milliseconds $DelayMs
        }
    }

    return $false
}

function Get-ListeningPid {
    param(
        [Parameter(Mandatory)]
        [int]$Port
    )

    $lines = netstat -ano | Select-String 'LISTENING'
    foreach ($line in $lines) {
        $columns = ($line.Line -split '\s+') | Where-Object { $_ }
        if ($columns.Count -lt 5) {
            continue
        }

        $localAddress = $columns[1]
        $state = $columns[3]
        $pidText = $columns[4]

        if ($state -ne 'LISTENING' -or $localAddress -notmatch (":{0}$" -f $Port)) {
            continue
        }

        $pidValue = 0
        if ([int]::TryParse($pidText, [ref]$pidValue)) {
            return $pidValue
        }
    }

    return $null
}

function Adopt-RunningService {
    param(
        [Parameter(Mandatory)]
        [string]$PidFile,
        [Parameter(Mandatory)]
        [string]$Url,
        [Parameter(Mandatory)]
        [string]$Pattern,
        [Parameter(Mandatory)]
        [int]$Port
    )

    $managed = Get-ManagedProcess -PidFile $PidFile
    if ($managed) {
        return $managed
    }

    if (-not (Test-UrlReady -Url $Url -Pattern $Pattern)) {
        return $null
    }

    $pidValue = Get-ListeningPid -Port $Port
    if (-not $pidValue) {
        return $null
    }

    Set-Content -Path $PidFile -Value $pidValue
    return Get-ManagedProcess -PidFile $PidFile
}

function Start-ManagedProcess {
    param(
        [Parameter(Mandatory)]
        [string]$Name,
        [Parameter(Mandatory)]
        [string]$FilePath,
        [Parameter(Mandatory)]
        [string[]]$ArgumentList,
        [Parameter(Mandatory)]
        [string]$WorkingDirectory,
        [Parameter(Mandatory)]
        [string]$StdOutPath,
        [Parameter(Mandatory)]
        [string]$StdErrPath,
        [Parameter(Mandatory)]
        [string]$PidFile
    )

    if (-not (Test-Path $FilePath)) {
        throw "$Name executable not found: $FilePath"
    }

    Set-Content -Path $StdOutPath -Value ''
    Set-Content -Path $StdErrPath -Value ''

    $process = Start-Process `
        -FilePath $FilePath `
        -ArgumentList $ArgumentList `
        -WorkingDirectory $WorkingDirectory `
        -RedirectStandardOutput $StdOutPath `
        -RedirectStandardError $StdErrPath `
        -PassThru `
        -WindowStyle Hidden

    Set-Content -Path $PidFile -Value $process.Id
    return $process
}

function Write-ServiceState {
    param(
        [Parameter(Mandatory)]
        [string]$Name,
        [Parameter(Mandatory)]
        [string]$PidFile,
        [Parameter(Mandatory)]
        [string]$Url,
        [Parameter(Mandatory)]
        [string]$Pattern,
        [Parameter(Mandatory)]
        [int]$Port
    )

    $process = Adopt-RunningService -PidFile $PidFile -Url $Url -Pattern $Pattern -Port $Port
    if ($process) {
        $healthy = Test-UrlReady -Url $Url -Pattern $Pattern
        $statusText = if ($healthy) { 'ready' } else { 'starting or unhealthy' }
        Write-Host ("{0}: managed pid {1}, {2}" -f $Name, $process.Id, $statusText)
        return
    }

    $reachable = Test-UrlReady -Url $Url -Pattern $Pattern
    if ($reachable) {
        Write-Host ("{0}: responding but unmanaged" -f $Name)
        return
    }

    Write-Host ("{0}: stopped" -f $Name)
}

function Assert-Prerequisites {
    $pythonExe = Join-Path $RepoRoot '.venv\Scripts\python.exe'
    if (-not (Test-Path $pythonExe)) {
        throw "Missing Python virtual environment at .venv\Scripts\python.exe"
    }

    $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if (-not $npmCommand) {
        throw "npm.cmd is not available on PATH."
    }

    $frontendNodeModules = Join-Path $RepoRoot 'frontend\node_modules'
    if (-not (Test-Path $frontendNodeModules)) {
        throw "Missing frontend dependencies. Run npm install in frontend."
    }

    return @{
        PythonExe = $pythonExe
        CmdExe = $env:ComSpec
        BackendScript = (Join-Path $RepoRoot 'backend\run_server.py')
        FrontendDir = (Join-Path $RepoRoot 'frontend')
    }
}

Ensure-RunDirectory

if ($Status) {
    Write-ServiceState -Name 'backend' -PidFile $BackendPidFile -Url $BackendUrl -Pattern $BackendPattern -Port $BackendPort
    Write-ServiceState -Name 'frontend' -PidFile $FrontendPidFile -Url $FrontendUrl -Pattern $FrontendPattern -Port $FrontendPort
    exit 0
}

if ($Stop) {
    $backendStopped = Stop-ManagedProcess -Name 'backend' -PidFile $BackendPidFile
    $frontendStopped = Stop-ManagedProcess -Name 'frontend' -PidFile $FrontendPidFile

    if ($backendStopped -or $frontendStopped) {
        Write-Host 'Managed dev servers stopped.'
    } else {
        Write-Host 'No managed dev servers were running.'
    }

    exit 0
}

$paths = Assert-Prerequisites

$null = Adopt-RunningService -PidFile $FrontendPidFile -Url $FrontendUrl -Pattern $FrontendPattern -Port $FrontendPort
$null = Adopt-RunningService -PidFile $BackendPidFile -Url $BackendUrl -Pattern $BackendPattern -Port $BackendPort

$null = Stop-ManagedProcess -Name 'frontend' -PidFile $FrontendPidFile
$null = Stop-ManagedProcess -Name 'backend' -PidFile $BackendPidFile

$backendProcess = Start-ManagedProcess `
    -Name 'backend' `
    -FilePath $paths.PythonExe `
    -ArgumentList @($paths.BackendScript) `
    -WorkingDirectory $RepoRoot `
    -StdOutPath $BackendOutLog `
    -StdErrPath $BackendErrLog `
    -PidFile $BackendPidFile

if (-not (Test-UrlReady -Url $BackendUrl -Pattern $BackendPattern -Attempts 30 -DelayMs 500)) {
    $null = Stop-ManagedProcess -Name 'backend' -PidFile $BackendPidFile
    throw "Backend did not become ready. Check .run\backend.err.log"
}

$frontendProcess = Start-ManagedProcess `
    -Name 'frontend' `
    -FilePath $paths.CmdExe `
    -ArgumentList @('/d', '/c', 'npm run dev') `
    -WorkingDirectory $paths.FrontendDir `
    -StdOutPath $FrontendOutLog `
    -StdErrPath $FrontendErrLog `
    -PidFile $FrontendPidFile

if (-not (Test-UrlReady -Url $FrontendUrl -Pattern $FrontendPattern -Attempts 30 -DelayMs 500)) {
    $null = Stop-ManagedProcess -Name 'frontend' -PidFile $FrontendPidFile
    $null = Stop-ManagedProcess -Name 'backend' -PidFile $BackendPidFile
    throw "Frontend did not become ready. Check .run\frontend.err.log"
}

Write-Host ("frontend: {0}" -f $FrontendUrl)
Write-Host ("backend:  {0}" -f $BackendUrl)
Write-Host ("logs:     {0}" -f $RunDir)
Write-Host ("pids:     frontend={0}, backend={1}" -f $frontendProcess.Id, $backendProcess.Id)
