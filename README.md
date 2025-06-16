# 🚀 Bashcord Installer v1.1

Un installer graphique cross-platform pour **Bashcord**, le client Discord le plus mignon mais fait par Ba$h ! 💜

![Bashcord Logo](assets/bashcord-logo.png)

## ✨ Fonctionnalités

-   🖥️ **Interface graphique moderne** avec design glassmorphism
-   🌍 **Cross-platform** : Windows, macOS, Linux
-   🎯 **Installation automatique** via Equilotl modifié
-   ⚙️ **Options d'installation personnalisables**
-   🔄 **Mise à jour automatique** de Bashcord
-   🗑️ **Désinstallation facile**
-   📊 **Suivi en temps réel** de l'installation

## 🎨 Aperçu

L'installer Bashcord offre une expérience utilisateur moderne avec :

-   Onglets intuitifs (Installation, Désinstallation, À propos)
-   Barre de progression en temps réel
-   Journal d'installation détaillé
-   Notifications élégantes
-   Thème sombre avec effets visuels

## 📦 Installation

### Téléchargement des releases

Téléchargez la dernière version pour votre plateforme :

-   **Windows** : `Bashcord-Installer-1.1.0.exe`
-   **macOS** : `Bashcord-Installer-1.1.0.dmg`
-   **Linux** : `Bashcord-Installer-1.1.0.AppImage`

### Compilation depuis les sources

#### Prérequis

-   Node.js 18+ et npm
-   Git

#### Étapes

```bash
# Cloner le repository
git clone https://github.com/roothheo/Bashcord-1.1.git
cd Bashcord-1.1/bashcord-installer

# Installer les dépendances
npm install

# Lancer en mode développement
npm start

# Compiler pour votre plateforme
npm run build

# Compiler pour toutes les plateformes
npm run build-all
```

## 🚀 Utilisation

### Installation de Bashcord

1. **Lancez l'installer** Bashcord
2. **Choisissez vos options** :
    - Emplacement d'installation personnalisé (optionnel)
    - Installation d'OpenAsar pour de meilleures performances
    - Mise à jour automatique
3. **Cliquez sur "Installer Bashcord"**
4. **Attendez la fin** de l'installation
5. **Profitez de Bashcord** ! 🎉

### Désinstallation

1. **Allez dans l'onglet "Désinstallation"**
2. **Cliquez sur "Désinstaller Bashcord"**
3. **Confirmez l'action**
4. **Bashcord sera supprimé** de votre client Discord

## 🔧 Architecture technique

### Composants principaux

-   **main.js** : Processus principal Electron
-   **renderer.js** : Logique de l'interface utilisateur
-   **bashcord-patcher.js** : Module de patch pour Equilotl
-   **index.html** : Interface utilisateur
-   **styles.css** : Styles et animations

### Fonctionnement

1. **Téléchargement** automatique d'Equilotl selon la plateforme
2. **Patch** d'Equilotl pour pointer vers le repository Bashcord
3. **Exécution** de l'installation avec les paramètres spécifiés
4. **Nettoyage** automatique des fichiers temporaires

## 🌟 Fonctionnalités de Bashcord

-   ✨ **+200 plugins exclusifs** personnalisés par Ba$h
-   🎨 **Interface améliorée** avec design personnalisé
-   ⚡ **Performances accrues** et optimisations
-   🔒 **Open Source** sur GitHub
-   🛡️ **Sécurisé** et régulièrement mis à jour

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créez** votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. **Committez** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrez** une Pull Request

## 📝 Licence

Ce projet est sous licence GPL-3.0. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## ⚠️ Avertissement

-   **Bashcord n'est pas affilié à Discord Inc.**
-   L'utilisation de mods clients viole les conditions d'utilisation de Discord
-   Utilisez à vos propres risques
-   Aucun cas connu de bannissement pour l'usage de Bashcord

## 💬 Support

-   **GitHub Issues** : [Signaler un problème](https://github.com/roothheo/Bashcord-1.1/issues)
-   **Discord** : [Serveur Bashcord](https://discord.gg/bashcord)
-   **Documentation** : [Wiki](https://github.com/roothheo/Bashcord-1.1/wiki)

## 🎉 Crédits

-   **Ba$h** - Créateur de Bashcord
-   **Équipe Equicord** - Base Equilotl
-   **Communauté** - Tests et feedback

---

<div align="center">
  <strong>Made with 💜 by Ba$h</strong>
  <br>
  <i>Le client Discord le plus mignon mais personnalisé !</i>
</div>
