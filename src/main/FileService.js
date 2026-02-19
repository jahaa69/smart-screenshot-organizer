const fs = require('fs/promises');
const path = require('path'); // Indispensable pour manipuler les chemins
const os = require('os');

// Dossier source et destination
const SOURCE_DIR = path.join(os.homedir(), 'Pictures', 'Screenshots');
const TARGET_DIR = path.join(SOURCE_DIR, 'Organize');

async function moveFile(fileName) {
  if (!fileName) {
    throw new Error('Aucun nom de fichier fourni');
  }

  // Construction des chemins complets
  const oldFilePath = path.join(SOURCE_DIR, fileName);
  const newFilePath = path.join(TARGET_DIR, fileName);

  try {
    // dossier destination existe
    await fs.mkdir(TARGET_DIR, { recursive: true });

    // Déplacer le fichier
    await fs.rename(oldFilePath, newFilePath);
    
    console.log(`Succes : ${fileName} deplace vers /Organize`);
    return newFilePath;
  } catch (error) {
    console.error(`Erreur lors du deplacement de ${fileName}:`, error.message);
    throw error;
  }
}

module.exports = { moveFile };