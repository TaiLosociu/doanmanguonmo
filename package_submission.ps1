$stagingDir = "temp_submission\SAN_NHA_FC"
if (Test-Path "temp_submission") { Remove-Item -Recurse -Force "temp_submission" }
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null

$exclude = @('node_modules', '.next', 'node.exe', 'tsconfig.tsbuildinfo')

Get-ChildItem -Path "web" | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $stagingDir -Recurse -Force
}

$zipName = "DO_AN_SAN_NHA_FC_PORT_3001.zip"
if (Test-Path $zipName) { Remove-Item -Force $zipName }

Compress-Archive -Path "temp_submission\*" -DestinationPath $zipName -Force

Remove-Item -Recurse -Force "temp_submission"

Write-Host "PACKAGE CREATED SUCCESSFULLY:"
Get-Item $zipName | Select-Object Name, Length, LastWriteTime
