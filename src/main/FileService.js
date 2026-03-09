const fs = require('fs/promises');
const path = require('path'); // Indispensable pour manipuler les chemins
const os = require('os');

// Dossier source et destination
const SOURCE_DIR = path.join(os.homedir(), 'Pictures', 'Screenshots');
const TARGET_DIR = path.join(SOURCE_DIR, 'Organize');

function inferCategoryFromName(fileName) {
  const base  = fileName.replace(/\.[^.]+$/, '');
  const parts = base.split('_');
  const suffix = parts[parts.length - 1];
  const knownCategories = ['Chrome', 'Firefox', 'Code', 'Terminal', 'Other'];
  if (knownCategories.includes(suffix)) return suffix;
  return 'Other';
}

async function ensureTargetDirExists() {
  await fs.mkdir(TARGET_DIR, { recursive: true });
}

async function moveFile(fileName) {
  if (!fileName) {
    throw new Error('Aucun nom de fichier fourni');
  }

  const oldFilePath = path.join(SOURCE_DIR, fileName);
  const newFilePath = path.join(TARGET_DIR, fileName);

  try {
    await ensureTargetDirExists();
    await fs.rename(oldFilePath, newFilePath);
    
    console.log(`Succes : ${fileName} deplace vers /Organize`);
    return newFilePath;
  } catch (error) {
    console.error(`Erreur lors du deplacement de ${fileName}:`, error.message);
    throw error;
  }
}

async function listOrganizedFiles() {
  try {
    await ensureTargetDirExists();
    const entries = await fs.readdir(TARGET_DIR, { withFileTypes: true });

    const files = entries.filter(e => e.isFile());

    const result = [];
    for (const entry of files) {
      const fullPath = path.join(TARGET_DIR, entry.name);
      const stat = await fs.stat(fullPath);
      const iso = stat.mtime.toISOString();

      result.push({
        name: entry.name,
        category: inferCategoryFromName(entry.name),
        dateTaken: iso,
        modified: iso,
        size: stat.size,
        tags: [],
      });
    }

    return result;
  } catch (error) {
    console.error('Erreur lors de la lecture du dossier Organize:', error.message);
    return [];
  }
}

module.exports = { moveFile, listOrganizedFiles };