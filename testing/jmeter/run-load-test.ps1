[CmdletBinding()]
param(
    [ValidateRange(1, 10000)][int]$Users = 1,
    [ValidateRange(1, 1000)][int]$Loops = 2,
    [ValidateRange(1, 3600)][int]$RampUp = 1,
    [ValidateRange(0, 60000)][int]$ThinkMs = 100,
    [string]$JMeterPath = (Join-Path $PSScriptRoot '.tools/apache-jmeter-5.6.3/bin/jmeter.bat'),
    [string]$JavaHome = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $JMeterPath)) {
    throw 'JMeter was not found. Pass -JMeterPath with the full path to jmeter.bat. See testing/jmeter/README.md.'
}
if (-not $JavaHome -and (Test-Path -LiteralPath (Join-Path $PSScriptRoot '.tools/java17'))) {
    $localRuntime = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '.tools/java17') -Directory | Select-Object -First 1
    if ($localRuntime) { $JavaHome = $localRuntime.FullName }
}
$javaExecutable = if ($JavaHome) { Join-Path $JavaHome 'bin/java.exe' } else { (Get-Command java).Source }
$javaVersion = (& $javaExecutable -version 2>&1 | Out-String).Trim()
if ($javaVersion -match 'version "(\d+)' -and [int]$Matches[1] -gt 21) {
    throw 'JMeter 5.6.3 bundled Groovy cannot use this Java version. Pass -JavaHome pointing to Java 17.'
}
foreach ($fixture in @('wordle.html', 'word-search.html')) {
    if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot "fixtures/$fixture"))) {
        throw 'Export the generated HTML first: node testing/jmeter/export-fixtures.mjs'
    }
}
foreach ($url in @('http://localhost:4080/health', 'http://localhost:3000')) {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -ne 200) { throw "Start the Docker stack first. $url is unavailable." }
}

$runName = 'users-{0}-{1}-{2}' -f $Users, (Get-Date -Format 'yyyyMMdd-HHmmss'), ([guid]::NewGuid().ToString('N').Substring(0, 6))
$runDirectory = Join-Path $PSScriptRoot "results/$runName"
New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null
$resultsFile = Join-Path $runDirectory 'samples.jtl'
$jmeterArguments = @(
    '-n', '-t', (Join-Path $PSScriptRoot 'builder-workflow.jmx'),
    '-l', $resultsFile, '-j', (Join-Path $runDirectory 'jmeter.log'),
    '-e', '-o', (Join-Path $runDirectory 'report'),
    "-JplanDir=$PSScriptRoot", "-Jusers=$Users", "-Jloops=$Loops",
    "-JrampUp=$RampUp", "-JthinkMs=$ThinkMs",
    '-Jjmeter.save.saveservice.output_format=csv',
    '-Jjmeter.save.saveservice.print_field_names=true',
    '-Jjmeter.save.saveservice.assertion_results_failure_message=true',
    '-Jsample_variables=activityType'
)
$previousJavaHome = $env:JAVA_HOME
$previousPath = $env:PATH
try {
    if ($JavaHome) {
        $env:JAVA_HOME = $JavaHome
        $env:PATH = (Join-Path $JavaHome 'bin') + ';' + $previousPath
    }
    & $JMeterPath @jmeterArguments
    $jmeterExitCode = $LASTEXITCODE
} finally {
    $env:JAVA_HOME = $previousJavaHome
    $env:PATH = $previousPath
}
if ($jmeterExitCode -ne 0) { throw "JMeter failed. Inspect $runDirectory/jmeter.log" }
if (-not (Test-Path -LiteralPath $resultsFile)) { throw 'JMeter did not create sample results.' }
$samples = @(Import-Csv -LiteralPath $resultsFile)
if ($samples.Count -eq 0) { throw 'JMeter did not record any samples.' }

function Get-SampleSummary($items) {
    $times = @($items | ForEach-Object { [double]$_.elapsed } | Sort-Object)
    $failed = @($items | Where-Object success -NE 'true').Count
    $start = ($items | ForEach-Object { [double]$_.timeStamp } | Measure-Object -Minimum).Minimum
    $end = ($items | ForEach-Object { [double]$_.timeStamp + [double]$_.elapsed } | Measure-Object -Maximum).Maximum
    $seconds = [Math]::Max(0.001, ($end - $start) / 1000)
    [ordered]@{
        samples = $items.Count
        failures = $failed
        errorPercent = [Math]::Round(100 * $failed / $items.Count, 2)
        averageMs = [Math]::Round(($times | Measure-Object -Average).Average, 2)
        p95Ms = $times[[Math]::Ceiling($times.Count * 0.95) - 1]
        requestsPerSecond = [Math]::Round($items.Count / $seconds, 2)
        durationSeconds = [Math]::Round($seconds, 2)
    }
}

$overall = Get-SampleSummary $samples
$observedThreadNames = [System.Collections.Generic.HashSet[string]]::new()
foreach ($sample in $samples) {
    $null = $observedThreadNames.Add($sample.threadName)
}
$summary = [ordered]@{
    recordedAt = (Get-Date).ToUniversalTime().ToString('o')
    javaVersion = $javaVersion
    users = $Users
    loopsPerUser = $Loops
    rampUpSeconds = $RampUp
    thinkTimeMs = $ThinkMs
    observedUsers = $observedThreadNames.Count
    peakActiveUsers = ($samples | ForEach-Object { [int]$_.allThreads } | Measure-Object -Maximum).Maximum
    expectedSamples = $Users * $Loops * 11
    frontend = 'http://localhost:3000'
    api = 'http://localhost:4080'
    overall = $overall
    byRequest = @($samples | Group-Object label | ForEach-Object {
        [ordered]@{ label = $_.Name; statistics = (Get-SampleSummary @($_.Group)) }
    })
    activityTypes = @($samples | Select-Object -ExpandProperty activityType -Unique)
}
$summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $runDirectory 'summary.json') -Encoding utf8
$overall | ConvertTo-Json | Write-Host
Write-Host "Results: $runDirectory"
Write-Host "HTML report: $runDirectory/report/index.html"
if ($overall.failures -gt 0) { throw 'Some requests failed. Review failureMessage in samples.jtl before increasing the load.' }
if ($samples.Count -ne $summary.expectedSamples -or $summary.observedUsers -ne $Users) {
    throw 'The run did not complete the expected users and workflow requests. Review jmeter.log and samples.jtl.'
}
