const { ipcRenderer } = require('electron');

// État de l'application
let isInstalling = false;
let isUninstalling = false;

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlatformInfo();
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Gestion des onglets
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Écouteurs IPC
    ipcRenderer.on('install-progress', (event, data) => {
        updateProgress(data.progress, data.step);
    });

    ipcRenderer.on('install-output', (event, output) => {
        appendOutput(output);
    });
}

// Chargement des informations de plateforme
async function loadPlatformInfo() {
    try {
        const platformInfo = await ipcRenderer.invoke('get-platform');
        const infoText = `${platformInfo.platform} ${platformInfo.arch} - ${platformInfo.version}`;
        document.getElementById('platformInfo').textContent = infoText;
    } catch (error) {
        console.error('Erreur lors de la récupération des infos de plateforme:', error);
        document.getElementById('platformInfo').textContent = 'Plateforme inconnue';
    }
}

// Gestion des onglets
function switchTab(tabId) {
    // Désactiver tous les onglets
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activer l'onglet sélectionné
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Basculer le sélecteur d'emplacement
function toggleLocationSelector() {
    const checkbox = document.getElementById('installLocation');
    const selector = document.getElementById('locationSelector');
    
    if (checkbox.checked) {
        selector.style.display = 'flex';
    } else {
        selector.style.display = 'none';
        document.getElementById('installPath').value = '';
    }
}

// Sélectionner l'emplacement d'installation
async function selectInstallLocation() {
    try {
        const folderPath = await ipcRenderer.invoke('select-folder');
        if (folderPath) {
            document.getElementById('installPath').value = folderPath;
        }
    } catch (error) {
        console.error('Erreur lors de la sélection du dossier:', error);
        showNotification('Erreur lors de la sélection du dossier', 'error');
    }
}

// Démarrer l'installation
async function startInstallation() {
    if (isInstalling) return;

    const installBtn = document.getElementById('installBtn');
    const progressContainer = document.getElementById('progressContainer');
    const outputContainer = document.getElementById('outputContainer');

    try {
        isInstalling = true;
        
        // Désactiver le bouton et afficher la progression
        installBtn.disabled = true;
        installBtn.innerHTML = '<span class="btn-icon">⏳</span>Installation en cours...';
        progressContainer.style.display = 'block';
        outputContainer.style.display = 'block';

        // Collecter les options d'installation
        const options = {
            location: document.getElementById('installLocation').checked 
                ? document.getElementById('installPath').value 
                : null,
            openAsar: document.getElementById('openAsar').checked,
            autoUpdate: document.getElementById('autoUpdate').checked
        };

        // Vider le journal de sortie
        document.getElementById('installOutput').textContent = '';

        // Démarrer l'installation
        const result = await ipcRenderer.invoke('install-bashcord', options);

        if (result.success) {
            showNotification('Bashcord installé avec succès ! 🎉', 'success');
            updateProgress(100, 'Installation terminée avec succès !');
        } else {
            throw new Error(result.error || 'Erreur d\'installation inconnue');
        }

    } catch (error) {
        console.error('Erreur d\'installation:', error);
        showNotification(`Erreur d'installation: ${error.message}`, 'error');
        updateProgress(0, 'Installation échouée');
    } finally {
        isInstalling = false;
        installBtn.disabled = false;
        installBtn.innerHTML = '<span class="btn-icon">🚀</span>Installer Bashcord';
    }
}

// Démarrer la désinstallation
async function startUninstallation() {
    if (isUninstalling) return;

    const uninstallBtn = document.getElementById('uninstallBtn');

    // Confirmer la désinstallation
    const confirmation = confirm('Êtes-vous sûr de vouloir désinstaller Bashcord ?');
    if (!confirmation) return;

    try {
        isUninstalling = true;
        uninstallBtn.disabled = true;
        uninstallBtn.innerHTML = '<span class="btn-icon">⏳</span>Désinstallation...';

        const result = await ipcRenderer.invoke('uninstall-bashcord');

        if (result.success) {
            showNotification('Bashcord désinstallé avec succès', 'success');
        } else {
            throw new Error(result.error || 'Erreur de désinstallation inconnue');
        }

    } catch (error) {
        console.error('Erreur de désinstallation:', error);
        showNotification(`Erreur de désinstallation: ${error.message}`, 'error');
    } finally {
        isUninstalling = false;
        uninstallBtn.disabled = false;
        uninstallBtn.innerHTML = '<span class="btn-icon">🗑️</span>Désinstaller Bashcord';
    }
}

// Mettre à jour la progression
function updateProgress(percentage, text) {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    progressFill.style.width = `${percentage}%`;
    progressText.textContent = text;
}

// Ajouter du texte au journal de sortie
function appendOutput(output) {
    const outputElement = document.getElementById('installOutput');
    outputElement.textContent += output;
    outputElement.scrollTop = outputElement.scrollHeight;
}

// Ouvrir un lien externe
async function openLink(url) {
    try {
        await ipcRenderer.invoke('open-external', url);
    } catch (error) {
        console.error('Erreur lors de l\'ouverture du lien:', error);
    }
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Styles pour les notifications
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    // Couleurs selon le type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(45deg, #00b894, #00cec9)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(45deg, #d63031, #e17055)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(45deg, #fdcb6e, #f39c12)';
            break;
        default:
            notification.style.background = 'linear-gradient(45deg, #0984e3, #74b9ff)';
    }

    // Ajouter au DOM
    document.body.appendChild(notification);

    // Animation d'entrée
    const slideInKeyframes = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;

    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = slideInKeyframes;
        document.head.appendChild(style);
    }

    // Supprimer après 5 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        notification.style.animationFillMode = 'forwards';
        
        const slideOutKeyframes = `
            @keyframes slideOut {
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        
        const existingStyle = document.querySelector('#notification-styles');
        existingStyle.textContent += slideOutKeyframes;
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);

    // Clic pour fermer
    notification.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

// Fonctions utilitaires
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validation des entrées
function validateInstallOptions() {
    const locationEnabled = document.getElementById('installLocation').checked;
    const installPath = document.getElementById('installPath').value;

    if (locationEnabled && !installPath) {
        showNotification('Veuillez sélectionner un emplacement d\'installation', 'warning');
        return false;
    }

    return true;
} 