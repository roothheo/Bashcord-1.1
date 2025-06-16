# Bashcord Auto-Installer for Windows
# The other cutest Discord client mod but made by Ba$h
# https://github.com/roothheo/Bashcord

param(
    [switch]$Uninstall,
    [switch]$Silent,
    [switch]$DevMode
)

# Configuration
$BashcordRepo = "https://github.com/roothheo/Bashcord.git"
$InstallDir = "$env:USERPROFILE\Bashcord"
$LogFile = "$InstallDir\installer.log"

# URLs de téléchargement
$NodeJsUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
$GitUrl = "https://github.com/git-for-windows/git/releases/latest/download/Git-2.43.0-64-bit.exe"

function Write-Color($text, $color = "White") {
    Write-Host $text -ForegroundColor $color
}

function Write-Header {
    Clear-Host
    Write-Color "========================================" "Cyan"
    Write-Color "        BASHCORD AUTO-INSTALLER        " "Cyan"
    Write-Color "Installation complete automatique       " "Cyan"
    Write-Color "                                       " "Cyan"
    Write-Color "Git + Node.js + pnpm                  " "Gray"
    Write-Color "Clone + Build automatique              " "Gray"
    Write-Color "Injection dans Discord                 " "Gray"
    Write-Color "                                       " "Cyan"
    Write-Color "github.com/roothheo/Bashcord          " "Gray"
    Write-Color "========================================" "Cyan"
    Write-Host ""
}

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    if (!(Test-Path (Split-Path $LogFile))) {
        New-Item -ItemType Directory -Path (Split-Path $LogFile) -Force | Out-Null
    }
    "$timestamp - $message" | Out-File -FilePath $LogFile -Append
    if (!$Silent) {
        Write-Host $message
    }
}

function Test-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-Chocolatey {
    Write-Log "Installation de Chocolatey..."
    try {
        if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
            refreshenv
            Write-Log "Chocolatey installe!"
        } else {
            Write-Log "Chocolatey deja installe"
        }
        return $true
    } catch {
        Write-Log "Erreur installation Chocolatey: $($_.Exception.Message)"
        return $false
    }
}

function Install-Dependencies {
    Write-Log "Installation des dependances..."
    
    try {
        # Installer Git
        if (!(Get-Command git -ErrorAction SilentlyContinue)) {
            Write-Log "Installation de Git..."
            choco install git -y --force
            refreshenv
        } else {
            Write-Log "Git deja installe"
        }
        
        # Installer Node.js
        if (!(Get-Command node -ErrorAction SilentlyContinue)) {
            Write-Log "Installation de Node.js..."
            choco install nodejs --version=20.11.0 -y --force
            refreshenv
        } else {
            Write-Log "Node.js deja installe"
        }
        
        # Installer pnpm
        if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
            Write-Log "Installation de pnpm..."
            npm install -g pnpm
            refreshenv
        } else {
            Write-Log "pnpm deja installe"
        }
        
        return $true
    } catch {
        Write-Log "Erreur installation dependances: $($_.Exception.Message)"
        return $false
    }
}

function Clone-Bashcord {
    Write-Log "Clonage de Bashcord..."
    
    try {
        if (Test-Path $InstallDir) {
            Write-Log "Suppression de l'ancienne installation..."
            Remove-Item $InstallDir -Recurse -Force
        }
        
        Write-Log "Clonage du repository..."
        git clone $BashcordRepo $InstallDir
        
        if (!(Test-Path $InstallDir)) {
            throw "Le clonage a echoue"
        }
        
        Write-Log "Bashcord clone avec succes!"
        return $true
    } catch {
        Write-Log "Erreur lors du clonage: $($_.Exception.Message)"
        return $false
    }
}

function Build-Bashcord {
    Write-Log "Construction de Bashcord..."
    
    try {
        Set-Location $InstallDir
        
        Write-Log "Installation des dependances Node.js..."
        $result = pnpm install --no-frozen-lockfile
        if ($LASTEXITCODE -ne 0) {
            throw "pnpm install a echoue"
        }
        
        Write-Log "Construction du projet..."
        $result = pnpm build
        if ($LASTEXITCODE -ne 0) {
            throw "pnpm build a echoue"
        }
        
        Write-Log "Construction terminee!"
        return $true
    } catch {
        Write-Log "Erreur lors de la construction: $($_.Exception.Message)"
        return $false
    }
}

function Find-Discord {
    Write-Log "Recherche des installations Discord..."
    
    $discordPaths = @(
        @{ Path = "$env:LOCALAPPDATA\Discord"; Name = "Discord Stable"; Type = "stable" },
        @{ Path = "$env:LOCALAPPDATA\DiscordCanary"; Name = "Discord Canary"; Type = "canary" },
        @{ Path = "$env:LOCALAPPDATA\DiscordPTB"; Name = "Discord PTB"; Type = "ptb" },
        @{ Path = "$env:LOCALAPPDATA\DiscordDevelopment"; Name = "Discord Development"; Type = "development" }
    )
    
    $foundDiscord = @()
    foreach ($discord in $discordPaths) {
        if (Test-Path $discord.Path) {
            $versions = Get-ChildItem "$($discord.Path)\app-*" -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending
            if ($versions) {
                $foundDiscord += @{
                    Path = $versions[0].FullName
                    Name = $discord.Name
                    Type = $discord.Type
                    Version = $versions[0].Name
                }
                Write-Log "Trouve: $($discord.Name) - $($versions[0].Name)"
            }
        }
    }
    
    return $foundDiscord
}

function Show-DiscordMenu($discordList) {
    Write-Color "`nChoisissez quel Discord patcher:" "Yellow"
    Write-Color "===============================" "Yellow"
    
    for ($i = 0; $i -lt $discordList.Count; $i++) {
        $discord = $discordList[$i]
        Write-Color "[$($i + 1)] $($discord.Name) - $($discord.Version)" "Cyan"
    }
    
    Write-Color "[A] Tous les Discord trouves" "Green"
    Write-Color "[Q] Quitter sans patcher" "Red"
    Write-Color ""
    
    do {
        $choice = Read-Host "Votre choix"
        if ($choice -match "^[1-$($discordList.Count)]$") {
            return @($discordList[$choice - 1])
        } elseif ($choice -eq "A" -or $choice -eq "a") {
            return $discordList
        } elseif ($choice -eq "Q" -or $choice -eq "q") {
            return @()
        } else {
            Write-Color "Choix invalide. Veuillez reessayer." "Red"
        }
    } while ($true)
}

function Inject-Bashcord($targetDiscords) {
    Write-Log "Injection de Bashcord..."
    
    $success = 0
    $total = $targetDiscords.Count
    
    foreach ($discord in $targetDiscords) {
        Write-Log "Injection dans $($discord.Name)..."
        
        try {
            Set-Location $InstallDir
            
            # Utiliser le script d'injection de Bashcord
            $env:DISCORD_PATH = $discord.Path
            $result = pnpm inject
            
            if ($LASTEXITCODE -eq 0) {
                Write-Log "$($discord.Name) patche avec succes!"
                $success++
            } else {
                Write-Log "Echec du patch pour $($discord.Name)"
            }
        } catch {
            Write-Log "Erreur lors de l'injection dans $($discord.Name): $($_.Exception.Message)"
        }
    }
    
    Write-Log "Resultats: $success/$total Discord(s) patches avec succes"
    return $success -eq $total
}

function Uninstall-Bashcord {
    Write-Log "Desinstallation de Bashcord..."
    
    try {
        Set-Location $InstallDir
        pnpm uninject
        
        if (Test-Path $InstallDir) {
            Set-Location $env:USERPROFILE
            Remove-Item $InstallDir -Recurse -Force
        }
        
        Write-Log "Desinstallation terminee!"
        return $true
    } catch {
        Write-Log "Erreur lors de la desinstallation: $($_.Exception.Message)"
        return $false
    }
}

function Main {
    try {
        if (!$Silent) {
            Write-Header
        }
        
        # Verifier les privileges administrateur
        if (!(Test-Admin)) {
            Write-Color "Ce script necessite des privileges administrateur." "Yellow"
            Write-Color "Relancez PowerShell en tant qu'administrateur." "Yellow"
            if (!$Silent) { Read-Host "Appuyez sur Entree pour fermer" }
            return
        }
        
        if ($Uninstall) {
            $result = Uninstall-Bashcord
            if (!$Silent) {
                if ($result) {
                    Write-Color "Bashcord desinstalle avec succes!" "Green"
                } else {
                    Write-Color "Erreur lors de la desinstallation" "Red"
                }
                Read-Host "Appuyez sur Entree pour fermer"
            }
            return
        }
        
        # Installation des dependances
        Write-Log "Demarrage de l'installation automatique..."
        
        if (!(Install-Chocolatey)) {
            throw "Impossible d'installer Chocolatey"
        }
        
        if (!(Install-Dependencies)) {
            throw "Impossible d'installer les dependances"
        }
        
        # Clonage et construction
        if (!(Clone-Bashcord)) {
            throw "Impossible de cloner Bashcord"
        }
        
        if (!(Build-Bashcord)) {
            throw "Impossible de construire Bashcord"
        }
        
        # Recherche et selection Discord
        $discordList = Find-Discord
        if ($discordList.Count -eq 0) {
            Write-Color "Aucune installation Discord trouvee!" "Red"
            Write-Color "Installez Discord avant d'utiliser Bashcord." "Yellow"
            if (!$Silent) { Read-Host "Appuyez sur Entree pour fermer" }
            return
        }
        
        if (!$Silent) {
            $targetDiscords = Show-DiscordMenu $discordList
            if ($targetDiscords.Count -eq 0) {
                Write-Color "Installation annulee par l'utilisateur." "Yellow"
                return
            }
        } else {
            $targetDiscords = $discordList
        }
        
        # Injection
        $injectionSuccess = Inject-Bashcord $targetDiscords
        
        if (!$Silent) {
            Write-Color ""
            if ($injectionSuccess) {
                Write-Color "Bashcord installe avec succes!" "Green"
                Write-Color "Redemarrez Discord pour voir les modifications." "Cyan"
                Write-Color "Ouvrez F12 pour acceder aux parametres Bashcord." "Cyan"
            } else {
                Write-Color "Installation partiellement reussie. Consultez les logs." "Yellow"
            }
            
            Write-Color ""
            Write-Color "Dossier d'installation: $InstallDir" "Gray"
            Write-Color "Logs: $LogFile" "Gray"
            Read-Host "Appuyez sur Entree pour fermer"
        }
        
    } catch {
        Write-Log "Erreur critique: $($_.Exception.Message)"
        if (!$Silent) {
            Write-Color "Erreur critique lors de l'installation!" "Red"
            Write-Color $_.Exception.Message "Red"
            Write-Color "Consultez les logs: $LogFile" "Yellow"
            Read-Host "Appuyez sur Entree pour fermer"
        }
    }
}

# Execution
Main 