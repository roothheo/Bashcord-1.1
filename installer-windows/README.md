# 🚀 Bashcord Auto-Installer pour Windows

**Installation automatique complète de Bashcord en un clic !**

## ✨ Caractéristiques

-   ✅ **Installation automatique** de toutes les dépendances
-   ✅ **Git, Node.js, pnpm** installés automatiquement
-   ✅ **Clone et build** automatique du projet
-   ✅ **Interface conviviale** pour choisir quel Discord patcher
-   ✅ **Support multi-Discord** (Stable, Canary, PTB, Development)
-   ✅ **Logs détaillés** pour le debugging
-   ✅ **Désinstallation incluse**

## 🎯 Utilisation

### Installation simple (Recommandée)

1. **Téléchargez** `install-bashcord.bat`
2. **Clic droit** → "Exécuter en tant qu'administrateur"
3. **Suivez les instructions** à l'écran
4. **Choisissez** quel Discord patcher
5. **Redémarrez Discord** et profitez !

### Installation avancée (PowerShell)

```powershell
# Installation normale
.\install-bashcord.ps1

# Installation silencieuse (patch tous les Discord)
.\install-bashcord.ps1 -Silent

# Désinstallation
.\install-bashcord.ps1 -Uninstall
```

## 📋 Prérequis

-   **Windows 10/11** (64-bit)
-   **Privilèges administrateur** (requis pour Chocolatey)
-   **Connexion internet** active
-   **Discord installé** (Stable, Canary, PTB ou Development)

## 🔧 Ce que fait l'installer

1. **📦 Installe Chocolatey** (gestionnaire de paquets Windows)
2. **⬇️ Installe Git** (pour cloner le repository)
3. **⬇️ Installe Node.js v20** (runtime JavaScript)
4. **⬇️ Installe pnpm** (gestionnaire de dépendances)
5. **📥 Clone Bashcord** depuis GitHub
6. **🔨 Build le projet** (`pnpm install` + `pnpm build`)
7. **🎯 Injection** dans Discord(s) choisi(s)

## 📁 Structure des fichiers

```
%USERPROFILE%\Bashcord\         # Dossier d'installation
├── src/                        # Code source Bashcord
├── dist/                       # Fichiers buildés
├── node_modules/               # Dépendances Node.js
├── installer.log              # Logs d'installation
└── ...                        # Autres fichiers du projet
```

## 🎮 Discord supportés

-   **Discord Stable** (`%LOCALAPPDATA%\Discord`)
-   **Discord Canary** (`%LOCALAPPDATA%\DiscordCanary`)
-   **Discord PTB** (`%LOCALAPPDATA%\DiscordPTB`)
-   **Discord Development** (`%LOCALAPPDATA%\DiscordDevelopment`)

## 🗑️ Désinstallation

```batch
# Via le fichier batch
install-bashcord.bat

# Ou directement en PowerShell
.\install-bashcord.ps1 -Uninstall
```

## 🐛 Résolution de problèmes

### Erreur "Execution Policy"

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erreur "Chocolatey installation failed"

-   Vérifiez votre connexion internet
-   Exécutez en tant qu'administrateur
-   Désactivez temporairement l'antivirus

### Discord non détecté

-   Assurez-vous que Discord est installé
-   Redémarrez l'installer après installation de Discord
-   Vérifiez les chemins dans les logs

### Échec du build

-   Vérifiez que Node.js est correctement installé
-   Supprimez `%USERPROFILE%\Bashcord` et relancez
-   Consultez `%USERPROFILE%\Bashcord\installer.log`

## 📝 Logs

Les logs détaillés sont disponibles dans :
**`%USERPROFILE%\Bashcord\installer.log`**

## 💡 Conseils

-   **Fermez Discord** avant l'installation
-   **Redémarrez Discord** après l'installation
-   **Ouvrez F12** pour accéder aux paramètres Bashcord
-   **Sauvegardez** vos paramètres Discord avant installation

## ⚠️ Avertissements

-   ✋ **Ferme Discord** avant l'installation
-   🛡️ **Sauvegarde automatique** de `app.asar`
-   🔄 **Mise à jour** : relancez l'installer
-   ⚖️ **Utilisation** à vos risques et périls

## 🆘 Support

-   **GitHub Issues** : https://github.com/roothheo/Bashcord/issues
-   **Logs** : Consultez `installer.log` pour diagnostic

---

**Made with ❤️ by Ba$h**  
_The other cutest Discord client mod_
