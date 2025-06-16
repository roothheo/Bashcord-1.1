const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Script de patch pour Equilotl afin de l'adapter à Bashcord
 */
class BashcordPatcher {
    constructor() {
        this.BASHCORD_REPO = 'https://github.com/roothheo/Bashcord-1.1.git';
        this.BASHCORD_BRANCH = 'bashcord-custom';
        this.tempDir = os.tmpdir();
        this.platform = this.getPlatform();
    }

    getPlatform() {
        const platform = os.platform();
        if (platform === 'win32') return 'windows';
        if (platform === 'darwin') return 'macos';
        if (platform === 'linux') return 'linux';
        return 'unknown';
    }

    /**
     * Télécharge et modifie Equilotl pour Bashcord
     */
    async downloadAndPatchEquilotl() {
        try {
            console.log('🔄 Téléchargement d\'Equilotl...');
            const equilotlUrl = await this.getEquilotlDownloadUrl();
            const equilotlPath = await this.downloadFile(equilotlUrl);
            
            console.log('🔧 Patch d\'Equilotl pour Bashcord...');
            const patchedPath = await this.patchEquilotl(equilotlPath);
            
            return patchedPath;
        } catch (error) {
            throw new Error(`Erreur lors du patch d'Equilotl: ${error.message}`);
        }
    }

    /**
     * Obtient l'URL de téléchargement d'Equilotl selon la plateforme
     */
    async getEquilotlDownloadUrl() {
        const response = await fetch('https://api.github.com/repos/Equicord/Equilotl/releases/latest');
        const data = await response.json();
        
        let assetName = '';
        switch(this.platform) {
            case 'windows':
                assetName = 'Equilotl.exe';
                break;
            case 'macos':
                assetName = 'Equilotl.MacOS.zip';
                break;
            case 'linux':
                assetName = 'Equilotl-x11';
                break;
            default:
                throw new Error(`Plateforme non supportée: ${this.platform}`);
        }
        
        const asset = data.assets.find(a => a.name === assetName);
        if (!asset) {
            throw new Error(`Asset non trouvé pour ${this.platform}: ${assetName}`);
        }
        
        return asset.browser_download_url;
    }

    /**
     * Télécharge un fichier depuis une URL
     */
    async downloadFile(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const filename = path.basename(new URL(url).pathname);
        const filePath = path.join(this.tempDir, `bashcord-${filename}`);
        
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        
        // Rendre exécutable sur Unix
        if (this.platform !== 'windows') {
            fs.chmodSync(filePath, '755');
        }
        
        return filePath;
    }

    /**
     * Patch Equilotl pour utiliser le repo Bashcord
     */
    async patchEquilotl(equilotlPath) {
        // Pour l'instant, on retourne juste le chemin
        // Dans une implémentation complète, on pourrait :
        // 1. Désassembler le binaire
        // 2. Remplacer les URLs hardcodées
        // 3. Réassembler le binaire
        
        // Solution alternative : créer un wrapper script
        return this.createBashcordWrapper(equilotlPath);
    }

    /**
     * Crée un wrapper pour rediriger vers Bashcord
     */
    createBashcordWrapper(equilotlPath) {
        const wrapperPath = path.join(this.tempDir, `bashcord-installer${this.platform === 'windows' ? '.exe' : ''}`);
        
        if (this.platform === 'windows') {
            // Créer un script batch pour Windows
            const batchContent = `@echo off
echo Installation de Bashcord...
set EQUICORD_REPO=${this.BASHCORD_REPO}
set EQUICORD_BRANCH=${this.BASHCORD_BRANCH}
"${equilotlPath}" %*
`;
            const batchPath = path.join(this.tempDir, 'bashcord-installer.bat');
            fs.writeFileSync(batchPath, batchContent);
            return batchPath;
        } else {
            // Créer un script shell pour Unix
            const shellContent = `#!/bin/bash
echo "Installation de Bashcord..."
export EQUICORD_REPO="${this.BASHCORD_REPO}"
export EQUICORD_BRANCH="${this.BASHCORD_BRANCH}"
"${equilotlPath}" "$@"
`;
            fs.writeFileSync(wrapperPath, shellContent);
            fs.chmodSync(wrapperPath, '755');
            return wrapperPath;
        }
    }

    /**
     * Installe Bashcord avec les options spécifiées
     */
    async installBashcord(options = {}) {
        try {
            console.log('🚀 Début de l\'installation de Bashcord...');
            
            // Télécharger et patcher Equilotl
            const patchedEquilotl = await this.downloadAndPatchEquilotl();
            
            // Préparer les arguments d'installation
            const args = ['--install'];
            
            if (options.location) {
                args.push('--location', options.location);
            }
            
            if (options.openAsar) {
                args.push('--openasar');
            }

            // Variables d'environnement pour Bashcord
            const env = {
                ...process.env,
                EQUICORD_REPO: this.BASHCORD_REPO,
                EQUICORD_BRANCH: this.BASHCORD_BRANCH,
                BASHCORD_MODE: 'true'
            };

            console.log('📦 Exécution de l\'installation...');
            
            return new Promise((resolve, reject) => {
                const { spawn } = require('child_process');
                const child = spawn(patchedEquilotl, args, {
                    env,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let output = '';
                let errorOutput = '';

                child.stdout.on('data', (data) => {
                    const text = data.toString();
                    output += text;
                    console.log('STDOUT:', text);
                });

                child.stderr.on('data', (data) => {
                    const text = data.toString();
                    errorOutput += text;
                    console.error('STDERR:', text);
                });

                child.on('close', (code) => {
                    // Nettoyer les fichiers temporaires
                    this.cleanup(patchedEquilotl);
                    
                    if (code === 0) {
                        console.log('✅ Installation de Bashcord terminée avec succès !');
                        resolve({ success: true, output });
                    } else {
                        console.error(`❌ Installation échouée avec le code ${code}`);
                        reject(new Error(`Installation échouée: ${errorOutput || 'Code de sortie: ' + code}`));
                    }
                });

                child.on('error', (error) => {
                    this.cleanup(patchedEquilotl);
                    reject(error);
                });
            });

        } catch (error) {
            throw new Error(`Erreur d'installation Bashcord: ${error.message}`);
        }
    }

    /**
     * Désinstalle Bashcord
     */
    async uninstallBashcord() {
        try {
            console.log('🗑️ Désinstallation de Bashcord...');
            
            const patchedEquilotl = await this.downloadAndPatchEquilotl();
            
            const env = {
                ...process.env,
                EQUICORD_REPO: this.BASHCORD_REPO,
                EQUICORD_BRANCH: this.BASHCORD_BRANCH,
                BASHCORD_MODE: 'true'
            };

            return new Promise((resolve, reject) => {
                const { spawn } = require('child_process');
                const child = spawn(patchedEquilotl, ['--uninstall'], {
                    env,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let output = '';

                child.stdout.on('data', (data) => {
                    output += data.toString();
                });

                child.on('close', (code) => {
                    this.cleanup(patchedEquilotl);
                    
                    if (code === 0) {
                        console.log('✅ Désinstallation terminée avec succès !');
                        resolve({ success: true, output });
                    } else {
                        reject(new Error(`Désinstallation échouée avec le code ${code}`));
                    }
                });

                child.on('error', (error) => {
                    this.cleanup(patchedEquilotl);
                    reject(error);
                });
            });

        } catch (error) {
            throw new Error(`Erreur de désinstallation: ${error.message}`);
        }
    }

    /**
     * Nettoie les fichiers temporaires
     */
    cleanup(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('🧹 Fichiers temporaires nettoyés');
            }
        } catch (error) {
            console.warn('Avertissement: Impossible de nettoyer le fichier temporaire:', error.message);
        }
    }
}

module.exports = BashcordPatcher; 