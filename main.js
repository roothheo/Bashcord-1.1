const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const os = require('os');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        title: 'Bashcord Installer v1.1',
        resizable: false,
        center: true,
        show: false
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

// Détection de la plateforme
function getPlatform() {
    const platform = os.platform();
    if (platform === 'win32') return 'windows';
    if (platform === 'darwin') return 'macos';
    if (platform === 'linux') return 'linux';
    return 'unknown';
}

// Téléchargement d'Equilotl
async function downloadEquilotl(platform) {
    const releases = 'https://api.github.com/repos/Equicord/Equilotl/releases/latest';
    
    try {
        const response = await fetch(releases);
        const data = await response.json();
        
        let assetName = '';
        switch(platform) {
            case 'windows':
                assetName = 'Equilotl.exe';
                break;
            case 'macos':
                assetName = 'Equilotl.MacOS.zip';
                break;
            case 'linux':
                assetName = 'Equilotl-x11';
                break;
        }
        
        const asset = data.assets.find(a => a.name === assetName);
        if (!asset) throw new Error(`Asset non trouvé pour ${platform}`);
        
        return asset.browser_download_url;
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des releases: ${error.message}`);
    }
}

// Installation de Bashcord
ipcMain.handle('install-bashcord', async (event, options) => {
    const BashcordPatcher = require('./bashcord-patcher');
    const patcher = new BashcordPatcher();
    
    try {
        // Étape 1: Initialisation
        event.sender.send('install-progress', { step: 'Initialisation...', progress: 10 });
        
        // Étape 2: Téléchargement d'Equilotl
        event.sender.send('install-progress', { step: 'Téléchargement d\'Equilotl...', progress: 30 });
        
        // Étape 3: Configuration pour Bashcord
        event.sender.send('install-progress', { step: 'Configuration pour Bashcord...', progress: 50 });
        
        // Étape 4: Installation
        event.sender.send('install-progress', { step: 'Installation de Bashcord...', progress: 70 });
        
        // Utiliser notre patcher personnalisé
        const result = await patcher.installBashcord(options);
        
        // Étape 5: Finalisation
        event.sender.send('install-progress', { step: 'Installation terminée !', progress: 100 });
        
        return { success: true, output: result.output };
        
    } catch (error) {
        console.error('Erreur d\'installation:', error);
        event.sender.send('install-progress', { step: 'Erreur d\'installation', progress: 0 });
        return { success: false, error: error.message };
    }
});

// Désinstallation
ipcMain.handle('uninstall-bashcord', async (event) => {
    const BashcordPatcher = require('./bashcord-patcher');
    const patcher = new BashcordPatcher();
    
    try {
        event.sender.send('install-progress', { step: 'Désinstallation en cours...', progress: 50 });
        
        const result = await patcher.uninstallBashcord();
        
        event.sender.send('install-progress', { step: 'Désinstallation terminée !', progress: 100 });
        
        return { success: true, output: result.output };
        
    } catch (error) {
        console.error('Erreur de désinstallation:', error);
        return { success: false, error: error.message };
    }
});

// Ouvrir un lien externe
ipcMain.handle('open-external', (event, url) => {
    shell.openExternal(url);
});

// Sélectionner un dossier
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    
    return result.canceled ? null : result.filePaths[0];
});

// Obtenir la plateforme
ipcMain.handle('get-platform', () => {
    return {
        platform: getPlatform(),
        arch: os.arch(),
        version: os.release()
    };
}); 