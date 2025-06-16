const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Construction de l\'installer Bashcord...\n');

// Vérifier les prérequis
function checkPrerequisites() {
    console.log('📋 Vérification des prérequis...');
    
    try {
        execSync('node --version', { stdio: 'ignore' });
        console.log('✅ Node.js détecté');
    } catch (error) {
        console.error('❌ Node.js non trouvé');
        process.exit(1);
    }
    
    try {
        execSync('npm --version', { stdio: 'ignore' });
        console.log('✅ npm détecté');
    } catch (error) {
        console.error('❌ npm non trouvé');
        process.exit(1);
    }
    
    console.log('');
}

// Créer les assets nécessaires
function createAssets() {
    console.log('🎨 Création des assets...');
    
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Créer une icône basique si elle n'existe pas
    const iconPath = path.join(assetsDir, 'icon.png');
    if (!fs.existsSync(iconPath)) {
        console.log('⚠️  Aucune icône trouvée, création d\'une icône par défaut...');
        // Dans une vraie implémentation, vous ajouteriez une vraie icône ici
        fs.writeFileSync(iconPath, ''); // Fichier vide pour l'exemple
    }
    
    // Créer le logo Bashcord si il n'existe pas
    const logoPath = path.join(assetsDir, 'bashcord-logo.png');
    if (!fs.existsSync(logoPath)) {
        console.log('⚠️  Aucun logo trouvé, création d\'un logo par défaut...');
        fs.writeFileSync(logoPath, ''); // Fichier vide pour l'exemple
    }
    
    console.log('✅ Assets créés');
    console.log('');
}

// Installer les dépendances
function installDependencies() {
    console.log('📦 Installation des dépendances...');
    
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dépendances installées');
    } catch (error) {
        console.error('❌ Erreur lors de l\'installation des dépendances');
        process.exit(1);
    }
    
    console.log('');
}

// Builder l'application
function buildApplication() {
    console.log('🔨 Construction de l\'application...');
    
    const platform = process.platform;
    const arch = process.arch;
    
    console.log(`📱 Plateforme détectée: ${platform} (${arch})`);
    
    try {
        // Build pour la plateforme actuelle
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✅ Application construite avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de la construction');
        process.exit(1);
    }
    
    console.log('');
}

// Afficher les informations de fin
function showCompletionInfo() {
    console.log('🎉 Construction terminée avec succès !\n');
    
    console.log('📁 Fichiers générés dans le dossier "dist/"');
    console.log('🚀 Pour tester l\'installer, utilisez: npm start');
    console.log('📦 Pour distribuer, utilisez les fichiers dans dist/\n');
    
    // Afficher la taille des fichiers générés
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
        console.log('📊 Taille des fichiers générés:');
        const files = fs.readdirSync(distDir);
        files.forEach(file => {
            const filePath = path.join(distDir, file);
            const stats = fs.statSync(filePath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`   - ${file}: ${sizeInMB} MB`);
        });
    }
    
    console.log('\n💜 Bashcord Installer prêt à être utilisé !');
}

// Exécution principale
async function main() {
    try {
        checkPrerequisites();
        createAssets();
        installDependencies();
        buildApplication();
        showCompletionInfo();
    } catch (error) {
        console.error('\n❌ Erreur lors de la construction:', error.message);
        process.exit(1);
    }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Script de construction Bashcord Installer

Usage: node build.js [options]

Options:
  --help, -h     Afficher this message
  --clean        Nettoyer avant la construction
  --all          Construire pour toutes les plateformes

Examples:
  node build.js
  node build.js --clean
  node build.js --all
    `);
    process.exit(0);
}

if (args.includes('--clean')) {
    console.log('🧹 Nettoyage des fichiers de construction...');
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
        console.log('✅ Nettoyage terminé\n');
    }
}

if (args.includes('--all')) {
    console.log('🌍 Construction pour toutes les plateformes...');
    // Dans la fonction buildApplication, on utiliserait npm run build-all
}

main(); 