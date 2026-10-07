param()

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$branch = (& git -C $root branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or !$branch) { throw 'Cannot identify the source branch.' }
if ($branch -eq 'main') { throw 'Prepare the submission on an approved feature branch, not main.' }
$revision = (& git -C $root rev-parse HEAD).Trim()
$status = @(& git -C $root status --porcelain)
$files = @(& git -C $root -c core.quotepath=false ls-files --cached --others --exclude-standard)
if ($LASTEXITCODE -ne 0) { throw 'Cannot enumerate repository files.' }

# Use version-controlled/non-ignored inputs, with a second explicit safety filter.
$files = @($files | Sort-Object -Unique | Where-Object {
    $_ -notmatch '(^|/)(node_modules|\.git|\.next|\.tools|\.aws|\.codex|\.agents|submissions|playwright-report|test-results|coverage|build|out)(/|$)' -and
    $_ -notmatch '^testing/(jmeter|lighthouse)/(results|fixtures)/' -and
    $_ -notmatch '(^|/)\.env(?!\.example$)' -and
    $_ -notmatch '\.(pem|key|pfx|p12|tsbuildinfo)$' -and
    $_ -notmatch '(^|/)(next-env\.d\.ts|npm-debug\.log.*)$'
})
$required = @('README.md', 'docker-compose.yml', 'frontend/Dockerfile', 'api/Dockerfile',
    'frontend/package.json', 'frontend/package-lock.json', 'api/package.json',
    'api/package-lock.json', 'api/prisma/schema.prisma', '.env.example',
    'api/.env.example', 'docs/references.md', 'docs/video-walkthrough.md',
    'docs/submission-checklist.md', 'scripts/prepare-submission.ps1')
foreach ($file in $required) {
    if ($file -notin $files) { throw "Required submission input missing: $file" }
}

$output = Join-Path $root 'submissions'
[IO.Directory]::CreateDirectory($output) | Out-Null
$stamp = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff')
$stem = "Benjamin-Colston-22557298-A3-$stamp"
$zipPath = Join-Path $output "$stem.zip"
$prefix = 'cse3cwa-project/'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$manifest = @()
$archive = [IO.Compression.ZipFile]::Open($zipPath, [IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in $files) {
        $path = [IO.Path]::GetFullPath((Join-Path $root $file))
        if (!$path.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Input is outside repository: $file"
        }
        $item = Get-Item -LiteralPath $path
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Linked input rejected: $file" }
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $path, $prefix + $file,
            [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        $manifest += [ordered]@{ path = $prefix + $file; bytes = $item.Length; sha256 = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash }
    }
} finally { $archive.Dispose() }

# Verify every archived byte against the corresponding working-tree input.
$archive = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
    if ($archive.Entries.Count -ne $manifest.Count) { throw 'Archive entry count mismatch.' }
    foreach ($record in $manifest) {
        $entry = $archive.GetEntry($record.path)
        if (!$entry -or $entry.Length -ne $record.bytes) { throw "Archive length mismatch: $($record.path)" }
        $stream = $entry.Open()
        $sha = [Security.Cryptography.SHA256]::Create()
        try { $hash = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '') }
        finally { $stream.Dispose(); $sha.Dispose() }
        if ($hash -ne $record.sha256) { throw "Archive hash mismatch: $($record.path)" }
    }
} finally { $archive.Dispose() }
$zipHash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
[ordered]@{
    createdUtc = [DateTime]::UtcNow.ToString('o')
    branch = $branch
    baseCommit = $revision
    workingTreeChanges = $status
    archive = "$stem.zip"
    archiveSha256 = $zipHash
    fileCount = $manifest.Count
    files = $manifest
} | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $output "$stem.manifest.json") -Encoding utf8
"$zipHash  $stem.zip" | Set-Content -LiteralPath (Join-Path $output "$stem.sha256.txt") -Encoding ascii
Write-Output "Verified $($manifest.Count) files: $zipPath"
Write-Output 'Includes current uncommitted inputs. Regenerate after approval/commit or any further edits.'
