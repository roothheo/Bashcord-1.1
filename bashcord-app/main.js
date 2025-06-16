const { app, BrowserWindow, shell, Menu, ipcMain, session, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// Configuration
const isDev = process.argv.includes('--dev');
const DISCORD_URL = 'https://discord.com/app';

let mainWindow = null;

// Configuration sécurisée
function configureSession() {
    // CSP sécurisé mais permettant Discord
    session.defaultSession.webSecurity = false;
    
    // Headers personnalisés pour Bashcord
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        if (details.url.includes('discord.com')) {
            callback({});
        } else {
            callback({});
        }
    });

    // Injection du script Bashcord
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        if (details.url.includes('discord.com')) {
            const headers = details.responseHeaders || {};
            
            // Permettre l'injection de scripts
            delete headers['content-security-policy'];
            delete headers['content-security-policy-report-only'];
            
            callback({ responseHeaders: headers });
        } else {
            callback({});
        }
    });
}

// Création de la fenêtre principale
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        show: false,
        title: 'Bashcord'
    });

    // Chargement de Discord
    mainWindow.loadURL(DISCORD_URL);

    // Afficher la fenêtre une fois prête
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Gestion des liens externes
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Injection du code Bashcord
    mainWindow.webContents.on('dom-ready', () => {
        injectBashcord();
    });

    // Gestion de la fermeture
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    return mainWindow;
}

// Injection du code Bashcord
function injectBashcord() {
    if (!mainWindow) return;

    try {
        // Chemin vers le build Bashcord
        const bashcordPath = path.join(__dirname, '..', 'dist', 'browser.js');
        
        if (fs.existsSync(bashcordPath)) {
            const bashcordCode = fs.readFileSync(bashcordPath, 'utf8');
            
            // Injection du code
            mainWindow.webContents.executeJavaScript(`
                (function() {
                    console.log('[Bashcord] Injection démarrée...');
                    ${bashcordCode}
                    console.log('[Bashcord] Injection terminée !');
                })();
            `).catch(console.error);
        } else {
            console.warn('[Bashcord] Fichier browser.js introuvable, construction nécessaire');
            
            // Code de fallback basique
            mainWindow.webContents.executeJavaScript(`
                console.log('[Bashcord] Mode fallback - Build requis');
                document.title = 'Bashcord - Build requis';
            `);
        }
    } catch (error) {
        console.error('[Bashcord] Erreur injection:', error);
    }
}

// Menu de l'application
function createMenu() {
    const template = [
        {
            label: 'Bashcord',
            submenu: [
                {
                    label: 'À propos de Bashcord',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'À propos de Bashcord',
                            message: 'Bashcord v1.1.0',
                            detail: 'The other cutest Discord client mod but made by Ba$h\\n\\nBasé sur Equicord/Vencord'
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: 'Recharger',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => mainWindow?.reload()
                },
                {
                    label: 'Forcer le rechargement',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => mainWindow?.webContents.reloadIgnoringCache()
                },
                { type: 'separator' },
                {
                    label: 'Outils de développement',
                    accelerator: 'F12',
                    click: () => mainWindow?.webContents.toggleDevTools()
                },
                { type: 'separator' },
                {
                    label: 'Quitter',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => app.quit()
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template[0].submenu.splice(1, 0, {
            label: 'Masquer Bashcord',
            accelerator: 'Command+H',
            role: 'hide'
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Gestion des événements de l'app
app.whenReady().then(() => {
    configureSession();
    createMainWindow();
    createMenu();

    // Gestionnaire d'activation (macOS)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });

    // Vérification des mises à jour
    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
    }
});

// Fermeture de l'app
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Empêcher la navigation vers des sites externes
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (navigationEvent, url) => {
        if (!url.includes('discord.com') && !url.includes('discordapp.com')) {
            navigationEvent.preventDefault();
            shell.openExternal(url);
        }
    });
});

// Auto-updater
autoUpdater.on('checking-for-update', () => {
    console.log('[Bashcord] Vérification des mises à jour...');
});

autoUpdater.on('update-available', (info) => {
    console.log('[Bashcord] Mise à jour disponible:', info);
});

autoUpdater.on('update-not-available', (info) => {
    console.log('[Bashcord] Aucune mise à jour disponible:', info);
});

autoUpdater.on('error', (err) => {
    console.error('[Bashcord] Erreur auto-updater:', err);
});

// IPC handlers
ipcMain.handle('bashcord-info', () => {
    return {
        version: '1.1.0',
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node
    };
});

console.log('[Bashcord] Application démarrée en mode:', isDev ? 'développement' : 'production'); 